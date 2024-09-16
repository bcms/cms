import type { Collection, Filter } from 'mongodb';
import type { Module } from '@thebcms/selfhosted-backend/_server/module';
import { Logger } from '@thebcms/selfhosted-backend/_server/logger';
import type { MongoDBEntry } from '@thebcms/selfhosted-backend/_server/modules/mongodb/entry';
import type { Queue } from '@thebcms/selfhosted-utils/queue';
import { MemCache } from '@thebcms/selfhosted-utils/mem-cache';
import type { ObjectSchema } from '@thebcms/selfhosted-utils/object-utility';

/**
 * MongoDB repository methods.
 */
export interface MongoDBRepository<Entry extends MongoDBEntry, Methods> {
    init(): Module;
    collection: string;
    /**
     * Custom repository methods.
     */
    methods: Methods;
    manyQueue: {
        [key: string]: Queue<Entry[]>;
    };
    singleQueue: {
        [key: string]: Queue<Entry>;
    };
    latches: {
        [name: string]: boolean;
    };
    cache: MemCache<Entry>;
    // /**
    //  * Will return the first entity which matches the query.
    //  */
    // findBy(query: Filter<Entry>): Promise<Entry | null>;
    // /**
    //  * Will return all entities which match the query.
    //  */
    // findAllBy(query: Filter<Entry>): Promise<Entry[]>;
    /**
     * Will return all entities in the database.
     */
    findAll(): Promise<Entry[]>;
    /**
     * Will return all entities with matching IDs.
     */
    findAllById(ids: ReadonlyArray<string>): Promise<Entry[]>;
    /**
     * Will return en entity with the specified ID.
     */
    findById(id: string): Promise<Entry | null>;
    /**
     * Add new entity to the database. If ID is not available, it will be
     * automatically created. `createdAt` and `updatedAt` properties will be
     * overwritten.
     */
    add(entity: Entry, manualCU?: boolean): Promise<Entry>;
    /**
     * Add many new entities to the database. If ID is not available in entity,
     * it will be automatically created. `createdAt` and `updatedAt` properties
     * will be overwritten.
     */
    addMany(entities: Entry[], manualCU?: boolean): Promise<Entry[]>;
    /**
     * Update existing entity in the database. `createdAt` and `updatedAt`
     * properties will be overwritten.
     */
    update(entity: Entry, manualCU?: boolean): Promise<Entry>;
    /**
     * Update existing entities in the database. `createdAt` and `updatedAt`
     * properties will be overwritten.
     */
    updateMany(entities: Entry[], manualCU?: boolean): Promise<Entry[]>;
    /**
     * Delete an entity with the specified ID.
     */
    deleteById(id: string): Promise<boolean>;
    /**
     * Delete all entities with matching IDs.
     */
    deleteAllById(ids: string[]): Promise<boolean>;
    // /**
    //  * Delete a first entity which matches the query.
    //  */
    // deleteOne(query: Filter<Entry>): Promise<boolean>;
    /**
     * Return number of entities.
     */
    count(): Promise<number>;
}

/**
 * Configuration object for creating MongoDB repository.
 */
export interface MongoDBRepositoryConfig<Entry extends MongoDBEntry, Methods> {
    /**
     * Name of the repository. Used for organizing logs and errors.
     */
    name: string;
    /**
     * Schema which all entities written to the database must follow.
     */
    schema: ObjectSchema;
    /**
     * Name of the collection the entities will be saved.
     * For example: `users`
     */
    collection: string;
    /**
     * Custom repository methods.
     */
    methods?(data: {
        /**
         * Repository name (specified in `config`).
         */
        name: string;
        /**
         * Repository schema (specified in `config`).
         */
        schema: ObjectSchema;
        /**
         * Repository collection name (specified in `config`).
         */
        collection: string;
        /**
         * Repository itself. Useful for accessing default methods.
         */
        repo: MongoDBRepository<Entry, unknown>;
        /**
         * Repository logger.
         */
        logger: Logger;
        mdb: Collection<Entry>;
        cache: MemCache<Entry>;
    }): Methods;
}

export function createMongoDBRepository<
    Entry extends MongoDBEntry,
    Methods = unknown,
>(
    config: MongoDBRepositoryConfig<Entry, Methods>,
): MongoDBRepository<Entry, Methods> {
    const logger = new Logger(config.name);
    let intf: Collection<Entry> = null as never;

    const self: MongoDBRepository<Entry, Methods> = {
        collection: config.collection,
        methods: undefined as never,
        manyQueue: {},
        singleQueue: {},
        latches: {},
        cache: new MemCache<Entry>('_id', []),
        init() {
            return {
                name: config.name,
                initialize({ next, fastify }) {
                    if (!fastify.mongo.db) {
                        next(
                            new Error(
                                'Fastify MongoDB instance is not available.',
                            ),
                        );
                        return;
                    }
                    intf = fastify.mongo.db.collection(config.collection);
                    if (config.methods) {
                        self.methods = config.methods({
                            name: config.name,
                            collection: config.collection,
                            schema: config.schema,
                            repo: self,
                            logger,
                            mdb: intf,
                            cache: self.cache,
                        });
                    }
                    next();
                },
            };
        },

        // async findBy(query) {
        //     return (await intf.findOne(query)) as Entry | null;
        // },
        //
        // async findAllBy(query) {
        //     return (await intf.find(query).toArray()) as Entry[];
        // },

        async findAll() {
            if (self.latches.all) {
                return self.cache.items;
            }
            const result = (await intf.find().toArray()) as Entry[];
            self.cache.set(result);
            return result;
        },

        async findById(id) {
            const cacheHit = self.cache.findById(id);
            if (cacheHit) {
                return cacheHit;
            }
            const result = (await intf.findOne({
                _id: id,
            } as Filter<Entry>)) as Entry | null;
            if (result) {
                this.cache.set(result);
            }
            return result;
        },

        async findAllById(ids) {
            const cacheHits: Entry[] = self.cache.findManyById(ids);
            if (cacheHits.length === ids.length) {
                return cacheHits;
            }
            const missingIds: string[] = [];
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                if (!cacheHits.find((e) => e._id === id)) {
                    missingIds.push(id);
                }
            }
            const result = (await intf
                .find({
                    _id: { $in: missingIds },
                } as Filter<Entry>)
                .toArray()) as Entry[];
            self.cache.set(result);
            return [...cacheHits, ...result];
        },

        async add(entry, manualCU) {
            if (!manualCU) {
                entry.createdAt = Date.now();
                entry.updatedAt = Date.now();
            }
            await intf.insertOne(entry as never);
            this.cache.set(entry);
            return entry;
        },

        async addMany(entries, manualCU) {
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                if (!manualCU) {
                    entry.createdAt = Date.now();
                    entry.updatedAt = Date.now();
                }
            }
            await intf.insertMany(entries as never[]);
            this.cache.set(entries);
            return entries;
        },

        async update(entry, manualCU) {
            if (!manualCU) {
                entry.updatedAt = Date.now();
            }
            await intf.updateOne({ _id: entry._id } as Filter<Entry>, {
                $set: entry,
            });
            self.cache.set(entry);
            return entry;
        },

        async updateMany(entries, manualCU) {
            const output: Entry[] = [];
            for (let i = 0; i < entries.length; i++) {
                output.push(await self.update(entries[i], manualCU));
            }
            self.cache.set(output);
            return output;
        },

        async deleteById(id) {
            const result = await intf.deleteOne({ _id: id } as Filter<Entry>);
            self.cache.remove(id);
            return result.deletedCount === 1;
        },

        async deleteAllById(ids) {
            const result = await intf.deleteMany({
                _id: { $in: ids },
            } as Filter<Entry>);
            self.cache.remove(ids);
            return result.deletedCount === ids.length;
        },

        async count() {
            return await intf.countDocuments();
        },
    };
    return self;
}

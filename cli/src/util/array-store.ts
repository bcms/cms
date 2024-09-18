import type { ArrayStore, StoreMethods } from '@bcms/selfhosted-sdk/store';

export function createArrayStore<ItemType, Methods = unknown>(
    idKey: keyof ItemType,
    initItems?: ItemType[],
    methods?: StoreMethods<ItemType, Methods>,
) {
    let store: ItemType[] = initItems || [];

    const self: ArrayStore<ItemType, Methods> = {
        items() {
            return store as ItemType[];
        },

        find(query) {
            for (let i = 0; i < store.length; i++) {
                const item = store[i];
                if (query(item as ItemType)) {
                    return item as ItemType;
                }
            }
            return null;
        },

        findById(id) {
            const output = store.find((e) => e[idKey as never] === id);
            return (output as ItemType) || null;
        },

        findMany(query) {
            const output: ItemType[] = [];
            for (let i = 0; i < store.length; i++) {
                const item = store[i];
                if (query(item as ItemType)) {
                    output.push(store[i] as ItemType);
                }
            }
            return output;
        },

        findManyById(ids) {
            return store.filter((e) =>
                ids.includes(e[idKey as never]),
            ) as ItemType[];
        },

        set(inputItems) {
            const items =
                inputItems instanceof Array ? inputItems : [inputItems];
            for (let i = 0; i < items.length; i++) {
                const inputItem = items[i];
                let found = false;
                for (let j = 0; j < store.length; j++) {
                    const storeItem = store[j];
                    if (storeItem[idKey as never] === inputItem[idKey]) {
                        found = true;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        store.splice(j, 1, inputItem as any);
                        break;
                    }
                }
                if (!found) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    store.push(inputItem as any);
                }
            }
        },

        remove(inputIds) {
            const ids = inputIds instanceof Array ? inputIds : [inputIds];
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                for (let j = 0; j < store.length; j++) {
                    const item = store[j];
                    if (item[idKey as never] === id) {
                        store.splice(j, 1);
                    }
                }
            }
        },

        clear() {
            store = [];
        },

        methods: {} as never,
    };
    if (methods) {
        self.methods = methods(self);
    }

    return self;
}

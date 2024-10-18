import { ref } from 'vue';
import type { ArrayStore, StoreMethods } from '@bcms/selfhosted-sdk';

export function createArrayStore<ItemType, Methods = unknown>(
    idKey: keyof ItemType,
    initItems?: ItemType[],
    methods?: StoreMethods<ItemType, Methods>,
): ArrayStore<ItemType, Methods> {
    const store = ref<ItemType[]>(initItems || []);

    const self: ArrayStore<ItemType, Methods> = {
        items() {
            return store.value as ItemType[];
        },

        find(query) {
            for (let i = 0; i < store.value.length; i++) {
                const item = store.value[i];
                if (query(item as ItemType)) {
                    return item as ItemType;
                }
            }
            return null;
        },

        findById(id) {
            const output = store.value.find((e) => e[idKey as never] === id);
            return (output as ItemType) || null;
        },

        findMany(query) {
            const output: ItemType[] = [];
            for (let i = 0; i < store.value.length; i++) {
                const item = store.value[i];
                if (query(item as ItemType)) {
                    output.push(store.value[i] as ItemType);
                }
            }
            return output;
        },

        findManyById(ids) {
            return store.value.filter((e) =>
                ids.includes(e[idKey as never]),
            ) as ItemType[];
        },

        set(inputItems) {
            const items =
                inputItems instanceof Array ? inputItems : [inputItems];
            for (let i = 0; i < items.length; i++) {
                const inputItem = items[i];
                let found = false;
                for (let j = 0; j < store.value.length; j++) {
                    const storeItem = store.value[j];
                    if (storeItem[idKey as never] === inputItem[idKey]) {
                        found = true;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        store.value.splice(j, 1, inputItem as any);
                        break;
                    }
                }
                if (!found) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    store.value.push(inputItem as any);
                }
            }
        },

        remove(inputIds) {
            const ids = inputIds instanceof Array ? inputIds : [inputIds];
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                for (let j = 0; j < store.value.length; j++) {
                    const item = store.value[j];
                    if (item[idKey as never] === id) {
                        store.value.splice(j, 1);
                    }
                }
            }
        },

        clear() {
            store.value = [];
        },

        methods: {} as never,
    };
    if (methods) {
        self.methods = methods(self);
    }

    return self;
}

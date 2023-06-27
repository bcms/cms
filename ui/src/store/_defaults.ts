export function defaultEntryMutations<Item>(getId: (item: Item) => string): {
  set(srcItems: Item[], items: Item | Item[]): void;
  update(srcItems: Item[], items: Item | Item[]): void;
  remove(srcItems: Item[], items: Item | Item[]): void;
} {
  return {
    set(srcItems, items): void {
      if (items instanceof Array) {
        for (let i = 0; i < items.length; i++) {
          let found = false;
          const itemId = getId(items[i]);
          for (let j = 0; j < srcItems.length; j++) {
            const srcItemId = getId(srcItems[j]);
            if (srcItemId === itemId) {
              found = true;
              srcItems[j] = items[i];
              break;
            }
          }
          if (!found) {
            srcItems.push(items[i]);
          }
        }
      } else {
        let found = false;
        const itemId = getId(items);
        for (let i = 0; i < srcItems.length; i++) {
          const srcItemId = getId(srcItems[i]);
          if (srcItemId === itemId) {
            found = true;
            srcItems[i] = items;
            break;
          }
        }
        if (!found) {
          srcItems.push(items);
        }
      }
    },
    update(srcItems, items): void {
      if (items instanceof Array) {
        for (let i = 0; i < items.length; i++) {
          const itemId = getId(items[i]);
          for (let j = 0; j < srcItems.length; j++) {
            const srcItemId = getId(srcItems[j]);
            if (srcItemId === itemId) {
              srcItems[j] = items[i];
              break;
            }
          }
        }
      } else {
        const itemId = getId(items);
        for (let i = 0; i < srcItems.length; i++) {
          const srcItemId = getId(srcItems[i]);
          if (srcItemId === itemId) {
            srcItems[i] = items;
            break;
          }
        }
      }
    },
    remove(srcItems, items): void {
      if (items instanceof Array) {
        const removeIds = items.map((e) => getId(e));
        while (removeIds.length > 0) {
          const id = removeIds.pop();
          for (let i = 0; i < srcItems.length; i++) {
            const srcItemId = getId(srcItems[i]);
            if (srcItemId === id) {
              srcItems.splice(i, 1);
              break;
            }
          }
        }
      } else {
        const itemId = getId(items);
        for (let i = 0; i < srcItems.length; i++) {
          const srcItemId = getId(srcItems[i]);
          if (srcItemId === itemId) {
            srcItems.splice(i, 1);
            break;
          }
        }
      }
    },
  };
}

export function defaultEntryGetters<Item>(): {
  find(items: Item[], query: (item: Item) => boolean): Item[];
  findOne(items: Item[], query: (item: Item) => boolean): Item | undefined;
} {
  return {
    find(items, query) {
      const output: Item[] = [];
      for (let i = 0; i < items.length; i++) {
        if (query(items[i])) {
          output.push(items[i]);
        }
      }
      return output;
    },
    findOne(items, query) {
      for (let i = 0; i < items.length; i++) {
        if (query(items[i])) {
          return items[i];
        }
      }
    },
  };
}

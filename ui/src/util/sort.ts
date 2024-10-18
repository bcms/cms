export function sortObjectsByStringProperty<ObjectType = unknown>(
    sortByKey: keyof ObjectType,
    dir: -1 | 1,
    items: ObjectType[],
): void {
    items.sort((a, b) => (a[sortByKey] > b[sortByKey] ? dir : -dir));
}

export interface ControllerItemResponse<ItemType = unknown> {
    item: ItemType;
}

export interface ControllerItemsResponse<ItemType = unknown> {
    items: ItemType[];
    total: number;
    limit: number;
    offset: number;
}

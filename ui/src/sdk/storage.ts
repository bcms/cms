export type StorageSubscriptionHandler<Value = string> = (
    value: Value,
    type: 'set' | 'remove',
) => void | Promise<void>;

export interface SdkStorage {
    /**
     * Get a value of a specific key. If key does not exist
     * method will return null.
     */
    get<Value = string>(key: string): Value | null;
    /**
     * Set the value of a key. Value can be Object or a string.
     * Objects will be stringified and stored as a string in
     * Local Storage. When you get the Object it will automatically
     * be parsed back to an Object.
     */
    set(key: string, value: unknown): Promise<boolean>;
    /**
     * Remove specified key from the Storage.
     */
    remove(key: string): Promise<void>;
    /**
     * Subscribe for changes to specified key. If the key's value
     * is changed, added or removed, handler function will be called.
     */
    subscribe<Value>(
        key: string,
        handler: StorageSubscriptionHandler<Value>,
    ): () => void;
    /**
     * Remove all data from the storage in the specified scope.
     */
    clear(): void;
}

export type BCMSStorageSubscriptionHandler<T> = (
  value: T,
  type: 'set' | 'remove',
) => void | Promise<void>;

export interface BCMSStorage {
  get<T>(key: string): T | null;
  set(key: string, value: unknown): Promise<boolean>;
  remove(key: string): Promise<void>;
  subscribe<T>(
    key: string,
    handler: BCMSStorageSubscriptionHandler<T>,
  ): () => void;
  clear(): Promise<void>;
}

export interface BCMSLocalStorageWrapper {
  all<T>(): T;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type UnsubscribeFns = Array<() => void>;

export function callAndClearUnsubscribeFns(unsubs: UnsubscribeFns) {
    while (unsubs.length > 0) {
        const unsub = unsubs.pop();
        if (unsub) {
            unsub();
        }
    }
}

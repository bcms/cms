import { v4 as uuidv4 } from 'uuid';

export interface QueueHandler<Output> {
    (): Promise<Output>;
}

export interface QueueData<Output> {
    wait: Promise<QueueError | QueueResult<Output>>;
    stop: () => void;
}

export interface Queue<Output> {
    (data: {
        name: string;
        priority?: boolean;
        handler: QueueHandler<Output>;
    }): QueueData<Output>;
}

export class QueueError {
    constructor(public error: unknown) {}
}

export class QueueResult<Output> {
    constructor(public data: Output) {}
}

export function createQueue<Output>(): Queue<Output> {
    let busy = false;
    const items: Array<{
        id: string;
        name: string;
        handler(callback: () => void): void;
    }> = [];

    function nextItem() {
        const data = items.pop();
        if (data) {
            data.handler(() => {
                nextItem();
            });
        } else {
            busy = false;
        }
    }

    return (data) => {
        const id = uuidv4();

        let resolve: (value: QueueResult<Output> | QueueError) => void;
        const promise = new Promise<QueueResult<Output> | QueueError>((res) => {
            resolve = res;
        });

        if (data.priority) {
            items.push({
                id,
                name: data.name,
                handler: (callback) => {
                    data.handler()
                        .then((value) => {
                            resolve(new QueueResult<Output>(value));
                            callback();
                        })
                        .catch((error) => {
                            resolve(new QueueError(error));
                            callback();
                        });
                },
            });
        } else {
            items.splice(0, 0, {
                id,
                name: data.name,
                handler: (callback) => {
                    data.handler()
                        .then((value) => {
                            resolve(new QueueResult<Output>(value));
                            callback();
                        })
                        .catch((error) => {
                            resolve(new QueueError(error));
                            callback();
                        });
                },
            });
        }
        promise.catch((error) => {
            // eslint-disable-next-line no-console
            console.error(data.name, error);
        });
        if (!busy) {
            busy = true;
            nextItem();
        }
        return {
            wait: promise,
            stop: () => {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].id === id) {
                        items.splice(i, 1);
                        resolve(
                            new QueueError(
                                Error('Queue item has been canceled by user'),
                            ),
                        );
                    }
                }
            },
        };
    };
}

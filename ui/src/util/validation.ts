import type { Ref } from 'vue';

export interface ValidationItem<Value = unknown> {
    value: Value;
    error?: string;
    handler(value: Value): string | void;
}

export function createValidationItem<Value>(
    item: Omit<ValidationItem<Value>, 'handler'> & {
        handler?(value: Value): string | void;
    },
): ValidationItem<Value> {
    if (!item.handler) {
        item.handler = () => {
            // do nothing
        };
    }
    return {
        value: item.value,
        handler: item.handler,
        error: item.error,
    };
}

export function createRefValidator(
    data: Ref<{ [key: string]: ValidationItem }>,
): () => boolean {
    return () => {
        let errors = false;
        for (const key in data.value) {
            if (typeof data.value[key].handler === 'function') {
                const result = data.value[key].handler(data.value[key].value);
                if (result) {
                    errors = true;
                    data.value[key].error = result;
                } else {
                    data.value[key].error = '';
                }
            }
        }
        return !errors;
    };
}

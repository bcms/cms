import { defineComponent, onMounted, type PropType, ref, Teleport } from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import { type DefaultComponentPropsType } from '@thebcms/selfhosted-ui/components/default';
import type {
    ModalHandler,
    ModalHandlerOptions,
} from '@thebcms/selfhosted-ui/services/modal';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';
import { Button } from '@thebcms/selfhosted-ui/components/button';

export interface ModalDefaultPropsType<Input = unknown, Output = unknown>
    extends DefaultComponentPropsType {
    handler: ModalHandler<Input, Output>;
    selector: string;
}

export interface ModalDefaultPropsType<Input = unknown, Output = unknown>
    extends DefaultComponentPropsType {
    handler: ModalHandler<Input, Output>;
    title?: string;
    header?: () => JSX.Element;
    footer?: () => JSX.Element;
    doneText?: string;
    cancelText?: string;
}

export function getModalDefaultProps<Input = unknown, Output = unknown>(): {
    id: StringConstructor;
    style: StringConstructor;
    class: {
        type: StringConstructor;
        default: '';
    };
    cyTag: StringConstructor;
    handler: {
        type: PropType<ModalHandler<Input, Output>>;
        required: true;
    };
    title: StringConstructor;
    header: PropType<() => JSX.Element>;
    footer: PropType<() => JSX.Element>;
    doneText: StringConstructor;
    cancelText: StringConstructor;
} {
    return {
        id: String,
        style: String,
        class: {
            type: String,
            default: '',
        },
        cyTag: String,
        handler: {
            type: Object as PropType<ModalHandler<Input, Output>>,
            required: true,
        },
        title: String,
        header: Function as PropType<() => JSX.Element>,
        footer: Function as PropType<() => JSX.Element>,
        doneText: String,
        cancelText: String,
    };
}

export const ModalWrapper = defineComponent({
    props: getModalDefaultProps<any, any>(),
    setup(props, ctx) {
        const show = ref(false);
        let options: ModalHandlerOptions<any> | undefined = undefined;

        onMounted(() => {
            const handler = props.handler;
            handler.open = (opt) => {
                options = opt;
                show.value = true;
                handler._onOpen(options);
            };
            handler.close = (isDone, doneValue) => {
                show.value = false;
                if (isDone) {
                    if (options?.onDone) {
                        options.onDone(doneValue);
                    }
                } else {
                    if (options?.onCancel) {
                        options.onCancel();
                    }
                }
            };
        });

        function header() {
            return (
                <div class={`flex items-center mb-7.5 px-5 pt-5`}>
                    {props.header ? (
                        props.header()
                    ) : props.title ? (
                        <div class={`text-4xl font-medium`}>{props.title}</div>
                    ) : (
                        ''
                    )}
                    <button
                        class={`flex-shrink-0 ml-auto mb-auto p-3 flex items-center justify-center text-dark dark:text-white hover:text-red dark:hover:text-red`}
                        onClick={async () => {
                            if (await props.handler._onCancel()) {
                                await props.handler.close();
                            }
                        }}
                    >
                        <Icon src={'/close'} class={`w-6 h-6 fill-current`} />
                    </button>
                </div>
            );
        }

        function footer() {
            return (
                <div class={`mt-auto px-5 pb-5`}>
                    {props.footer ? (
                        props.footer()
                    ) : (
                        <div class={`flex justify-end gap-2 mt-7.5`}>
                            <Button
                                kind={`secondary`}
                                onClick={async () => {
                                    if (await props.handler._onCancel()) {
                                        props.handler.close();
                                    }
                                }}
                            >
                                {props.cancelText || 'Cancel'}
                            </Button>
                            <Button
                                onClick={async () => {
                                    const [shouldContinue, data] =
                                        await props.handler._onDone();
                                    if (shouldContinue) {
                                        props.handler.close(true, data);
                                    }
                                }}
                            >
                                {props.doneText || 'Done'}
                            </Button>
                        </div>
                    )}
                </div>
            );
        }

        return () => (
            <>
                {show.value ? (
                    <Teleport to={`body`}>
                        <div
                            class={`fixed top-0 left-0 z-100 w-screen h-screen bg-dark/50 flex items-center justify-center text-dark dark:text-white`}
                            onClick={() => {
                                props.handler.close();
                            }}
                        >
                            <div
                                class={`flex flex-col bg-white dark:bg-darkGray rounded-xl shadow-xl max-w-[500px] w-full max-h-full overflow-auto`}
                                onClick={(event) => {
                                    event.stopPropagation();
                                }}
                            >
                                {header()}
                                <div class={`overflow-y-auto p-5`}>
                                    {ctx.slots.default?.()}
                                </div>
                                {footer()}
                            </div>
                        </div>
                    </Teleport>
                ) : (
                    ''
                )}
            </>
        );
    },
});

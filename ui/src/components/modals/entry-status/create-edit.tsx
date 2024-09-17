import { computed, defineComponent, onMounted } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@bcms/selfhosted-ui/components/modals/_wrapper';
import { MultiAdd } from '@bcms/selfhosted-ui/components/inputs/multi-add';

export const ModalEntryStatusCreateEdit = defineComponent({
    props: getModalDefaultProps<void, void>(),
    setup(props) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const notification = window.bcms.notification;
        const confirm = window.bcms.confirm;

        const statuses = computed(() => sdk.store.entryStatus.items());

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                if (event?.data) {
                    throwable(async () => {
                        await sdk.entryStatus.getAll();
                    }).catch((err) => console.error(err));
                }
            };
            handler._onDone = async () => {
                return [true, undefined];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        async function create(label: string) {
            await throwable(
                async () => {
                    await sdk.entryStatus.create({
                        label,
                    });
                },
                async () => {
                    notification.success('Status successfully created');
                },
            );
        }

        async function remove(id: string) {
            if (
                !(await confirm(
                    'Delete status',
                    `Are you sure you want to delete this status? This action is irreversible and all Entries which are using this status will lose it.`,
                ))
            ) {
                return;
            }
            await throwable(
                async () => {
                    await sdk.entryStatus.deleteById({
                        entryStatusId: id,
                    });
                },
                async () => {
                    notification.success('Status successfully deleted');
                },
            );
        }

        return () => (
            <ModalWrapper title={`Edit statuses`} handler={props.handler}>
                <div class={`flex flex-col gap-8`}>
                    <MultiAdd
                        label={'Statuses'}
                        value={statuses.value.map((status) => {
                            return status.label;
                        })}
                        placeholder={'Add some groups'}
                        onInput={async (values) => {
                            for (let i = 0; i < values.length; i++) {
                                const value = values[i];
                                if (
                                    !statuses.value.find(
                                        (e) => e.label === value,
                                    )
                                ) {
                                    await create(value);
                                }
                            }
                            for (let i = 0; i < statuses.value.length; i++) {
                                const status = statuses.value[i];
                                if (!values.find((e) => e === status.label)) {
                                    await remove(status._id);
                                }
                            }
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});

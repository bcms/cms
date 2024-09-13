import { computed, defineComponent, onMounted } from 'vue';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import type { EntryStatus } from '@thebcms/selfhosted-backend/entry-status/models/main';
import { Select } from '@thebcms/selfhosted-ui/components/inputs/select/main';

export const EntryStatusSelect = defineComponent({
    props: {
        ...DefaultComponentProps,
        label: String,
        placeholder: String,
        disabled: Boolean,
        selected: String,
        fixed: Boolean,
    },
    emits: {
        change: (_status: EntryStatus) => {
            return true;
        },
    },
    setup(props, ctx) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const modal = window.bcms.modalService;
        const statuses = computed(() => sdk.store.entryStatus.items());

        onMounted(async () => {
            await throwable(async () => {
                await sdk.entryStatus.getAll();
            });
        });

        return () => (
            <div>
                <Select
                    id={props.id}
                    style={props.style}
                    class={props.class}
                    label={props.label}
                    fixed={props.fixed}
                    selected={props.selected}
                    placeholder={props.placeholder || 'Select entry status'}
                    disabled={props.disabled}
                    options={[
                        ...statuses.value.map((status) => {
                            return {
                                label: status.label,
                                value: status._id,
                            };
                        }),
                        {
                            label: 'Edit statuses',
                            value: '__edit',
                            class: `border-t border-t-100 w-full bg-fluo`,
                            // slot: <div class={``}>Edit statuses</div>,
                        },
                    ]}
                    onChange={(option) => {
                        if (option) {
                            if (option.value === '__edit') {
                                modal.handlers.entryStatusCreateEdit.open();
                            } else {
                                const status = statuses.value.find(
                                    (e) => e._id === option.value,
                                );
                                if (status) {
                                    ctx.emit('change', status);
                                }
                            }
                        }
                    }}
                />
            </div>
        );
    },
});

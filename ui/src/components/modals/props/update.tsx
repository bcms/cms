import { defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@thebcms/selfhosted-ui/components/modals/_wrapper';
import {
    createRefValidator,
    createValidationItem,
} from '@thebcms/selfhosted-ui/util/validation';
import type {
    Prop,
    PropType,
} from '@thebcms/selfhosted-backend/prop/models/main';
import { TextInput } from '@thebcms/selfhosted-ui/components/inputs/text';
import type { PropChangeUpdate } from '@thebcms/selfhosted-backend/prop/models/change';
import { StringUtility } from '@thebcms/selfhosted-utils/string-utility';
import { Toggle } from '@thebcms/selfhosted-ui/components/inputs/toggle';
import { MultiSelect } from '@thebcms/selfhosted-ui/components/inputs/select/multi';
import { MultiAdd } from '@thebcms/selfhosted-ui/components/inputs/multi-add';
import { SelectGroupPointer } from '@thebcms/selfhosted-ui/components/inputs/select/group-pointer';

export interface ModalPropUpdateInput {
    templateId?: string;
    existingProps: Prop[];
    prop: Prop;
}

export interface ModalPropUpdateOutput {
    prop: PropChangeUpdate;
}

export const ModalPropUpdate = defineComponent({
    props: getModalDefaultProps<ModalPropUpdateInput, ModalPropUpdateOutput>(),
    setup(props) {
        const sdk = window.bcms.sdk;

        const data = ref<ModalPropUpdateInput>({
            existingProps: [],
            prop: {
                type: '',
            } as never,
        });
        const inputs = ref(
            getInputs({
                data: {},
            } as never),
        );
        const inputsValid = createRefValidator(inputs);

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                if (event?.data) {
                    data.value = event.data;
                    inputs.value = getInputs(data.value.prop);
                }
            };
            handler._onDone = async () => {
                if (!inputsValid()) {
                    return [false, { prop: null as never }];
                }
                const propUpdate: PropChangeUpdate = {
                    id: data.value.prop.id,
                    move: 0,
                    label: inputs.value.label.value,
                    array: inputs.value.array.value,
                    required: inputs.value.required.value,
                    entryPointer: inputs.value.entryPointer.value.map(
                        (templateId) => {
                            return {
                                displayProp: 'title',
                                entryIds: [],
                                templateId: templateId,
                            };
                        },
                    ),
                    enumItems: inputs.value.enumItems.value,
                };
                return [
                    true,
                    {
                        prop: propUpdate,
                    },
                ];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        function getInputs(prop: Prop) {
            return {
                type: createValidationItem<keyof typeof PropType | undefined>({
                    value: prop.type,
                }),
                label: createValidationItem({
                    value: prop.label,
                    handler(value) {
                        if (!value) {
                            return 'Label is required';
                        }
                        if (
                            data.value.existingProps
                                .filter((e) => e.id !== data.value.prop.id)
                                .find((e) => e.label === value)
                        ) {
                            return `Property with name "${value}" already exists`;
                        }
                    },
                }),
                required: createValidationItem({
                    value: prop.required,
                }),
                array: createValidationItem({
                    value: prop.array,
                }),
                entryPointer: createValidationItem<string[]>({
                    value:
                        prop.data.propEntryPointer?.map((e) => e.templateId) ||
                        [],
                    handler(value) {
                        if (
                            inputs.value.type.value === 'ENTRY_POINTER' &&
                            value.length === 0
                        ) {
                            return 'You must select at least 1 template';
                        }
                    },
                }),
                groupPointer: createValidationItem<string>({
                    value: prop.data.propGroupPointer?._id || '',
                    handler(value) {
                        if (
                            inputs.value.type.value === 'GROUP_POINTER' &&
                            !value
                        ) {
                            return 'You need to select a group';
                        }
                    },
                }),
                enumItems: createValidationItem<string[]>({
                    value: prop.data.propEnum?.items || [],
                    handler(value) {
                        if (
                            inputs.value.type.value === 'ENUMERATION' &&
                            value.length === 0
                        ) {
                            return 'You must add at least 1 option';
                        }
                    },
                }),
            };
        }

        return () => (
            <ModalWrapper
                handler={props.handler}
                title={data.value.prop.type
                    .split('_')
                    .map(
                        (e) =>
                            e.slice(0, 1).toUpperCase() +
                            e.slice(1).toLowerCase(),
                    )
                    .join(' ')}
                doneText="Update"
            >
                <div class={`flex flex-col gap-4`}>
                    <TextInput
                        label={'Label'}
                        placeholder="Label"
                        value={inputs.value.label.value}
                        error={inputs.value.label.error}
                        onInput={(value) => {
                            inputs.value.label.value = value;
                        }}
                    />
                    {inputs.value.type.value === 'ENTRY_POINTER' ? (
                        <MultiSelect
                            label={'Select templates'}
                            selected={inputs.value.entryPointer.value}
                            options={sdk.store.template
                                .items()
                                .map((template) => {
                                    return {
                                        label: template.label,
                                        value: template._id,
                                    };
                                })
                                .sort((a, b) =>
                                    a.label.toLowerCase() >
                                    b.label.toLowerCase()
                                        ? 1
                                        : -1,
                                )}
                            placeholder={`Select templates`}
                            error={inputs.value.entryPointer.error}
                            onInput={(value) => {
                                inputs.value.entryPointer.value = value;
                                if (
                                    inputs.value.entryPointer.value.find(
                                        (e) => e === data.value.templateId,
                                    )
                                ) {
                                    inputs.value.required.value = false;
                                }
                            }}
                        />
                    ) : inputs.value.type.value === 'ENUMERATION' ? (
                        <MultiAdd
                            label={'Enumerations'}
                            placeholder="Type a name and press Enter key"
                            value={inputs.value.enumItems.value}
                            error={inputs.value.enumItems.error}
                            format={(value) => {
                                return StringUtility.toSlugUnderscore(
                                    value,
                                ).toUpperCase();
                            }}
                            onInput={(value) => {
                                inputs.value.enumItems.value = value;
                            }}
                        />
                    ) : inputs.value.type.value === 'GROUP_POINTER' ? (
                        <SelectGroupPointer
                            label={'Select a group'}
                            placeholder={`Select a group`}
                            selected={inputs.value.groupPointer.value}
                            onChange={(value) => {
                                inputs.value.groupPointer.value = value._id;
                            }}
                        />
                    ) : (
                        ''
                    )}

                    <div class={`flex gap-4`}>
                        {inputs.value.type.value !== 'ENTRY_POINTER' ||
                        (!inputs.value.entryPointer.value.find(
                            (e) => e === data.value.templateId,
                        ) &&
                            !sdk.store.group.findById(
                                inputs.value.groupPointer.value,
                            )) ? (
                            <Toggle
                                label={'Required'}
                                value={inputs.value.required.value}
                                onInput={(value) => {
                                    inputs.value.required.value = value;
                                }}
                            />
                        ) : (
                            ''
                        )}
                        <Toggle
                            label={'Array'}
                            value={inputs.value.array.value}
                            onInput={(value) => {
                                inputs.value.array.value = value;
                            }}
                        />
                    </div>
                </div>
            </ModalWrapper>
        );
    },
});

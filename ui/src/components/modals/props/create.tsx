import { computed, defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@bcms/selfhosted-ui/components/modals/_wrapper';
import {
    createRefValidator,
    createValidationItem,
} from '@bcms/selfhosted-ui/util/validation';
import type {
    Prop,
    PropData,
    PropType,
} from '@bcms/selfhosted-backend/prop/models/main';
import { Button } from '@bcms/selfhosted-ui/components/button';
import { TextInput } from '@bcms/selfhosted-ui/components/inputs/text';
import type { PropChangeAdd } from '@bcms/selfhosted-backend/prop/models/change';
import { StringUtility } from '@bcms/selfhosted-utils/string-utility';
import { Toggle } from '@bcms/selfhosted-ui/components/inputs/toggle';
import { MultiSelect } from '@bcms/selfhosted-ui/components/inputs/select/multi';
import { MultiAdd } from '@bcms/selfhosted-ui/components/inputs/multi-add';
import { SelectGroupPointer } from '@bcms/selfhosted-ui/components/inputs/select/group-pointer';

interface PropTypeOption {
    name: string;
    desc: string;
    value: keyof typeof PropType;
}

export interface ModalPropCreateInput {
    templateId?: string;
    existingProps: Prop[];
}

export interface ModalPropCreateOutput {
    prop: PropChangeAdd;
}

export const ModalPropCreate = defineComponent({
    props: getModalDefaultProps<ModalPropCreateInput, ModalPropCreateOutput>(),
    setup(props) {
        const sdk = window.bcms.sdk;

        const data = ref<ModalPropCreateInput>({
            existingProps: [],
        });
        const inputs = ref(getInputs());
        const inputsValid = createRefValidator(inputs);

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                if (event?.data) {
                    data.value = event.data;
                }
                inputs.value = getInputs();
            };
            handler._onDone = async () => {
                if (!inputsValid()) {
                    return [false, { prop: null as never }];
                }
                const propData: PropData = {};
                switch (inputs.value.type.value) {
                    case 'STRING':
                        {
                            propData.propString = [];
                        }
                        break;
                    case 'BOOLEAN':
                        {
                            propData.propBool = [];
                        }
                        break;
                    case 'ENUMERATION':
                        {
                            propData.propEnum = {
                                items: inputs.value.enumItems.value,
                            };
                        }
                        break;
                    case 'DATE':
                        {
                            propData.propDate = [];
                        }
                        break;
                    case 'ENTRY_POINTER':
                        {
                            propData.propEntryPointer =
                                inputs.value.entryPointer.value.map(
                                    (templateId) => {
                                        return {
                                            displayProp: 'title',
                                            entryIds: [],
                                            templateId,
                                        };
                                    },
                                );
                        }
                        break;
                    case 'GROUP_POINTER':
                        {
                            propData.propGroupPointer = {
                                _id: inputs.value.groupPointer.value,
                            };
                        }
                        break;
                    case 'MEDIA':
                        {
                            propData.propMedia = [];
                        }
                        break;
                    case 'NUMBER':
                        {
                            propData.propNumber = [];
                        }
                        break;
                    case 'RICH_TEXT':
                        {
                            propData.propRichText = [];
                        }
                        break;
                }
                const prop: Prop = {
                    id: '',
                    name: StringUtility.toSlugUnderscore(
                        inputs.value.label.value,
                    ),
                    type: inputs.value.type.value as PropType,
                    data: propData,
                    label: inputs.value.label.value,
                    required: inputs.value.required.value,
                    array: inputs.value.array.value,
                };
                return [true, { prop }];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        const propTypes = computed(() => {
            const items: PropTypeOption[] = [
                {
                    name: 'String',
                    value: 'STRING',
                    desc: 'Any character array value',
                },
                {
                    name: 'Rich Text',
                    value: 'RICH_TEXT',
                    desc: 'Text with options for bold, italic, list...',
                },
                {
                    name: 'Number',
                    value: 'NUMBER',
                    desc: 'Any real number',
                },
                {
                    name: 'Date',
                    value: 'DATE',
                    desc: 'Unix timestamp - date in milliseconds',
                },
                {
                    name: 'Boolean',
                    value: 'BOOLEAN',
                    desc: 'Yes or no, true or false, 1 or 0',
                },
                {
                    name: 'Enumeration',
                    value: 'ENUMERATION',
                    desc: 'List of choices',
                },
                {
                    name: 'Media',
                    value: 'MEDIA',
                    desc: 'Select a media file using media picker',
                },
            ];
            if (sdk.store.group.items().length > 0) {
                items.push({
                    name: 'Group pointer',
                    value: 'GROUP_POINTER',
                    desc: 'Extend properties of a group',
                });
            }
            if (sdk.store.template.items().length > 0) {
                items.push({
                    name: 'Entry pointer',
                    value: 'ENTRY_POINTER',
                    desc: 'Extend properties of an entry',
                });
            }
            return items;
        });

        function getInputs() {
            return {
                type: createValidationItem<keyof typeof PropType | undefined>({
                    value: undefined,
                }),
                label: createValidationItem({
                    value: '',
                    handler(value) {
                        if (!value) {
                            return 'Label is required';
                        }
                        if (
                            data.value.existingProps.find(
                                (e) => e.label === value,
                            )
                        ) {
                            return `Property with name "${value}" already exists`;
                        }
                    },
                }),
                required: createValidationItem({
                    value: false,
                }),
                array: createValidationItem({
                    value: false,
                }),
                entryPointer: createValidationItem<string[]>({
                    value: [],
                    handler(value) {
                        if (
                            inputs.value.type.value === 'ENTRY_POINTER' &&
                            value.length === 0
                        ) {
                            return 'You must select at least 1 template';
                        }
                    },
                }),
                groupPointer: createValidationItem({
                    value: '',
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
                    value: [],
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
                header={() => (
                    <div class={`text-4xl`}>
                        {inputs.value.type.value ? (
                            <div class={`flex gap-2 items-center`}>
                                <button
                                    class={`text-sm p-2`}
                                    onClick={() => {
                                        inputs.value.type.value = undefined;
                                    }}
                                >
                                    ◂
                                </button>
                                <div>
                                    {inputs.value.type.value
                                        .split('_')
                                        .map(
                                            (e) =>
                                                e.slice(0, 1).toUpperCase() +
                                                e.slice(1).toLowerCase(),
                                        )
                                        .join(' ')}
                                </div>
                            </div>
                        ) : (
                            'Select a property type'
                        )}
                    </div>
                )}
                footer={() => (
                    <>
                        {inputs.value.type.value ? (
                            <div class={`w-full flex`}>
                                <Button
                                    class={`ml-auto`}
                                    onClick={async () => {
                                        const [shouldContinue, result] =
                                            await props.handler._onDone();
                                        if (shouldContinue) {
                                            props.handler.close(true, result);
                                        }
                                    }}
                                >
                                    Create property
                                </Button>
                            </div>
                        ) : (
                            ''
                        )}
                    </>
                )}
            >
                {inputs.value.type.value ? (
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
                ) : (
                    <div class={`flex flex-col gap-5`}>
                        {propTypes.value.map((item) => {
                            return (
                                <button
                                    class={`flex gap-4 items-center py-3 px-5 bg-gray/20 border border-gray rounded-full`}
                                    onClick={() => {
                                        inputs.value.type.value = item.value;
                                    }}
                                >
                                    <div>{item.name}</div>
                                    <div class={`text-gray`}>{item.desc}</div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </ModalWrapper>
        );
    },
});

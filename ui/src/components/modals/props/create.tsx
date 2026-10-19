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
import { useI18n } from 'vue-i18n';

const PROP_TYPE_LABEL_KEYS: Record<string, string> = {
    STRING: 'props.type.string',
    RICH_TEXT: 'props.type.richText',
    NUMBER: 'props.type.number',
    DATE: 'props.type.date',
    BOOLEAN: 'props.type.boolean',
    ENUMERATION: 'props.type.enumeration',
    MEDIA: 'props.type.media',
    GROUP_POINTER: 'props.type.groupPointer',
    ENTRY_POINTER: 'props.type.entryPointer',
};

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
        const { t } = useI18n();
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
                    name: t('props.type.string'),
                    value: 'STRING',
                    desc: t('modals.props.typeDesc.string'),
                },
                {
                    name: t('props.type.richText'),
                    value: 'RICH_TEXT',
                    desc: t('modals.props.typeDesc.richText'),
                },
                {
                    name: t('props.type.number'),
                    value: 'NUMBER',
                    desc: t('modals.props.typeDesc.number'),
                },
                {
                    name: t('props.type.date'),
                    value: 'DATE',
                    desc: t('modals.props.typeDesc.date'),
                },
                {
                    name: t('props.type.boolean'),
                    value: 'BOOLEAN',
                    desc: t('modals.props.typeDesc.boolean'),
                },
                {
                    name: t('props.type.enumeration'),
                    value: 'ENUMERATION',
                    desc: t('modals.props.typeDesc.enumeration'),
                },
                {
                    name: t('props.type.media'),
                    value: 'MEDIA',
                    desc: t('modals.props.typeDesc.media'),
                },
            ];
            if (sdk.store.group.items().length > 0) {
                items.push({
                    name: t('props.type.groupPointer'),
                    value: 'GROUP_POINTER',
                    desc: t('modals.props.typeDesc.groupPointer'),
                });
            }
            if (sdk.store.template.items().length > 0) {
                items.push({
                    name: t('props.type.entryPointer'),
                    value: 'ENTRY_POINTER',
                    desc: t('modals.props.typeDesc.entryPointer'),
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
                            return t('modals.common.labelRequired');
                        }
                        if (
                            data.value.existingProps.find(
                                (e) => e.label === value,
                            )
                        ) {
                            return t('modals.common.propertyExists', {
                                name: value,
                            });
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
                            return t('modals.common.mustSelectTemplate');
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
                            return t('modals.common.needSelectGroup');
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
                            return t('modals.common.mustAddOption');
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
                                    {t(
                                        PROP_TYPE_LABEL_KEYS[
                                            inputs.value.type.value
                                        ] || inputs.value.type.value,
                                    )}
                                </div>
                            </div>
                        ) : (
                            t('modals.props.selectType')
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
                                    {t('modals.props.createProperty')}
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
                            label={t('modals.common.label')}
                            placeholder={t('modals.common.label')}
                            value={inputs.value.label.value}
                            error={inputs.value.label.error}
                            onInput={(value) => {
                                inputs.value.label.value = value;
                            }}
                        />
                        {inputs.value.type.value === 'ENTRY_POINTER' ? (
                            <MultiSelect
                                label={t('modals.common.selectTemplates')}
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
                                placeholder={t(
                                    'modals.common.selectTemplates',
                                )}
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
                                label={t('modals.props.enumLabel')}
                                placeholder={t(
                                    'modals.common.typeNameAndEnter',
                                )}
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
                                label={t('modals.common.selectGroup')}
                                placeholder={t('modals.common.selectGroup')}
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
                                    label={t('modals.common.required')}
                                    value={inputs.value.required.value}
                                    onInput={(value) => {
                                        inputs.value.required.value = value;
                                    }}
                                />
                            ) : (
                                ''
                            )}
                            <Toggle
                                label={t('modals.common.array')}
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

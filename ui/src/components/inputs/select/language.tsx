import { defineComponent, onMounted, type PropType } from 'vue';
import { InputProps } from '@thebcms/selfhosted-ui/components/inputs/_wrapper';
import {
    type LanguageISO,
    Languages,
} from '@thebcms/selfhosted-ui/data/language';
import { MultiSelect } from '@thebcms/selfhosted-ui/components/inputs/select/multi';

export const LanguageSelect = defineComponent({
    props: {
        ...InputProps,
        placeholder: String,
        selected: { type: Array as PropType<string[]>, required: true },
        disabled: Boolean,
    },
    emits: {
        input: (
            _values: LanguageISO[],
            _metadata: {
                add?: LanguageISO;
                remove?: LanguageISO;
            },
        ) => {
            return true;
        },
    },
    setup(props, ctx) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;

        onMounted(async () => {
            await throwable(async () => {
                await sdk.language.getAll();
            });
        });

        return () => (
            <>
                <MultiSelect
                    searchable
                    label={props.label}
                    required={props.required}
                    selected={props.selected}
                    class={props.class}
                    id={props.id}
                    style={props.style}
                    unremovable={['en']}
                    options={Languages.toArray()
                        // .filter((language) => !props.selected.includes(language.code))
                        .map((language) => {
                            return {
                                label:
                                    language.name + ' - ' + language.nativeName,
                                value: language.code,
                                slot: () => (
                                    <div class={`flex items-center gap-4`}>
                                        <img
                                            class={`w-6 h-6 rounded-full`}
                                            src={`/assets/flags/${language.code}.jpg`}
                                            alt={language.name}
                                        />
                                        <div>{language.name}</div>
                                        <div
                                            class={`ml-auto text-gray-400 truncate`}
                                        >
                                            {language.nativeName}
                                        </div>
                                    </div>
                                ),
                            };
                        })}
                    error={props.error}
                    disabled={props.disabled}
                    placeholder={props.placeholder || `Select a language`}
                    description={props.description}
                    onInput={(values, metadata) => {
                        const items: LanguageISO[] = [];
                        for (let i = 0; i < values.length; i++) {
                            const langInfo = Languages.hashMap[values[i]];
                            items.push({
                                code: values[i],
                                name: langInfo.name,
                                nativeName: langInfo.nativeName,
                                additional: langInfo.additional,
                            });
                        }
                        ctx.emit('input', items, {
                            add: metadata.add
                                ? {
                                      code: metadata.add,
                                      name: Languages.hashMap[metadata.add]
                                          .name,
                                      nativeName:
                                          Languages.hashMap[metadata.add]
                                              .nativeName,
                                      additional:
                                          Languages.hashMap[metadata.add]
                                              .additional,
                                  }
                                : undefined,
                            remove: metadata.remove
                                ? {
                                      code: metadata.remove,
                                      name: Languages.hashMap[metadata.remove]
                                          .name,
                                      nativeName:
                                          Languages.hashMap[metadata.remove]
                                              .nativeName,
                                      additional:
                                          Languages.hashMap[metadata.remove]
                                              .additional,
                                  }
                                : undefined,
                        });
                    }}
                />
            </>
        );
    },
});

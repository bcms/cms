import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
} from 'vue';
import { InputProps } from '@bcms/selfhosted-ui/components/inputs/_wrapper';
import type { EntrySync } from '@bcms/selfhosted-ui/services/entry-sync';
import type { EntryLite } from '@bcms/selfhosted-backend/entry/models/main';
import {
    callAndClearUnsubscribeFns,
    type UnsubscribeFns,
} from '@bcms/selfhosted-ui/util/sub';
import { Select } from '@bcms/selfhosted-ui/components/inputs/select/main';
import { MediaPreview } from '@bcms/selfhosted-ui/components/media-preview';

export const SelectEntryPointer = defineComponent({
    props: {
        ...InputProps,
        placeholder: String,
        disabled: Boolean,
        selected: {
            type: String,
            default: '',
        },
        allowedTemplates: Array as PropType<string[]>,
        allowedEntries: Array as PropType<string[]>,
        propPath: String,
        entrySync: Object as PropType<EntrySync>,
    },
    emits: {
        change: (
            _entry: EntryLite,
            _triggeredByEntrySync?: boolean,
        ): boolean => {
            return true;
        },
    },
    setup(props, ctx) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const [language] = window.bcms.useLanguage();
        const unsubs: UnsubscribeFns = [];
        const entries = computed<EntryLite[]>(() => {
            if (props.allowedEntries) {
                return sdk.store.entryLite.findMany((e) =>
                    props.allowedEntries?.includes(e._id),
                );
            } else if (props.allowedTemplates) {
                return sdk.store.entryLite.findMany((e) =>
                    props.allowedTemplates?.includes(e.templateId),
                );
            } else {
                return sdk.store.entryLite.items();
            }
        });

        onMounted(async () => {
            if (props.entrySync && props.propPath) {
                unsubs.push(
                    props.entrySync.onEntryPointerUpdate(
                        props.propPath,
                        async (data) => {
                            if (data.value) {
                                const entry = entries.value.find(
                                    (e) => e._id === data.value?.eid,
                                );
                                if (entry) {
                                    ctx.emit('change', entry, true);
                                }
                            }
                        },
                    ),
                );
            }
            await throwable(async () => {
                await sdk.entry.getAllLite({});
            });
        });

        onBeforeUnmount(() => {
            callAndClearUnsubscribeFns(unsubs);
        });

        return () => (
            <Select
                id={props.id}
                style={props.style}
                class={props.class}
                label={props.label}
                error={props.error}
                description={props.description}
                required={props.required}
                placeholder={props.placeholder || 'Select an entry'}
                disabled={props.disabled}
                selected={props.selected}
                options={entries.value.map((entry) => {
                    const info = entry.info.find(
                        (e) => e.lng === language.value,
                    );
                    const media = info?.media
                        ? sdk.store.media.findById(info.media)
                        : undefined;
                    return {
                        label:
                            entry.templateId +
                            ' ' +
                            info?.title +
                            ' ' +
                            info?.slug,
                        value: entry._id,
                        slot: () => (
                            <div class={`flex gap-2 items-center`}>
                                {media && (
                                    <MediaPreview
                                        class={`flex-shrink-0 w-8 h-8`}
                                        media={media}
                                        thumbnail
                                    />
                                )}
                                <div class={`flex flex-col gap-2 text-left`}>
                                    <div class={`text-sm font-medium`}>
                                        {info?.title}
                                    </div>
                                    <div
                                        class={`flex flex-col gap-2 text-sm font-sec`}
                                    >
                                        {info?.description
                                            ? info.description.length > 240
                                                ? (
                                                      info.description.slice(
                                                          0,
                                                          244,
                                                      ) + ' ...'
                                                  )
                                                      .split('\n')
                                                      .map((line) => {
                                                          return (
                                                              <div>{line}</div>
                                                          );
                                                      })
                                                : info.description
                                                      .split('\n')
                                                      .map((line) => {
                                                          return (
                                                              <div>{line}</div>
                                                          );
                                                      })
                                            : ''}
                                    </div>
                                </div>
                            </div>
                        ),
                    };
                })}
                onChange={(option) => {
                    if (option) {
                        const entry = entries.value.find(
                            (e) => e._id === option.value,
                        );
                        if (entry) {
                            ctx.emit('change', entry);
                        }
                    }
                }}
            />
        );
    },
});

import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    ref,
} from 'vue';
import { useRoute } from 'vue-router';
import type { Entry } from '@thebcms/selfhosted-backend/entry/models/main';
import { EntrySync } from '@thebcms/selfhosted-ui/services/entry-sync';
import { PropValidator } from '@thebcms/selfhosted-ui/util/prop-validation';
import type { Language } from '@thebcms/selfhosted-backend/language/models/main';
import { entryNewFromTemplate } from '@thebcms/selfhosted-ui/util/entry';
import type {
    EntryContentNode,
    EntryContentNodeWidgetAttr,
} from '@thebcms/selfhosted-backend/entry/models/content';
import { EntrySyncElements } from '@thebcms/selfhosted-ui/components/entry/sync-elements/main';
import { LanguageSwitch } from '@thebcms/selfhosted-ui/components/language-switch';
import { EntryStatusSelect } from '@thebcms/selfhosted-ui/components/inputs/select/entry-status';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import { EntryEditor } from '@thebcms/selfhosted-ui/components/entry/editor';
import { StringUtility } from '@thebcms/selfhosted-utils/string-utility';
import { Loader } from '@thebcms/selfhosted-ui/components/loader';

export const EntryView = defineComponent({
    setup() {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const meta = window.bcms.meta;
        const notification = window.bcms.notification;
        const [lngCode] = window.bcms.useLanguage();

        const route = useRoute();

        const loading = ref(true);
        const slugLocked = ref(false);
        const propValidator: PropValidator = new PropValidator();
        window.bcms.entryPropValidator = propValidator;

        const template = computed(() =>
            sdk.store.template.find((e) => e._id === route.params.templateId),
        );
        const entry = ref<Entry>();
        const lngIdx = computed(() => {
            const idx = entry.value?.meta.findIndex(
                (e) => e.lng === lngCode.value,
            );
            if (typeof idx === 'undefined') {
                return -1;
            }
            return idx;
        });
        const entryLngChanges = ref<{
            [lngCode: string]: {
                change: boolean;
                buffer: string;
            };
        }>({});
        const checkForChangesInterval = setInterval(() => {
            const languages = sdk.store.language.items();
            for (let i = 0; i < languages.length; i++) {
                const language = languages[i];
                const data = getEntryStateHash(language);
                entryLngChanges.value[language.code].change =
                    data !== entryLngChanges.value[language.code].buffer;
            }
        }, 10000);
        const entrySync = new EntrySync(
            () => {
                return entry.value
                    ? entry.value._id
                    : (route.params.entryId as string);
            },
            () => {
                return entry.value;
            },
            (ent) => {
                entry.value = ent;
            },
            () => lngCode.value,
            () => lngIdx.value,
        );

        meta.set({ title: 'Entry' });

        function getEntryStateHash(language: Language) {
            return (
                JSON.stringify(
                    entry.value?.meta.find((e) => e.lng === language.code) ||
                        {},
                ) +
                    JSON.stringify(
                        entry.value?.content.find(
                            (e) => e.lng === language.code,
                        ) || {},
                    ) +
                    entry.value?.statuses.find((e) => e.lng === language.code)
                        ?.id || 'undefined'
            );
        }

        function beforeUnload() {
            entrySync.destroy();
        }

        onMounted(async () => {
            loading.value = true;
            await throwable(
                async () => {
                    await sdk.template.getAll();
                    if (!template.value) {
                        throw Error('Template for this does not exist');
                    }
                    await sdk.widget.getAll();
                    await sdk.group.getAll();
                    const languages = await sdk.language.getAll();
                    if (route.params.entryId === 'create') {
                        return {
                            languages,
                            entry: await entryNewFromTemplate(template.value),
                        };
                    }
                    const ent = await sdk.entry.get({
                        entryId: route.params.entryId as string,
                        templateId: template.value._id,
                    });

                    const backendEntry = await entryNewFromTemplate(
                        template.value,
                        ent,
                    );
                    entry.value = JSON.parse(JSON.stringify(backendEntry));
                    if (entry.value?.meta[lngIdx.value]) {
                        meta.set({
                            title: (
                                entry.value.meta[lngIdx.value].props[0]
                                    .data as string[]
                            )[0],
                        });
                        if (
                            (
                                entry.value.meta[lngIdx.value].props[1]
                                    .data as string[]
                            )[0]
                        ) {
                            slugLocked.value = true;
                        }
                    }
                    for (let i = 0; i < languages.length; i++) {
                        entryLngChanges.value[languages[i].code] = {
                            change: false,
                            buffer: getEntryStateHash(languages[i]),
                        };
                    }
                    await entrySync.sync();
                },
                async () => {
                    loading.value = false;
                },
            );
            window.addEventListener('beforeunload', beforeUnload);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('beforeunload', beforeUnload);
            clearInterval(checkForChangesInterval);
            beforeUnload();
        });

        async function update() {
            if (!propValidator.validate()) {
                if (!propValidator.validate()) {
                    notification.warning(
                        'There are errors in your entry. Please fix them and try again',
                    );
                    return;
                }
                return;
            }
            if (entry.value) {
                const data = entry.value;
                await throwable(
                    async () => {
                        await sdk.entry.update({
                            _id: data?._id,
                            templateId: data.templateId,
                            lng: lngCode.value,
                            status: data?.statuses.find(
                                (e) => e.lng === lngCode.value,
                            )?.id,
                            meta: {
                                props: data?.meta[lngIdx.value].props,
                            },
                            content: {
                                nodes: data?.content[lngIdx.value].nodes.map(
                                    (node) => {
                                        if (node.type === 'widget') {
                                            const outputNode: EntryContentNode =
                                                JSON.parse(
                                                    JSON.stringify(node),
                                                );
                                            const attrs =
                                                outputNode.attrs as EntryContentNodeWidgetAttr;
                                            attrs.data = JSON.parse(
                                                attrs.data as unknown as string,
                                            );
                                            delete (attrs as any).widgetId;
                                            return outputNode;
                                        }
                                        return node;
                                    },
                                ),
                            },
                        });
                    },
                    async () => {
                        notification.success(
                            `Entry updated successfully for language "${lngCode.value}"`,
                        );
                    },
                );
            }
        }

        return () => (
            <div>
                {template.value && entry.value && lngIdx.value !== -1 ? (
                    <div
                        class={`flex flex-col mt-8 pl-8 ${
                            loading.value ? 'opacity-0' : ''
                        }`}
                    >
                        <EntrySyncElements entrySync={entrySync} />
                        <div
                            class={`desktop:fixed desktop:right-6 desktop:top-6 flex gap-2 items-center top-0 max-desktop:top-14 z-20 pb-8`}
                        >
                            <div
                                class={`ml-auto flex max-desktop:flex-col gap-4 items-center max-desktop:items-end`}
                            >
                                <div
                                    id={`entrySync-connected-users-container`}
                                    class={`flex items-center gap-1`}
                                />
                                <LanguageSwitch fixed />
                                <EntryStatusSelect
                                    fixed
                                    selected={
                                        entry.value?.statuses.find(
                                            (e) => e.lng === lngCode.value,
                                        )?.id
                                    }
                                    onChange={(status) => {
                                        if (entry.value) {
                                            let found = false;
                                            for (
                                                let i = 0;
                                                i < entry.value.statuses.length;
                                                i++
                                            ) {
                                                if (
                                                    entry.value.statuses[i]
                                                        .lng === lngCode.value
                                                ) {
                                                    entry.value.statuses[i].id =
                                                        status._id;
                                                    found = true;
                                                    break;
                                                }
                                            }
                                            if (!found) {
                                                entry.value.statuses.push({
                                                    lng: lngCode.value,
                                                    id: status._id,
                                                });
                                            }
                                        }
                                    }}
                                />
                                <Button
                                    disabled={
                                        !entryLngChanges.value[lngCode.value]
                                            .change
                                    }
                                    onClick={async () => {
                                        await update();
                                    }}
                                >
                                    {route.params.entryId === 'create'
                                        ? 'Create'
                                        : 'Update'}
                                </Button>
                            </div>
                        </div>
                        {!loading.value && (
                            <div>
                                <EntryEditor
                                    entry={entry.value}
                                    propValidator={propValidator}
                                    entrySync={entrySync}
                                    onEditTitle={(value) => {
                                        meta.set({ title: value });
                                        if (entry.value) {
                                            (
                                                entry.value.meta[lngIdx.value]
                                                    .props[0].data as string[]
                                            )[0] = value;
                                            if (!slugLocked.value) {
                                                (
                                                    entry.value.meta[
                                                        lngIdx.value
                                                    ].props[1].data as string[]
                                                )[0] =
                                                    StringUtility.toSlug(value);
                                            }
                                        }
                                    }}
                                    onEditSlug={(value) => {
                                        if (entry.value) {
                                            slugLocked.value = true;
                                            (
                                                entry.value.meta[lngIdx.value]
                                                    .props[1].data as string[]
                                            )[0] = value;
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    ''
                )}
                <div class={`w-full h-full flex items-center justify-center`}>
                    <Loader show={loading.value} />
                </div>
            </div>
        );
    },
});

export default EntryView;

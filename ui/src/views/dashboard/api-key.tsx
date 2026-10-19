import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    Dropdown,
    type DropdownItem,
} from '@bcms/selfhosted-ui/components/dropdown';
import { Loader } from '@bcms/selfhosted-ui/components/loader';
import { Breadcrumb } from '@bcms/selfhosted-ui/components/breadcrumb';
import { Button } from '@bcms/selfhosted-ui/components/button';
import { millisToDateString } from '@bcms/selfhosted-ui/util/date';
import { Icon } from '@bcms/selfhosted-ui/components/icon';
import type { UserPolicyCRUD } from '@bcms/selfhosted-backend/user/models/policy';
import { CheckBox } from '@bcms/selfhosted-ui/components/inputs/check-box';
import type { BCMSFunctionConfig } from '@bcms/selfhosted-backend/function/models/main';
import { useI18n } from 'vue-i18n';

export interface TemplateConfig {
    id: string;
    label: string;
    name: string;
    access: UserPolicyCRUD;
}

export const ApiKeyView = defineComponent({
    setup() {
        const { t } = useI18n();
        const meta = window.bcms.meta;
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const modal = window.bcms.modalService;
        const confirm = window.bcms.confirm;
        const notification = window.bcms.notification;

        const router = useRouter();
        const route = useRoute();
        const apiKey = computed(() =>
            sdk.store.apiKey.find((e) => e._id === route.params.apiKeyId),
        );
        const fns = ref<BCMSFunctionConfig[]>([]);

        const data = ref<{
            templatesConfig: TemplateConfig[];
            fns: string[];
        }>({
            templatesConfig: [],
            fns: [],
        });

        meta.set({ titleKey: 'routes.apiKey' });

        const loading = ref(true);
        const dropdownItems = computed<DropdownItem[]>(() => [
            {
                text: t('views.detail.editApiKey'),
                onClick() {
                    modal.handlers.apiKeyCreateEdit.open({
                        data: {
                            apiKeyId: apiKey.value?._id,
                        },
                    });
                },
            },
            {
                text: t('common.delete'),
                danger: true,
                async onClick() {
                    if (
                        !(await confirm(
                            t('views.apiKey.deleteTitle'),
                            t('views.apiKey.deleteConfirm'),
                        ))
                    ) {
                        return;
                    }
                    await throwable(
                        async () => {
                            await sdk.apiKey.deleteById({
                                apiKeyId: apiKey.value?._id as string,
                            });
                        },
                        async () => {
                            notification.success(
                                t('views.apiKey.deleted'),
                            );
                            await router.replace('/d/api-key');
                        },
                    );
                },
            },
        ]);

        function infoItem(label: string, value: string) {
            return (
                <div class={`flex gap-2 justify-between items-center`}>
                    <div class={`text-gray`}>{label}</div>
                    <div>{value}</div>
                </div>
            );
        }

        onMounted(async () => {
            loading.value = true;
            await throwable(
                async () => {
                    await sdk.apiKey.getAll();
                    if (apiKey.value) {
                        meta.set({ title: apiKey.value.name });
                    }
                    return {
                        templates: await sdk.template.getAll(),
                        fns: await sdk.fn.available(),
                    };
                },
                async (result) => {
                    data.value.templatesConfig = result.templates.map(
                        (template) => {
                            const templateConfig =
                                apiKey.value?.access.templates.find(
                                    (e) => e._id === template._id,
                                );
                            return {
                                id: template._id,
                                label: template.label,
                                name: template.name,
                                access: {
                                    get: templateConfig?.get || false,
                                    put: templateConfig?.put || false,
                                    post: templateConfig?.post || false,
                                    delete: templateConfig?.delete || false,
                                },
                            };
                        },
                    );
                    fns.value = result.fns;
                    data.value.fns =
                        apiKey.value?.access.functions.map((e) => {
                            return e.name;
                        }) || [];
                },
            );
            loading.value = false;
        });

        async function toggleKeyBlock() {
            await throwable(
                async () => {
                    if (apiKey.value) {
                        await sdk.apiKey.update({
                            _id: apiKey.value._id,
                            blocked: !apiKey.value.blocked,
                        });
                    }
                },
                async () => {
                    notification.success(
                        apiKey.value?.blocked
                            ? t('views.apiKey.blocked')
                            : t('views.apiKey.unblocked'),
                    );
                },
            );
        }

        async function updateAccess() {
            await throwable(async () => {
                console.log(data.value.fns);
                await sdk.apiKey.update({
                    _id: apiKey.value?._id as string,
                    access: {
                        templates: data.value.templatesConfig.map(
                            (templateConfig) => {
                                return {
                                    _id: templateConfig.id,
                                    name: templateConfig.name,
                                    get: templateConfig.access.get,
                                    post: templateConfig.access.post,
                                    put: templateConfig.access.put,
                                    delete: templateConfig.access.delete,
                                };
                            },
                        ),
                        functions: data.value.fns.map((fnName) => {
                            return {
                                name: fnName,
                            };
                        }),
                    },
                });
            });
        }

        function templateCard(templateConfig: TemplateConfig) {
            return (
                <div
                    class={`flex flex-col rounded-2.5 overflow-hidden border border-gray dark:border-gray bg-light dark:bg-darkGray mb-auto p-2 shadow-xl`}
                >
                    <h3 class={`mb-2`}>
                        {t('views.apiKey.templateCard', {
                            label: templateConfig.label,
                        })}
                    </h3>
                    <Button
                        class={`text-left mb-2`}
                        kind={`ghost`}
                        onClick={async () => {
                            if (
                                templateConfig.access.get &&
                                templateConfig.access.put &&
                                templateConfig.access.post &&
                                templateConfig.access.delete
                            ) {
                                templateConfig.access.get = false;
                                templateConfig.access.post = false;
                                templateConfig.access.put = false;
                                templateConfig.access.delete = false;
                            } else {
                                templateConfig.access.get = true;
                                templateConfig.access.post = true;
                                templateConfig.access.put = true;
                                templateConfig.access.delete = true;
                            }
                            await updateAccess();
                        }}
                    >
                        {t('modals.policy.checkAll')}
                    </Button>
                    <CheckBox
                        text={t('views.apiKey.canGet')}
                        value={templateConfig.access.get}
                        onInput={async (value) => {
                            templateConfig.access.get = value;
                            if (!value) {
                                templateConfig.access.put = false;
                                templateConfig.access.post = false;
                                templateConfig.access.delete = false;
                            }
                            await updateAccess();
                        }}
                    />
                    <CheckBox
                        text={t('views.apiKey.canCreate')}
                        value={templateConfig.access.post}
                        onInput={async (value) => {
                            templateConfig.access.post = value;
                            if (value) {
                                templateConfig.access.get = true;
                            }
                            await updateAccess();
                        }}
                    />
                    <CheckBox
                        text={t('views.apiKey.canUpdate')}
                        value={templateConfig.access.put}
                        onInput={async (value) => {
                            templateConfig.access.put = value;
                            if (value) {
                                templateConfig.access.get = true;
                            }
                            await updateAccess();
                        }}
                    />
                    <CheckBox
                        text={t('views.apiKey.canDelete')}
                        value={templateConfig.access.delete}
                        onInput={async (value) => {
                            templateConfig.access.delete = value;
                            if (value) {
                                templateConfig.access.get = true;
                            }
                            await updateAccess();
                        }}
                    />
                </div>
            );
        }

        function fnCard(fn: BCMSFunctionConfig) {
            return (
                <div
                    class={`flex flex-col rounded-2.5 overflow-hidden border border-gray dark:border-gray bg-light dark:bg-darkGray mb-auto p-2 shadow-xl`}
                >
                    <h3 class={`mb-2`}>
                        {t('views.apiKey.functionCard', { name: fn.name })}
                    </h3>
                    <CheckBox
                        text={t('views.apiKey.canCallFunction')}
                        value={!!data.value.fns.find((e) => e === fn.name)}
                        onInput={async (value) => {
                            if (value) {
                                data.value.fns.push(fn.name);
                            } else {
                                for (
                                    let i = 0;
                                    i < data.value.fns.length;
                                    i++
                                ) {
                                    if (data.value.fns[i] === fn.name) {
                                        data.value.fns.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                            await updateAccess();
                        }}
                    />
                </div>
            );
        }

        return () => (
            <>
                {loading.value || !apiKey.value ? (
                    <div
                        class={`w-full h-full flex items-center justify-center`}
                    >
                        <Loader show />
                    </div>
                ) : (
                    <div
                        class={`w-full flex flex-col gap-4 desktop:justify-center`}
                    >
                        <div class={`flex flex-col xs:flex-row gap-4`}>
                            <Breadcrumb
                                items={[
                                    {
                                        text: t('views.detail.home'),
                                        icon: '/home',
                                        href: '/d',
                                    },
                                    {
                                        text: t('nav.keyManager'),
                                        href: '/d/api-key',
                                    },
                                    {
                                        text: apiKey.value.name,
                                    },
                                ]}
                            />
                            <div class={`flex gap-2 ml-auto`}>
                                <Dropdown items={dropdownItems.value} />
                                <Button kind="danger" onClick={toggleKeyBlock}>
                                    {apiKey.value?.blocked
                                        ? t('views.apiKey.unblocked')
                                        : t('views.apiKey.blocked')}
                                </Button>
                            </div>
                        </div>
                        <div
                            class={`flex flex-col desktop:flex-row gap-2 desktop:gep-4 desktop:mt-6`}
                        >
                            <div>
                                <div class={`text-2xl`}>
                                    {apiKey.value?.name}
                                </div>
                            </div>
                            <div class={`mt-6 desktop:mt-0 desktop:ml-auto`}>
                                {infoItem(
                                    t('views.detail.id'),
                                    apiKey.value._id,
                                )}
                                {infoItem(
                                    t('views.detail.created'),
                                    millisToDateString(
                                        apiKey.value.createdAt,
                                        true,
                                    ),
                                )}
                                {infoItem(
                                    t('views.detail.updated'),
                                    millisToDateString(
                                        apiKey.value?.updatedAt,
                                        true,
                                    ),
                                )}
                                <div
                                    class={`flex gap-2 justify-between items-center`}
                                >
                                    <div class={`text-gray`}>
                                        {t('views.apiKey.secret')}
                                    </div>
                                    <button
                                        class={`flex gap-2 items-center text-dark dark:text-white hover:text-green dark:hover:text-yellow`}
                                        onClick={async () => {
                                            if (apiKey.value?.secret) {
                                                await navigator.clipboard.writeText(
                                                    apiKey.value?.secret,
                                                );
                                                notification.success(
                                                    t(
                                                        'views.apiKey.secretCopied',
                                                    ),
                                                );
                                            }
                                        }}
                                    >
                                        <div>
                                            {t('views.apiKey.copySecret')}
                                        </div>
                                        <div>
                                            <Icon
                                                class={`w-3 h-3 fill-current`}
                                                src={`/link`}
                                            />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div
                            class={`mt-8 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[15px] desktop:gap-x-5 desktop:gap-y-7.5`}
                        >
                            {data.value.templatesConfig.map(
                                (templateConfig) => {
                                    return templateCard(templateConfig);
                                },
                            )}
                        </div>
                        <div
                            class={`mt-8 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[15px] desktop:gap-x-5 desktop:gap-y-7.5`}
                        >
                            {fns.value.map((fn) => {
                                return fnCard(fn);
                            })}
                        </div>
                    </div>
                )}
            </>
        );
    },
});
export default ApiKeyView;

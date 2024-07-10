import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    Dropdown,
    type DropdownItem,
} from '@thebcms/selfhosted-ui/components/dropdown';
import { Loader } from '@thebcms/selfhosted-ui/components/loader';
import { Breadcrumb } from '@thebcms/selfhosted-ui/components/breadcrumb';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import { millisToDateString } from '@thebcms/selfhosted-ui/util/date';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';
import type { UserPolicyCRUD } from '@thebcms/selfhosted-backend/user/models/policy';
import { CheckBox } from '@thebcms/selfhosted-ui/components/inputs/check-box';

export interface TemplateConfig {
    id: string;
    label: string;
    name: string;
    access: UserPolicyCRUD;
}

export const ApiKeyView = defineComponent({
    setup() {
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

        const data = ref<{
            templatesConfig: TemplateConfig[];
        }>({
            templatesConfig: [],
        });

        meta.set({ title: `API Key` });

        const loading = ref(true);
        const dropdownItems: DropdownItem[] = [
            {
                text: 'Edit API Key',
                onClick() {
                    modal.handlers.apiKeyCreateEdit.open({
                        data: {
                            apiKeyId: apiKey.value?._id,
                        },
                    });
                },
            },
            {
                text: 'Delete',
                danger: true,
                async onClick() {
                    if (
                        !(await confirm(
                            'Delete API Key',
                            'Are you sure you' +
                                ' want to delete this API Key?',
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
                                'API Key deleted successfully',
                            );
                            await router.replace('/d/api-key');
                        },
                    );
                },
            },
        ];

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
                    return await sdk.template.getAll();
                },
                async (templates) => {
                    data.value.templatesConfig = templates.map((template) => {
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
                    });
                },
            );
            loading.value = false;
        });

        async function updateAccess() {
            await throwable(async () => {
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
                        functions: [],
                    },
                });
            });
        }

        function templateCard(templateConfig: TemplateConfig) {
            return (
                <div
                    class={`flex flex-col rounded-2.5 overflow-hidden border border-gray dark:border-gray bg-light dark:bg-darkGray mb-auto p-2 shadow-xl`}
                >
                    <h3 class={`mb-2`}>Template {templateConfig.label}</h3>
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
                        Check all
                    </Button>
                    <CheckBox
                        text={`Can get`}
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
                        text={`Can create`}
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
                        text={`Can update`}
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
                        text={`Can delete`}
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
                                        text: 'Home',
                                        icon: '/home',
                                        href: '/d',
                                    },
                                    {
                                        text: 'Key manager',
                                        href: '/d/api-key',
                                    },
                                    {
                                        text: apiKey.value.name,
                                    },
                                ]}
                            />
                            <div class={`flex gap-2 ml-auto`}>
                                <Dropdown items={dropdownItems} />
                                <Button kind="danger" onClick={() => {}}>
                                    {apiKey.value?.blocked
                                        ? 'Unblock the key'
                                        : 'Block the key'}
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
                                {infoItem('ID', apiKey.value._id)}
                                {infoItem(
                                    'Created',
                                    millisToDateString(
                                        apiKey.value.createdAt,
                                        true,
                                    ),
                                )}
                                {infoItem(
                                    'Updated',
                                    millisToDateString(
                                        apiKey.value?.updatedAt,
                                        true,
                                    ),
                                )}
                                <div
                                    class={`flex gap-2 justify-between items-center`}
                                >
                                    <div class={`text-gray`}>Secret</div>
                                    <button
                                        class={`flex gap-2 items-center text-dark dark:text-white hover:text-green dark:hover:text-yellow`}
                                        onClick={async () => {
                                            if (apiKey.value?.secret) {
                                                await navigator.clipboard.writeText(
                                                    apiKey.value?.secret,
                                                );
                                                notification.success(
                                                    'API key secret copied to the clipboard',
                                                );
                                            }
                                        }}
                                    >
                                        <div>Click to copy secret</div>
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
                    </div>
                )}
            </>
        );
    },
});
export default ApiKeyView;

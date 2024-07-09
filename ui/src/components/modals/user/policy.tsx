import { computed, defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@thebcms/selfhosted-ui/components/modals/_wrapper';
import type { UserProtected } from '@thebcms/selfhosted-backend/user/models/main';
import type {
    UserPolicy,
    UserPolicyCRUD,
    UserPolicyTemplate,
} from '@thebcms/selfhosted-backend/user/models/policy';
import { Toggle } from '@thebcms/selfhosted-ui/components/inputs/toggle';
import { CheckBox } from '@thebcms/selfhosted-ui/components/inputs/check-box';
import type { Template } from '@thebcms/selfhosted-backend/template/models/main';
import { Button } from '@thebcms/selfhosted-ui/components/button';

interface UserPolicyTemplateExtended extends UserPolicyTemplate {
    template: Template;
}

interface UserPolicyExtended extends Omit<UserPolicy, 'templates'> {
    templates: UserPolicyTemplateExtended[];
}

export interface ModalUserPolicyInput {
    userId: string;
}

export const ModalUserPolicy = defineComponent({
    props: getModalDefaultProps<ModalUserPolicyInput, void>(),
    setup(props) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const notification = window.bcms.notification;

        const advancedMode = ref(false);
        const data = ref<ModalUserPolicyInput>({
            userId: '',
        });
        const templates = computed(() => sdk.store.template.items());
        const policy = ref<UserPolicyExtended>(getPolicy());

        function getPolicy(user?: UserProtected): UserPolicyExtended {
            if (!user) {
                return {
                    templates: [],
                    media: {
                        put: false,
                        post: false,
                        get: false,
                        delete: false,
                    },
                };
            }
            const uPolicy = user.customPool.policy;
            return {
                media: uPolicy.media,
                templates: templates.value.map(
                    (template): UserPolicyTemplateExtended => {
                        const tPolicy = uPolicy.templates.find(
                            (e) => e._id === template._id,
                        );
                        if (tPolicy) {
                            return {
                                _id: template._id,
                                template,
                                put: tPolicy.put,
                                get: tPolicy.get,
                                delete: tPolicy.delete,
                                post: tPolicy.post,
                            };
                        }
                        return {
                            _id: template._id,
                            template,
                            put: false,
                            get: false,
                            delete: false,
                            post: false,
                        };
                    },
                ),
            };
        }

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                if (event?.data) {
                    data.value = event.data;
                }
                policy.value = getPolicy();
                throwable(
                    async () => {
                        await sdk.template.getAll();
                        await sdk.user.getAll();
                        if (event?.data && event.data.userId) {
                            return await sdk.user.get(event.data.userId);
                        }
                    },
                    async (user) => {
                        if (user) {
                            policy.value = getPolicy(user);
                        }
                    },
                ).catch((err) => console.error(err));
            };
            handler._onDone = async () => {
                await throwable(
                    async () => {
                        await sdk.user.update({
                            _id: data.value.userId,
                            customPool: {
                                policy: {
                                    media: {
                                        put: policy.value.media.put,
                                        get: policy.value.media.get,
                                        post: policy.value.media.post,
                                        delete: policy.value.media.delete,
                                    },
                                    templates: policy.value.templates.map(
                                        (e) => {
                                            return {
                                                _id: e._id,
                                                put: e.put,
                                                post: e.post,
                                                delete: e.delete,
                                                get: e.get,
                                            };
                                        },
                                    ),
                                },
                            },
                        });
                    },
                    async () => {
                        notification.success('User added successfully');
                    },
                );
                return [true, undefined];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        function getCrudOptions(title: string, crudData: UserPolicyCRUD) {
            return (
                <div>
                    <div class={`flex items-center gap-4 text-2xl mb-4`}>
                        <div class={`text-green dark:text-yellow`}>{title}</div>
                        <Button
                            class={`mr-auto`}
                            kind="ghost"
                            onClick={() => {
                                let value = true;
                                if (
                                    crudData.post &&
                                    crudData.put &&
                                    crudData.delete &&
                                    crudData.get
                                ) {
                                    value = false;
                                }
                                crudData.post = value;
                                crudData.get = value;
                                crudData.put = value;
                                crudData.delete = value;
                            }}
                        >
                            Check all
                        </Button>
                    </div>
                    <div class={`ml-4 flex flex-col gap-2`}>
                        <CheckBox
                            text={`Can get resources`}
                            value={crudData.get}
                            onInput={(value) => {
                                crudData.get = value;
                                if (!value) {
                                    crudData.post = false;
                                    crudData.put = false;
                                    crudData.delete = false;
                                }
                            }}
                        />
                        <CheckBox
                            text={`Can add data`}
                            value={crudData.post}
                            onInput={(value) => {
                                crudData.post = value;
                                if (value) {
                                    crudData.get = true;
                                }
                            }}
                        />
                        <CheckBox
                            text={`Can update data`}
                            value={crudData.put}
                            onInput={(value) => {
                                crudData.put = value;
                                if (value) {
                                    crudData.get = true;
                                }
                            }}
                        />
                        <CheckBox
                            text={`Can delete data`}
                            value={crudData.delete}
                            onInput={(value) => {
                                crudData.delete = value;
                                if (value) {
                                    crudData.get = true;
                                }
                            }}
                        />
                    </div>
                </div>
            );
        }

        return () => (
            <ModalWrapper
                title={'Edit policy'}
                handler={props.handler}
                doneText={'Update'}
            >
                <div class={`flex flex-col gap-4`}>
                    <Toggle
                        label={'View mode'}
                        value={advancedMode.value}
                        description={advancedMode.value ? 'Advanced' : 'Simple'}
                        onInput={(value) => {
                            advancedMode.value = value;
                        }}
                    />
                    {advancedMode.value ? (
                        <div class={`flex flex-col gap-10`}>
                            <div>
                                <div
                                    class={`uppercase text-xs mb-2 border-b border-b-gray py-3`}
                                >
                                    Media permissions
                                </div>
                                {getCrudOptions('Media', policy.value.media)}
                            </div>
                            <div>
                                <div
                                    class={`uppercase text-xs mb-2 border-b border-b-gray py-3`}
                                >
                                    Template permissions
                                </div>
                                <div class={`flex flex-col gap-8`}>
                                    {policy.value.templates.map((tPolicy) => {
                                        return getCrudOptions(
                                            tPolicy.template.label,
                                            tPolicy,
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div class={`flex flex-col gap-5`}>
                            <div
                                class={`bg-light dark:bg-darkGray rounded-2xl shadow-input`}
                            >
                                <CheckBox
                                    class={`px-5 py-3`}
                                    text={`Can view and edit Media`}
                                    value={
                                        policy.value.media.get &&
                                        policy.value.media.post &&
                                        policy.value.media.delete &&
                                        policy.value.media.put
                                    }
                                    onInput={(value) => {
                                        policy.value.media.get = value;
                                        policy.value.media.put = value;
                                        policy.value.media.delete = value;
                                        policy.value.media.post = value;
                                    }}
                                />
                            </div>
                            {policy.value.templates.map((tPolicy) => {
                                return (
                                    <div
                                        class={`bg-light dark:bg-darkGray rounded-2xl shadow-input`}
                                    >
                                        <CheckBox
                                            class={`px-5 py-3`}
                                            text={`Can view and edit ${tPolicy.template.label}`}
                                            value={
                                                tPolicy.get &&
                                                tPolicy.put &&
                                                tPolicy.post &&
                                                tPolicy.delete
                                            }
                                            onInput={(value) => {
                                                tPolicy.get = value;
                                                tPolicy.put = value;
                                                tPolicy.delete = value;
                                                tPolicy.post = value;
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </ModalWrapper>
        );
    },
});

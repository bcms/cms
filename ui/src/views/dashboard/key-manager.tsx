import type {
  BCMSApiKey,
  BCMSApiKeyAddData,
  BCMSTemplate,
} from '@becomes/cms-sdk/types';
import {
  computed,
  defineComponent,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  ref,
  Teleport,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  BCMSButton,
  BCMSCheckboxArrayInput,
  BCMSCheckboxInput,
  BCMSEmptyState,
  BCMSManagerInfo,
  BCMSManagerNav,
  BCMSManagerSecret,
} from '../../components';
import { useBcmsModalService } from '../../services';
import { useTranslation } from '../../translations';
import { BCMSLastRoute } from '@ui/util';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const headMeta = window.bcms.meta;
    const mounted = ref(false);
    const store = window.bcms.vue.store;
    const route = useRoute();
    const router = useRouter();
    const modal = useBcmsModalService();
    const changes = ref(false);
    const templates = computed(() => {
      const items: BCMSTemplate[] = JSON.parse(
        JSON.stringify(store.getters.template_items),
      );
      return items.sort((a, b) => (a.name < b.name ? -1 : 1));
    });
    const functions = ref<
      Array<{
        name: string;
        public: boolean;
        selected: boolean;
      }>
    >([]);
    const plugins = ref<Array<{ name: string; selected: boolean }>>([]);
    const params = computed(() => {
      return route.params as {
        kid: string;
      };
    });
    const key = ref<{
      items: BCMSApiKey[];
      target?: BCMSApiKey;
    }>({
      items: [],
    });
    const templatePermissionValues =
      translations.value.page.keyManager.templatePermission.values;
    const functionPermissionValues =
      translations.value.page.keyManager.functionPermission.values;
    const routerBeforeEachUnsub = router.beforeEach((_, __, next) => {
      if (changes.value) {
        window.bcms
          .confirm(
            translations.value.page.keyManager.confirm.pageLeave.title,
            translations.value.page.keyManager.confirm.pageLeave.description,
          )
          .then((result) => {
            if (result) {
              changes.value = false;
              next();
            } else {
              next(route.path);
            }
          });
      } else {
        next();
      }
    });
    const logic = {
      async create(data: BCMSApiKeyAddData) {
        await window.bcms.util.throwable(
          async () => {
            return await window.bcms.sdk.apiKey.create(data);
          },
          async (result) => {
            key.value = {
              items: await window.bcms.sdk.apiKey.getAll(),
              target: result,
            };
            router.push(`/dashboard/key-manager/${result._id}`);
          },
        );
      },
      async remove() {
        const currentKey = key.value.target;

        if (
          currentKey &&
          (await window.bcms.confirm(
            translations.value.page.keyManager.confirm.remove.title,
            translations.value.page.keyManager.confirm.remove.description({
              label: key.value.target?.name,
            }),
          ))
        ) {
          await window.bcms.util.throwable(
            async () => {
              await window.bcms.sdk.apiKey.deleteById(currentKey._id);
            },
            async () => {
              changes.value = false;
              key.value.items = key.value.items.filter(
                (e) => e._id !== currentKey._id,
              );

              window.bcms.notification.success(
                translations.value.page.keyManager.notification
                  .keyDeleteSuccess,
              );

              if (key.value.items.length === 0) {
                BCMSLastRoute.keyManager = '';
                key.value.target = undefined;
                router.push('/dashboard/key-manager');
              } else {
                router.push({
                  path: `/dashboard/key-manager/${key.value.items[0]?._id}`,
                  replace: true,
                });
              }
            },
          );
        }
      },
      // async redirect() {
      //   if (!BCMS.kid && params.value.kid) {
      //     lastState.kid = params.value.kid as string;
      //   }
      //   const targetId = lastState.kid
      //     ? lastState.kid
      //     : key.value.items[0]?._id;
      //   if (targetId) {
      //     await router.push({
      //       path: '/dashboard/key-manager/' + targetId,
      //       replace: true,
      //     });
      //   }
      // },
      edit() {
        const target = key.value.target;

        if (target) {
          window.bcms.modal.apiKey.addUpdate.show({
            title: translations.value.modal.addUpdateApiKey.editTitle({
              label: target.name,
            }),
            name: target.name,
            desc: target.desc,
            async onDone(data) {
              await window.bcms.util.throwable(
                async () => {
                  return await window.bcms.sdk.apiKey.update({
                    _id: target._id,
                    name: data.name,
                    desc: data.desc,
                  });
                },
                async (k) => {
                  target.name = k.name;
                  target.desc = k.desc;
                },
              );
            },
          });
        }
      },
    };

    headMeta.set({
      title: translations.value.page.keyManager.meta.title,
    });

    async function init() {
      await window.bcms.util.throwable(
        async () => {
          return await window.bcms.sdk.apiKey.getAll();
        },
        async (keys) => {
          let target = keys.find((e) => e._id === params.value.kid);

          if (target) {
            headMeta.set({
              title: translations.value.page.keyManager.meta.dynamicTitle({
                label: target.name,
              }),
            });
          } else {
            target = keys[0];
          }
          if (target) {
            key.value = {
              items: keys,
              target: JSON.parse(JSON.stringify(target)),
            };
          }
        },
      );
      // if (!key.value.target) {
      //   if (key.value.items.length > 0) {
      //     await redirect();
      //   }
      // } else {
      //   await redirect();
      // }

      if (templates.value.length === 0) {
        await window.bcms.util.throwable(async () => {
          return await window.bcms.sdk.template.getAll();
        });
      }
      if (functions.value.length === 0) {
        await window.bcms.util.throwable(
          async () => {
            return await window.bcms.sdk.function.getAll();
          },
          async (result) => {
            functions.value = result.map((e) => {
              return {
                name: e.name,
                public: e.public as never,
                selected: key.value.target
                  ? !!key.value.target.access.functions.find(
                      (f) => f.name === e.name,
                    )
                  : false,
              };
            });
          },
        );
      } else {
        functions.value.forEach((fn) => {
          fn.selected = key.value.target
            ? !!key.value.target.access.functions.find(
                (f) => f.name === fn.name,
              )
            : false;
        });
      }
      if (plugins.value.length === 0) {
        await window.bcms.util.throwable(
          async () => {
            return await window.bcms.sdk.plugin.getAll();
          },
          async (result) => {
            plugins.value = result.map((plugin) => {
              return {
                name: plugin.name,
                selected:
                  key.value.target && key.value.target.access.plugins
                    ? !!key.value.target.access.plugins.find(
                        (e) => e.name === plugin.name,
                      )
                    : false,
              };
            });
          },
        );
      } else {
        plugins.value = plugins.value.map((plugin) => {
          plugin.selected =
            key.value.target && key.value.target.access.plugins
              ? !!key.value.target.access.plugins.find(
                  (e) => e.name === plugin.name,
                )
              : false;
          return plugin;
        });
      }
    }
    async function redirect() {
      BCMSLastRoute.keyManager = route.params.kid as string;
      const targetId = BCMSLastRoute.keyManager
        ? BCMSLastRoute.keyManager
        : key.value.items[0]._id;
      if (targetId) {
        console.log('HERE', targetId);
        // await router.push({
        //   path: '/dashboard/key-manager/' + targetId,
        //   replace: true,
        // });
      }
    }
    onMounted(async () => {
      window.onbeforeunload = () => {
        if (changes.value) {
          return true;
        }
      };
      // await redirect();
      await init();
      mounted.value = true;
    });
    onUnmounted(() => {
      window.onbeforeunload = () => {
        return null;
      };
      if (routerBeforeEachUnsub) {
        routerBeforeEachUnsub();
      }
    });
    onBeforeUpdate(async () => {
      if (key.value.target && BCMSLastRoute.keyManager !== params.value.kid) {
        await redirect();
        await init();
      }
    });

    return () => (
      <div class="apiKeyManager">
        {key.value.target && mounted.value ? (
          <Teleport to="#managerNav">
            <BCMSManagerNav
              label={translations.value.page.keyManager.nav.label}
              actionText={translations.value.page.keyManager.nav.actionText}
              items={key.value.items.map((e) => {
                return {
                  name: e.name,
                  link: `/dashboard/key-manager/${e._id}`,
                  selected: key.value.target?._id === e._id,
                  onClick: () => {
                    router.push({
                      path: `/dashboard/key-manager/${e._id}`,
                      replace: true,
                    });
                  },
                };
              })}
              onAction={() => {
                modal.apiKey.addUpdate.show({
                  async onDone(data) {
                    await logic.create({
                      ...data,
                      blocked: false,
                      access: { templates: [], functions: [] },
                    });
                  },
                });
              }}
            />
          </Teleport>
        ) : (
          ''
        )}
        {mounted.value && (
          <>
            {key.value.items.length > 0 ? (
              key.value.target ? (
                <>
                  <BCMSManagerInfo
                    id={key.value.target._id}
                    name={key.value.target.name}
                    createdAt={key.value.target.createdAt}
                    updatedAt={key.value.target.updatedAt}
                    description={key.value.target.desc}
                    key={key.value.target._id}
                    onEdit={logic.edit}
                  />
                  <BCMSManagerSecret
                    label={
                      translations.value.page.keyManager.input.secret.label
                    }
                    secret={key.value.target.secret}
                    class="mb-5"
                  />
                  <BCMSCheckboxInput
                    cyTag="block"
                    description={
                      translations.value.page.keyManager.input.block.label
                    }
                    value={key.value.target.blocked}
                    helperText={
                      translations.value.page.keyManager.input.block.helperText
                    }
                    onInput={(value) => {
                      if (key.value.target) {
                        changes.value = true;
                        key.value.target.blocked = value;
                      }
                    }}
                    class="mb-15"
                  />
                  <div class="mb-15">
                    <h2 class="mb-5 text-xl font-normal dark:text-light">
                      {
                        translations.value.page.keyManager.templatePermission
                          .title
                      }
                    </h2>
                    {templates.value.length > 0 ? (
                      templates.value.map((template) => {
                        const target = key.value.target as BCMSApiKey;
                        let templateIndex = target.access.templates.findIndex(
                          (e) => e._id === template._id,
                        );

                        let data = {
                          get: false,
                          put: false,
                          post: false,
                          delete: false,
                        };

                        if (templateIndex > -1) {
                          data = target.access.templates[templateIndex];
                        } else {
                          templateIndex = target.access.templates.push({
                            ...data,
                            _id: template._id,
                            name: template.name,
                          });
                        }

                        return (
                          <BCMSCheckboxArrayInput
                            key={key.value.target?._id + template._id}
                            title={
                              <span class="text-pink dark:text-yellow">
                                {template.label}
                              </span>
                            }
                            initialValue={[
                              {
                                desc: templatePermissionValues[0].description,
                                selected: data.get,
                              },
                              {
                                desc: templatePermissionValues[1].description,
                                selected: data.post,
                              },
                              {
                                desc: templatePermissionValues[2].description,
                                selected: data.put,
                              },
                              {
                                desc: templatePermissionValues[3].description,
                                selected: data.delete,
                              },
                            ]}
                            onChange={(event) => {
                              changes.value = true;
                              target.access.templates[templateIndex] = {
                                _id: target.access.templates[templateIndex]._id,
                                name: template.name,
                                get: event[0].selected,
                                post: event[1].selected,
                                put: event[2].selected,
                                delete: event[3].selected,
                              };
                            }}
                            class="mb-15"
                          />
                        );
                      })
                    ) : (
                      <div class="mt-5 text-2xl text-grey">
                        {
                          translations.value.page.keyManager.templatePermission
                            .emptyTitle
                        }
                      </div>
                    )}
                  </div>
                  {functions.value.length > 0 && (
                    <div class="mb-15">
                      <h2 class="mb-5 text-xl font-normal dark:text-light">
                        {
                          translations.value.page.keyManager.functionPermission
                            .title
                        }
                      </h2>
                      {functions.value.map((fn) => {
                        const data = key.value.target?.access.functions.find(
                          (e) => e.name === fn.name,
                        );
                        if (fn.public) {
                          return (
                            <div class="mb-10 text-sm">
                              <div class="mb-2 text-2xl font-normal leading-tight text-pink dark:text-yellow">
                                {fn.name}
                              </div>
                              <div class="font-normal leading-tight text-dark">
                                {
                                  translations.value.page.keyManager
                                    .functionPermission.public
                                }
                              </div>
                            </div>
                          );
                        }

                        return (
                          <BCMSCheckboxArrayInput
                            class="mb-15"
                            title={
                              <span class="text-pink dark:text-yellow">
                                {fn.name}
                              </span>
                            }
                            initialValue={[
                              {
                                desc:
                                  functionPermissionValues &&
                                  functionPermissionValues[0]
                                    ? functionPermissionValues[0].description
                                    : translations.value.page.keyManager
                                        .functionPermission.emptyDescription,
                                selected: !!data,
                              },
                            ]}
                            onChange={(event) => {
                              changes.value = true;
                              const target = key.value.target as BCMSApiKey;
                              const fnAvailable = target.access.functions.find(
                                (e) => e.name === fn.name,
                              );

                              if (event[0].selected && !fnAvailable) {
                                target.access.functions.push({ name: fn.name });
                              } else if (!event[0].selected && fnAvailable) {
                                target.access.functions =
                                  target.access.functions.filter(
                                    (e) => e.name !== fn.name,
                                  );
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                  {plugins.value.length > 0 && (
                    <div class="mb-15">
                      <h2 class="mb-5 text-xl font-normal dark:text-light">
                        {
                          translations.value.page.keyManager.pluginPermission
                            .title
                        }
                      </h2>
                      {plugins.value.map((plugin) => {
                        const data = key.value.target?.access.plugins?.find(
                          (e) => e.name === plugin.name,
                        );
                        return (
                          <BCMSCheckboxArrayInput
                            class="mb-15"
                            title={
                              <span class="text-pink dark:text-yellow">
                                {plugin.name}
                              </span>
                            }
                            initialValue={[
                              {
                                desc: translations.value.page.keyManager
                                  .pluginPermission.checkboxText,
                                selected: !!data,
                              },
                            ]}
                            onChange={(event) => {
                              changes.value = true;
                              const target = key.value.target as BCMSApiKey;
                              const pluginAvailable =
                                target.access.plugins?.find(
                                  (e) => e.name === plugin.name,
                                );
                              if (event[0].selected && !pluginAvailable) {
                                if (!target.access.plugins) {
                                  target.access.plugins = [];
                                }
                                target.access.plugins?.push({
                                  name: plugin.name,
                                });
                              } else if (
                                !event[0].selected &&
                                pluginAvailable
                              ) {
                                target.access.plugins =
                                  target.access.plugins?.filter(
                                    (e) => e.name !== plugin.name,
                                  );
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                  <div class="fixed bottom-20 right-5 flex flex-col gap-2.5 desktop:fixed desktop:bottom-[unset] desktop:top-7.5 desktop:flex-row">
                    <BCMSButton
                      cyTag="delete-policy"
                      kind="danger"
                      onClick={logic.remove}
                    >
                      {translations.value.page.keyManager.actions.delete}
                    </BCMSButton>
                    <BCMSButton
                      cyTag="update-policy"
                      disabled={!changes.value}
                      onClick={async () => {
                        await window.bcms.util.throwable(
                          async () => {
                            const target = key.value.target as BCMSApiKey;

                            return await window.bcms.sdk.apiKey.update(target);
                          },
                          async () => {
                            window.bcms.notification.success(
                              translations.value.page.keyManager.notification
                                .keyUpdateSuccess,
                            );
                            changes.value = false;
                          },
                        );
                      }}
                    >
                      {translations.value.page.keyManager.actions.update}
                    </BCMSButton>
                  </div>
                </>
              ) : (
                ''
              )
            ) : (
              <BCMSEmptyState
                src="/keys.png"
                maxWidth="200px"
                maxHeight="325px"
                class="mt-40 md:absolute md:bottom-32 md:right-32"
                clickHandler={() => {
                  modal.apiKey.addUpdate.show({
                    async onDone(data) {
                      await logic.create({
                        ...data,
                        blocked: false,
                        access: { templates: [], functions: [] },
                      });
                    },
                  });
                }}
                ctaText={
                  translations.value.page.keyManager.emptyState.actionText
                }
                title={translations.value.page.keyManager.emptyState.title}
                subtitle={
                  translations.value.page.keyManager.emptyState.subtitle
                }
              />
            )}
          </>
        )}
      </div>
    );
  },
});

export default component;

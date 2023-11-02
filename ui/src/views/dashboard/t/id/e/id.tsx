/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type BCMSEntry,
  type BCMSLanguage,
  type BCMSSocketSyncChangeDataProp,
  BCMSSocketSyncChangeType,
  type BCMSSocketTemplateEvent,
  type BCMSTemplate,
  type BCMSUserPolicyTemplate,
  BCMSJwtRoleName,
} from '@becomes/cms-sdk/types';
import { BCMSSocketEventName } from '@becomes/cms-sdk/types';
import {
  computed,
  defineComponent,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';
import {
  BCMSSpinner,
  BCMSSelect,
  BCMSButton,
  BCMSEntryStatus,
  BCMSPropEditor,
  BCMSContentEditor,
  BCMSMetaTitle,
  BCMSInstructions,
  BCMSUserAvatar,
} from '../../../../../components';
import type { BCMSEntryExtended } from '../../../../../types';
import type { Editor, JSONContent } from '@tiptap/core';
import { useRoute, useRouter } from 'vue-router';
import { useTranslation } from '../../../../../translations';
import {
  BCMSEntrySyncService,
  createBcmsEntrySync,
} from '../../../../../services';
import {
  patienceDiff,
  patienceDiffToSocket,
  userLocations,
} from '../../../../../util';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const throwable = window.bcms.util.throwable;
    const store = window.bcms.vue.store;
    const route = useRoute();
    const params = computed(() => {
      return route.params as { eid: string; tid: string };
    });
    const policy = computed<BCMSUserPolicyTemplate>(() => {
      const user = store.getters.user_me;
      if (user) {
        if (user.roles[0].name === BCMSJwtRoleName.ADMIN) {
          return {
            _id: template.value?._id || '',
            get: true,
            post: true,
            put: true,
            delete: true,
          };
        }
        const tPolicy = user.customPool.policy.templates.find(
          (e) => e._id === template.value?._id,
        );
        if (tPolicy) {
          return tPolicy;
        }
      }
      return {
        _id: template.value?._id || '',
        get: false,
        post: false,
        put: false,
        delete: false,
      };
    });
    const contentSyncFeat = computed(() =>
      store.getters.feature_available('content_sync'),
    );
    const router = useRouter();
    const activeLanguage = ref(window.bcms.sdk.storage.get('lang'));
    const entry = ref<BCMSEntryExtended>();
    const doNotAutoFillSlug = ref<{ [lngCode: string]: boolean }>({});
    const loaded = ref(false);
    const user = computed(() => store.getters.user_me);
    const spinner = ref({
      message: translations.value.page.entry.spinner.message,
      show: true,
    });
    const metaProps = computed(() => {
      if (!entry.value || !language.value.target) {
        return [];
      }
      return entry.value.meta[language.value.targetIndex].props.slice(2);
    });
    const template = computed(() => {
      return store.getters.template_findOne((e) => e.cid === params.value.tid);
    });
    const language = computed<{
      items: BCMSLanguage[];
      target: BCMSLanguage;
      targetIndex: number;
    }>(() => {
      const langs = store.getters.language_items;
      const langIndex = langs.findIndex((e) => e.code === activeLanguage.value);
      if (langIndex === -1) {
        return {
          items: langs,
          target: {
            code: 'en',
            _id: '',
            name: 'en',
            updatedAt: 0,
            createdAt: 0,
            userId: '',
            def: false,
            nativeName: 'en',
          },
          targetIndex: 0,
        };
      }
      return { items: langs, target: langs[langIndex], targetIndex: langIndex };
    });
    const changes = ref(false);
    let editor: Editor | undefined;
    let idBuffer = '';
    const entrySync = createBcmsEntrySync({
      uri: window.location.pathname,
      getEntry() {
        if (entry.value && editor) {
          const ent = entry.value as BCMSEntryExtended;
          ent.content[language.value.targetIndex].nodes = (
            (editor as Editor).getJSON().content as JSONContent[]
          ).map((e) => {
            if (
              e.type === 'widget' &&
              typeof (e.attrs as any).widget === 'string'
            ) {
              (e.attrs as any).widget = JSON.parse((e.attrs as any).widget);
              (e.attrs as any).content = JSON.parse((e.attrs as any).content);
            }
            return e;
          });
          return ent;
        }
        return null;
      },
      setEntryMeta(meta) {
        if (entry.value) {
          entry.value.meta = meta;
        }
      },
    });
    BCMSEntrySyncService.set({
      entry: entry,
      instance: entrySync,
      language: language,
      template: template,
    });
    const routerBeforeEachUnsub = router.beforeEach((_, __, next) => {
      if (checkForChanges()) {
        window.bcms
          .confirm(
            translations.value.page.entry.confirm.pageLeave.title,
            translations.value.page.entry.confirm.pageLeave.description,
          )
          .then((result) => {
            if (result) {
              entrySync.unsync();
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

    const entryUnsub = window.bcms.sdk.socket.subscribe(
      BCMSSocketEventName.TEMPLATE,
      async (event) => {
        if (entry.value) {
          const data = event as BCMSSocketTemplateEvent;
          if (data.tm === entry.value.templateId) {
            await init();
          }
        }
      },
    );

    onMounted(async () => {
      window.onbeforeunload = beforeWindowUnload;
      idBuffer = params.value.tid + params.value.eid;
      await init();
      await window.bcms.util.throwable(async () => {
        if (contentSyncFeat.value && params.value.eid !== 'create') {
          await entrySync.sync();
          await entrySync.createUsers();
          entrySync.onChange((event) => {
            if (event.sct === BCMSSocketSyncChangeType.PROP) {
              const data = event.data as BCMSSocketSyncChangeDataProp;
              if (entry.value) {
                if (
                  data.sd ||
                  typeof data.rep !== 'undefined' ||
                  data.addI ||
                  data.remI ||
                  data.movI
                ) {
                  entrySync.updateEntry(entry.value, data);
                }
              }
            }
          });
        }
      });
      loaded.value = true;
    });

    onBeforeUpdate(async () => {
      const id = params.value.tid + params.value.eid;
      if (idBuffer !== id) {
        idBuffer = id;
        await init();
      }
    });

    onUnmounted(async () => {
      entryUnsub();
      window.onbeforeunload = () => {
        // ...
      };
      if (routerBeforeEachUnsub) {
        routerBeforeEachUnsub();
      }
      if (BCMSEntrySyncService.instance) {
        BCMSEntrySyncService.instance.unsync();
      }
      BCMSEntrySyncService.clear();
    });

    function beforeWindowUnload() {
      const userIds = Object.keys(entrySync.users);
      if (checkForChanges() && userIds.length === 0) {
        return translations.value.page.entry.didYouSave;
      }
    }

    async function init() {
      spinner.value.show = true;
      window.bcms.meta.set({
        title: `${
          params.value.eid === 'create'
            ? translations.value.page.entry.meta.createTitle
            : translations.value.page.entry.meta.updateTitle
        }`,
      });
      if (!template.value) {
        await throwable(
          async () => {
            return await window.bcms.sdk.template.get(
              params.value.tid as string,
            );
          },
          undefined,
          async (error) => {
            const err = error as { status: number };
            if (err.status === 404) {
              await router.push({ path: '/', replace: true });
            }
          },
        );
      }
      if (language.value.items.length === 0) {
        await throwable(async () => {
          return await window.bcms.sdk.language.getAll();
        });
      }
      let langCode = window.bcms.sdk.storage.get('lang');
      const lng = language.value.items.find((e) => e.code === langCode);
      if (
        (!langCode && language.value.items.length > 0) ||
        (language.value.items.length > 0 && !lng)
      ) {
        langCode = language.value.items[0].code;
        window.bcms.sdk.storage.set('lang', langCode);
      }
      activeLanguage.value = langCode;
      if (!template.value) {
        window.bcms.notification.error(
          translations.value.page.entry.notification.emptyTemplate,
        );
        return;
      }
      if (params.value.eid === 'create') {
        const entryInstance = await window.bcms.entry.toExtended({
          template: template.value,
        });
        if (entryInstance) {
          entry.value = entryInstance;
        }
      } else {
        let ent: BCMSEntry | undefined = undefined;
        if (params.value.eid === 'single') {
          await window.bcms.util.throwable(
            async () => {
              const temp = await window.bcms.sdk.template.get(params.value.tid);
              if (temp) {
                const targets = await window.bcms.sdk.entry.getAllLite({
                  templateId: temp._id,
                });
                if (targets.length > 0) {
                  return await window.bcms.sdk.entry.get({
                    templateId: targets[0].templateId,
                    entryId: targets[0]._id,
                  });
                }
              }
            },
            async (result) => {
              ent = result;
            },
          );
        } else {
          ent = store.getters.entry_findOne((e) => e._id === params.value.eid);
        }
        if (ent) {
          const entryInstance = await window.bcms.entry.toExtended({
            template: template.value,
            entry: ent,
          });
          if (entryInstance) {
            entry.value = entryInstance;
          }
        } else {
          await throwable(
            async () => {
              return await window.bcms.sdk.entry.get({
                templateId: params.value.tid as string,
                entryId: params.value.eid as string,
              });
            },
            async (result) => {
              const entryInstance = await window.bcms.entry.toExtended({
                template: template.value as BCMSTemplate,
                entry: result,
              });
              if (entryInstance) {
                entry.value = entryInstance;
              }
              if (language.value) {
                window.bcms.meta.set({
                  title: (result.meta[0].props[0].data as string[])[0],
                });
              }
            },
            async (error) => {
              const err = error as { status: number };
              if (err.status === 404) {
                const pathParts = window.location.pathname.split('/');
                await router.push({
                  path:
                    pathParts.slice(0, pathParts.length - 1).join('/') +
                    '/create',
                  replace: true,
                });
              }
            },
          );
        }
        const clientEntry: {
          sync: boolean;
          entry?: BCMSEntryExtended;
        } = await window.bcms.sdk.send({
          url: `/socket/sync/entry/${template.value._id}/${entry.value?._id}`,
          method: 'GET',
          headers: {
            Authorization: '',
          },
        });
        if (clientEntry.sync && clientEntry.entry) {
          entry.value = clientEntry.entry;
        }
      }
      for (let i = 0; i < language.value.items.length; i++) {
        const l = language.value.items[i];
        const meta = entry.value?.meta.find((e) => e.lng === l.code);
        doNotAutoFillSlug.value[l.code] = !!(
          meta?.props[1].data as string[]
        )[0];
      }
      spinner.value.show = false;
    }

    function checkForChanges(): boolean {
      return changes.value;
    }

    function selectLanguage(id: string) {
      const newLngIndex = language.value.items.findIndex((e) => e._id === id);
      if (newLngIndex !== -1) {
        const newLng = language.value.items[newLngIndex];
        const activeLngIndex = language.value.items.findIndex(
          (e) => e.code === activeLanguage.value,
        );
        if (entry.value && activeLngIndex !== -1) {
          entry.value.content[activeLngIndex].nodes = (
            editor as Editor
          ).getJSON().content as JSONContent[];
        }
        activeLanguage.value = newLng.code;
        window.bcms.sdk.storage.set('lang', newLng.code);
      }
    }

    function handlerTitleInput(value: string) {
      changes.value = true;
      if (!entry.value || !language.value) {
        return;
      }
      const curr = (
        entry.value.meta[language.value.targetIndex].props[0].data as string[]
      )[0] as string;
      const target = value;
      if (contentSyncFeat.value) {
        if (target !== curr) {
          const diff = patienceDiffToSocket(
            patienceDiff(curr.split(''), target.split('')).lines,
          );
          entrySync.emit.propValueChange({
            propPath: `m${language.value.target.code}0.data.0`,
            languageCode: language.value.target.code,
            languageIndex: language.value.targetIndex,
            sd: diff,
          });
        }
      }
      (
        entry.value.meta[language.value.targetIndex].props[0].data as string[]
      )[0] = value;
      if (!doNotAutoFillSlug.value[language.value.target.code]) {
        const slugCurr = (
          entry.value.meta[language.value.targetIndex].props[1].data as string[]
        )[0];
        const slugTarget = window.bcms.util.string.toSlug(value);
        (
          entry.value.meta[language.value.targetIndex].props[1].data as string[]
        )[0] = slugTarget;
        if (contentSyncFeat.value) {
          const diff = patienceDiffToSocket(
            patienceDiff(slugCurr.split(''), slugTarget.split('')).lines,
          );
          entrySync.emit.propValueChange({
            propPath: `m${language.value.target.code}1.data.0`,
            languageCode: language.value.target.code,
            languageIndex: language.value.targetIndex,
            sd: diff,
          });
        }
      }
      window.bcms.meta.set({ title: value });
    }

    function handleSlugInput(event: Event) {
      changes.value = true;
      if (!entry.value || !language.value) {
        return;
      }
      const element = event.target as HTMLInputElement;
      const slugCurr = (
        entry.value.meta[language.value.targetIndex].props[1].data as string[]
      )[0];
      const slugTarget = window.bcms.util.string.toSlug(element.value);
      (
        entry.value.meta[language.value.targetIndex].props[1].data as string[]
      )[0] = slugTarget;
      if (contentSyncFeat.value) {
        const diff = patienceDiffToSocket(
          patienceDiff(slugCurr.split(''), slugTarget.split('')).lines,
        );
        entrySync.emit.propValueChange({
          propPath: `m${language.value.target.code}1.data.0`,
          languageCode: language.value.target.code,
          languageIndex: language.value.targetIndex,
          sd: diff,
        });
      }
      doNotAutoFillSlug.value[language.value.target.code] = true;
    }

    async function save() {
      if (!window.bcms.prop.checker.validate()) {
        window.bcms.notification.warning(
          translations.value.page.entry.notification.entryErrors,
        );
        return;
      }
      spinner.value.message =
        translations.value.page.entry.spinner.savingMessage;
      spinner.value.show = true;
      const ent = entry.value as BCMSEntryExtended;
      ent.content[language.value.targetIndex].nodes = (
        (editor as Editor).getJSON().content as JSONContent[]
      ).map((e) => {
        if (
          e.type === 'widget' &&
          typeof (e.attrs as any).widget === 'string'
        ) {
          (e.attrs as any).widget = JSON.parse((e.attrs as any).widget);
          (e.attrs as any).content = JSON.parse((e.attrs as any).content);
        }
        return e;
      });
      const normalEntry = window.bcms.entry.fromExtended({
        extended: ent,
      });
      await throwable(
        async () => {
          return await window.bcms.sdk.entry.create({
            templateId: normalEntry.templateId,
            meta: normalEntry.meta,
            content: normalEntry.content,
            status: normalEntry.status,
          });
        },
        async (result) => {
          window.bcms.notification.success(
            translations.value.page.entry.notification.entrySaveSuccess,
          );
          if (routerBeforeEachUnsub) {
            routerBeforeEachUnsub();
          }
          changes.value = false;
          await router.push({
            path: route.path.replace('/create', `/${result.cid}`),
            replace: true,
          });
        },
      );
      spinner.value.show = false;
    }

    async function update() {
      if (!window.bcms.prop.checker.validate()) {
        window.bcms.notification.warning(
          translations.value.page.entry.notification.entryErrors,
        );
        return;
      }
      spinner.value.message =
        translations.value.page.entry.spinner.savingMessage;
      spinner.value.show = true;
      const ent = entry.value as BCMSEntryExtended;
      ent.content[language.value.targetIndex].nodes = (
        (editor as Editor).getJSON().content as JSONContent[]
      ).map((e) => {
        if (
          e.type === 'widget' &&
          typeof (e.attrs as any).widget === 'string'
        ) {
          (e.attrs as any).widget = JSON.parse((e.attrs as any).widget);
          (e.attrs as any).content = JSON.parse((e.attrs as any).content);
        }
        return e;
      });
      const normalEntry = window.bcms.entry.fromExtended({
        extended: ent,
      });

      await throwable(
        async () => {
          return await window.bcms.sdk.entry.update({
            _id: ent._id,
            templateId: normalEntry.templateId,
            meta: normalEntry.meta,
            content: normalEntry.content,
            status: normalEntry.status,
          });
        },
        async () => {
          window.bcms.notification.success(
            translations.value.page.entry.notification.entrySaveSuccess,
          );
          changes.value = false;
          // await router.push({
          //   path: route.path.replace('/create', `/${result.cid}`),
          //   replace: true,
          // });
        },
      );
      spinner.value.show = false;
    }

    return () => (
      <div class="pt-6 pb-8 text-base z-100 desktop:pt-7 desktop:pb-12">
        {template.value &&
        entry.value &&
        metaProps.value &&
        language.value.target &&
        user.value &&
        (loaded.value || !spinner.value.show) ? (
          <>
            <div class="flex justify-end gap-2.5 mb-6 desktop:fixed desktop:z-200 desktop:top-7.5 desktop:right-15">
              <div
                id="bcms-avatar-container"
                class="flex -space-x-2 overflow-hidden flex-shrink-0"
              />
              <div class="flex -space-x-2 overflow-hidden flex-shrink-0">
                {store.getters.feature_available('who_is_editing')
                  ? userLocations.value
                      .filter((e) => e.path === route.path)
                      .map((e) => {
                        return <BCMSUserAvatar user={e.user} />;
                      })
                  : ''}
              </div>
              {language.value.items.length > 1 ? (
                <BCMSSelect
                  cyTag="select-lang"
                  selected={language.value.target._id}
                  options={language.value.items.map((e) => {
                    return { label: `${e.name}`, value: e._id };
                  })}
                  onChange={(options) => {
                    if (options.value) {
                      selectLanguage(options.value);
                    }
                  }}
                />
              ) : (
                ''
              )}
              <BCMSEntryStatus
                selected={entry.value ? entry.value.status : ''}
                onChange={(statusId) => {
                  if (entry.value) {
                    changes.value = true;
                    entry.value.status = statusId;
                  }
                }}
              />
              {policy.value.put || policy.value.post ? (
                <BCMSButton
                  cyTag="add-update"
                  kind="primary"
                  disabled={
                    !(changes.value && (policy.value.put || policy.value.post))
                  }
                  onClick={async () => {
                    if (params.value.eid === 'create') {
                      await save();
                    } else {
                      await update();
                    }
                  }}
                >
                  {params.value.eid === 'create'
                    ? translations.value.page.entry.actions.save
                    : translations.value.page.entry.actions.update}
                </BCMSButton>
              ) : (
                ''
              )}
            </div>
            <div class="w-full max-w-full desktop:max-w-150">
              {template.value.desc && (
                <BCMSInstructions content={template.value.desc} />
              )}
              <div
                v-cy={'meta'}
                class="bg-white bg-opacity-50 border border-grey border-opacity-20 rounded-3.5 py-6 px-2.5 select-none sm:px-5 dark:bg-darkGrey dark:bg-opacity-50"
              >
                <div class="mb-4">
                  <BCMSMetaTitle
                    label={translations.value.page.entry.input.title.label}
                    value={
                      (
                        entry.value.meta[language.value.targetIndex].props[0]
                          .data as string[]
                      )[0] as string
                    }
                    placeholder={translations.value.page.entry.input.title.placeholder(
                      {
                        label: template.value.label,
                      },
                    )}
                    onInput={(value) => {
                      handlerTitleInput(value);
                    }}
                  />
                </div>
                <div
                  class={`${
                    entry.value.meta[language.value.targetIndex].props.length >
                    2
                      ? 'mb-11'
                      : ''
                  }`}
                >
                  <div class="mt-4 flex-nowrap">
                    <label
                      data-bcms-prop-path="m1.0"
                      class="rounded-4.5 border border-grey bg-white px-4.5 flex items-center transition-all duration-300 hover:border-opacity-50 outline-none hover:outline-none hover:shadow-input focus-within:border-opacity-50 focus-within:shadow-input dark:bg-darkGrey"
                    >
                      <span class="p-0 m-0 leading-tight border-0 outline-none text-dark placeholder-dark placeholder-opacity-60 dark:text-light">
                        /
                      </span>
                      <input
                        v-cy={'slug'}
                        id="slug"
                        value={
                          (
                            entry.value.meta[language.value.targetIndex]
                              .props[1].data as string[]
                          )[0]
                        }
                        placeholder={
                          translations.value.page.entry.input.slug.placeholder
                        }
                        onChange={handleSlugInput}
                        onKeyup={handleSlugInput}
                        class="flex-grow py-2 leading-tight bg-transparent outline-none focus:outline-none placeholder-dark placeholder-opacity-60 dark:text-light dark:placeholder-light dark:placeholder-opacity-50 h-11"
                      />
                    </label>
                  </div>
                </div>
                {entry.value.meta[language.value.targetIndex].props.length >
                2 ? (
                  <BCMSPropEditor
                    basePropPath={`m${language.value.target.code}`}
                    propsOffset={2}
                    props={metaProps.value}
                    lng={language.value.target.code}
                    parentId={language.value.target.code}
                    onUpdate={(value, propPath) => {
                      const path = window.bcms.prop.pathStrToArr(propPath);
                      if (entry.value) {
                        if (typeof value === 'string') {
                          const curr: string =
                            window.bcms.prop.getValueFromPath(
                              entry.value.meta[language.value.targetIndex]
                                .props,
                              path,
                            );
                          if (typeof curr === 'string') {
                            if (contentSyncFeat.value) {
                              entrySync.emit.propValueChange({
                                propPath,
                                languageCode: language.value.target.code,
                                languageIndex: language.value.targetIndex,
                                sd: patienceDiffToSocket(
                                  patienceDiff(curr.split(''), value.split(''))
                                    .lines,
                                ),
                              });
                            }
                          }
                        } else if (!propPath.endsWith('nodes')) {
                          if (contentSyncFeat.value) {
                            entrySync.emit.propValueChange({
                              propPath,
                              languageCode: language.value.target.code,
                              languageIndex: language.value.targetIndex,
                              replaceValue: value,
                            });
                          }
                        }
                        window.bcms.prop.mutateValue.any(
                          entry.value.meta[language.value.targetIndex].props,
                          path,
                          value,
                        );
                      }
                      changes.value = true;
                    }}
                    onAdd={async (propPath) => {
                      if (entry.value && template.value) {
                        await window.bcms.prop.mutateValue.addArrayItem(
                          entry.value.meta[language.value.targetIndex].props,
                          template.value.props,
                          window.bcms.prop.pathStrToArr(propPath),
                          language.value.target.code,
                        );
                        changes.value = true;
                        if (contentSyncFeat.value) {
                          entrySync.emit.propAddArrayItem({
                            propPath,
                            languageCode: language.value.target.code,
                            languageIndex: language.value.targetIndex,
                          });
                        }
                      }
                    }}
                    onRemove={(propPath) => {
                      if (entry.value) {
                        window.bcms.prop.mutateValue.removeArrayItem(
                          entry.value.meta[language.value.targetIndex].props,
                          window.bcms.prop.pathStrToArr(propPath),
                        );
                        changes.value = true;
                        if (contentSyncFeat.value) {
                          entrySync.emit.propRemoveArrayItem({
                            propPath,
                            languageCode: language.value.target.code,
                            languageIndex: language.value.targetIndex,
                          });
                        }
                      }
                    }}
                    onMove={(propPath, data) => {
                      if (entry.value) {
                        const path = window.bcms.prop.pathStrToArr(propPath);
                        window.bcms.prop.mutateValue.reorderArrayItems(
                          entry.value.meta[language.value.targetIndex].props,
                          path,
                          data,
                        );
                        changes.value = true;
                        if (contentSyncFeat.value) {
                          entrySync.emit.propMoveArrayItem({
                            propPath,
                            languageCode: language.value.target.code,
                            languageIndex: language.value.targetIndex,
                            data,
                          });
                        }
                      }
                    }}
                    onUpdateContent={(propPath, updates) => {
                      if (contentSyncFeat.value) {
                        entrySync.emit.contentUpdate({
                          propPath: propPath,
                          languageCode: language.value.target.code,
                          languageIndex: language.value.targetIndex,
                          data: {
                            updates,
                          },
                        });
                      }
                    }}
                  />
                ) : (
                  ''
                )}
              </div>
              <div v-cy={'content'} class="pt-16">
                <BCMSContentEditor
                  id={entry.value._id}
                  content={entry.value.content[language.value.targetIndex]}
                  lng={language.value.target.code}
                  entrySync={entrySync}
                  propPath={`c${language.value.target.code}`}
                  showCollaborationCursor
                  user={user.value}
                  onEditorReady={(edtr) => {
                    setTimeout(() => {
                      editor = edtr;
                      editor.on('update', () => {
                        changes.value = true;
                      });
                    }, 100);
                  }}
                  onUpdateContent={(propPath, updates) => {
                    if (contentSyncFeat.value) {
                      entrySync.emit.contentUpdate({
                        propPath: propPath,
                        languageCode: language.value.target.code,
                        languageIndex: language.value.targetIndex,
                        data: {
                          updates,
                        },
                      });
                    }
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          ''
        )}
        <BCMSSpinner
          show={spinner.value.show}
          message={spinner.value.message}
        />
      </div>
    );
  },
});
export default component;

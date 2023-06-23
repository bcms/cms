import { computed, defineComponent, onBeforeUpdate, onMounted, ref } from 'vue';
import type {
  BCMSTemplate,
  BCMSLanguage,
  BCMSEntryLite,
  BCMSEntry,
  BCMSUserPolicyTemplate,
} from '@becomes/cms-sdk/types';
import { BCMSJwtRoleName } from '@becomes/cms-sdk/types';
import {
  BCMSSpinner,
  BCMSEntryFilter,
  BCMSEntryTable,
} from '../../../../../components';
import type { BCMSEntryFilters } from '../../../../../types';
import { useRoute, useRouter } from 'vue-router';
import { useTranslation } from '../../../../../translations';
import { search } from '@banez/search';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const throwable = window.bcms.util.throwable;
    const router = useRouter();
    const route = useRoute();
    const store = window.bcms.vue.store;
    const filters = ref<BCMSEntryFilters>();
    const activeLanguage = ref(window.bcms.sdk.storage.get('lang'));
    const params = computed(() => route.params as { tid: string });
    const language = computed<{
      items: BCMSLanguage[];
      target: BCMSLanguage;
      targetIndex: number;
    }>(() => {
      const langs = store.getters.language_items;
      const langIndex = langs.findIndex((e) => e.code === activeLanguage.value);
      if (langIndex === -1) {
        if (langs[0]) {
          return {
            items: langs,
            target: langs[0],
            targetIndex: 0,
          };
        }
      }
      return { items: langs, target: langs[langIndex], targetIndex: langIndex };
    });
    const template = computed(() => {
      const tmp = store.getters.template_findOne(
        (e) => e.cid === params.value.tid,
      );
      if (tmp) {
        window.bcms.meta.set({
          title: translations.value.page.entries.meta.dynamicTitle({
            label: tmp.label,
          }),
        });
      }
      return tmp;
    });
    const entriesLite = computed(() => {
      if (!template.value) {
        return [];
      }
      const output = store.getters.entryLite_find(
        (e) => e.templateId === (template.value as BCMSTemplate)._id,
      );
      return output.sort((a, b) => b.createdAt - a.createdAt);
    });
    const entriesInView = computed(() => {
      let output = [...entriesLite.value];
      if (filters.value) {
        const fltr = filters.value as BCMSEntryFilters;
        if (fltr.search.name.length) {
          const searchResult = search({
            searchTerm: fltr.search.name,
            set: entriesLite.value.map((entry) => {
              return {
                id: entry._id,
                data: [
                  `${entry._id} ${entry.cid} ${entry.status || ''}`,
                  (
                    entry.meta[language.value.targetIndex].props[0]
                      .data as string[]
                  )[0].toLowerCase(),
                  entry.meta[language.value.targetIndex].props[2]
                    ? (
                        entry.meta[language.value.targetIndex].props[2]
                          .data as string[]
                      )[0].toLowerCase()
                    : '',
                ],
              };
            }),
          });
          output = searchResult.items.map((item) => {
            return entriesLite.value.find(
              (e) => e._id === item.id,
            ) as BCMSEntryLite;
          });
        }
      }
      return output;
    });
    const showSpinner = ref(true);
    const mounted = ref(false);
    let tidBuffer = '';
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

    function selectLanguage(id: string) {
      const lng = language.value.items.find((e) => e._id === id);
      if (lng) {
        activeLanguage.value = lng.code;
        window.bcms.sdk.storage.set('lang', language.value.target.code);
      }
    }
    async function remove(entryLite: BCMSEntryLite) {
      if (
        await window.bcms.confirm(
          translations.value.page.entries.confirm.remove.title,
          translations.value.page.entries.confirm.remove.description({
            label: (
              entryLite.meta[language.value.targetIndex].props[0]
                .data as string[]
            )[0],
          }),
        )
      ) {
        await throwable(
          async () => {
            await window.bcms.sdk.entry.deleteById({
              templateId: entryLite.templateId,
              entryId: entryLite._id,
            });
          },
          async () => {
            window.bcms.notification.success(
              translations.value.page.entries.notification.entryDeleteSuccess({
                label: (
                  entryLite.meta[language.value.targetIndex].props[0]
                    .data as string[]
                )[0],
              }),
            );
          },
        );
      }
    }
    async function duplicateEntry(entryLite: BCMSEntryLite) {
      if (
        await window.bcms.confirm(
          translations.value.page.entries.confirm.duplicate.title,
          translations.value.page.entries.confirm.duplicate.description({
            label: (
              entryLite.meta[language.value.targetIndex].props[0]
                .data as string[]
            )[0],
          }),
        )
      ) {
        await throwable(
          async () => {
            const entry: BCMSEntry = JSON.parse(
              JSON.stringify(
                await window.bcms.sdk.entry.get({
                  templateId: entryLite.templateId,
                  entryId: entryLite._id,
                }),
              ),
            );
            for (let i = 0; i < entry.meta.length; i++) {
              (entry.meta[i].props[0].data as string[])[0] =
                'Copy of ' + (entry.meta[i].props[0].data as string[])[0];
              (entry.meta[i].props[1].data as string[])[0] =
                'copy-of-' + (entry.meta[i].props[1].data as string[])[0];
            }
            return await window.bcms.sdk.entry.create({
              templateId: entryLite.templateId,
              status: entry.status,
              meta: entry.meta,
              content: entry.content,
            });
          },
          async () => {
            window.bcms.notification.success(
              translations.value.page.entries.notification
                .entryDuplicateSuccess,
            );
          },
        );
      }
    }

    onMounted(async () => {
      await throwable(async () => {
        await window.bcms.sdk.status.getAll();
        await window.bcms.sdk.media.getAll();
      });
      if (!params.value.tid) {
        window.bcms.notification.error(
          translations.value.page.entries.notification.emptyTemplate,
        );
        await router.push({
          path: '/dashboard',
          replace: true,
        });
        return;
      }
      const langCode = window.bcms.sdk.storage.get('lang');
      let lng = language.value.items.find((e) => e.code === langCode);
      if (!lng) {
        await throwable(
          async () => {
            return await window.bcms.sdk.language.getAll();
          },
          async (result) => {
            if (!langCode && result.length > 0) {
              await window.bcms.sdk.storage.set('lang', result[0].code);
            }
            lng = language.value.items.find((e) => e.code === langCode);
            if (lng) {
              activeLanguage.value = lng.code;
            }
          },
        );
      }
      if (!template.value) {
        window.bcms.meta.set({
          title: translations.value.page.entries.meta.title,
        });
        await throwable(async () => {
          return await window.bcms.sdk.template.get(route.params.tid as string);
        });
      }
      tidBuffer = template.value?._id || '';
      if (template.value?.singleEntry) {
        await router.push({
          path: window.location.pathname + '/1',
          replace: true,
        });
      }
      if (entriesLite.value.length === 0 && template.value) {
        const tmp = template.value as BCMSTemplate;
        await throwable(async () => {
          await window.bcms.sdk.entry.getAllLite({
            templateId: tmp._id,
          });
        });
      }
      showSpinner.value = false;
      mounted.value = true;
    });
    onBeforeUpdate(async () => {
      if (mounted.value && template.value && tidBuffer !== template.value._id) {
        tidBuffer = template.value._id;
        showSpinner.value = true;
        const tmp = template.value as BCMSTemplate;
        await throwable(async () => {
          await window.bcms.sdk.entry.getAllLite({
            templateId: tmp._id,
          });
        });
        showSpinner.value = false;
      }
    });

    return () => (
      <div class="min-h-full py-7.5 desktop:py-0">
        {template.value && language.value ? (
          <>
            <BCMSEntryFilter
              template={template.value}
              entryCount={entriesInView.value.length}
              languages={language.value.items}
              visibleLanguage={{
                index: language.value.targetIndex,
                data: language.value.target,
              }}
              onFilter={(eventFilters) => {
                filters.value = eventFilters;
              }}
              disableAddEntry={!policy.value.post}
              onAddEntry={() => {
                router.push(route.path + '/create');
              }}
              onSelectLanguage={selectLanguage}
            />
            <div>
              <BCMSEntryTable
                lng={language.value.target?.code}
                policy={policy.value}
                template={template.value}
                entries={entriesInView.value}
                visibleLanguage={{
                  index: language.value.targetIndex,
                  data: language.value.target,
                }}
                onRemove={remove}
                onDuplicate={duplicateEntry}
              />
            </div>
          </>
        ) : (
          <BCMSSpinner
            show={true}
            message={translations.value.page.entries.spinner.message}
          />
        )}
        <BCMSSpinner show={showSpinner.value} />
      </div>
    );
  },
});
export default component;

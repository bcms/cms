import {
  type BCMSEntryLite,
  BCMSJwtRoleName,
  type BCMSLanguage,
  type BCMSMedia,
  BCMSPropType,
  type BCMSTemplate,
  type BCMSUserPolicyTemplate,
} from '@becomes/cms-sdk/types';
import {
  computed,
  defineComponent,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  type PropType,
  ref,
} from 'vue';
import BCMSTimestampDisplay from '../timestamp-display';
import BCMSLink from '../link';
import BCMSIcon from '../icon';
import { BCMSOverflowMenu, BCMSOverflowMenuItem } from '../overflow';
import { BCMSEmptyState, BCMSImage } from '..';
import { useTranslation } from '../../translations';
import type { BCMSWhereIsItUsedItem } from '../../types';
import { BCMSUserAvatar } from '../user-avatar';
import { userLocations } from '../../util';

const CHUNK_SIZE = 10;

const component = defineComponent({
  props: {
    template: { type: Object as PropType<BCMSTemplate>, required: true },
    entries: { type: Array as PropType<BCMSEntryLite[]>, required: true },
    lng: String,
    visibleLanguage: {
      type: Object as PropType<{ data: BCMSLanguage; index: number }>,
      required: true,
    },
    policy: {
      type: Object as PropType<BCMSUserPolicyTemplate>,
      required: true,
    },
  },
  emits: {
    remove: (_: BCMSEntryLite) => {
      return true;
    },
    duplicate: (_: BCMSEntryLite) => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });
    let visibleChunks = 1;
    const showToIndex = ref(CHUNK_SIZE);
    let tidBuffer = '';
    const store = window.bcms.vue.store;
    const entries = computed(() => {
      if (props.entries.length === 0) {
        return [];
      }
      const template = store.getters.template_findOne(
        (e) => e._id === props.entries[0].templateId,
      );
      return props.entries.map((entry) => {
        let status = '';
        if (entry.status) {
          const fullStatus = store.getters.status_findOne(
            (e) => e._id === entry.status,
          );
          if (fullStatus) {
            status = fullStatus.label;
          }
        }
        let imageId: string | undefined;
        let subtitle: string | undefined;
        let meta = entry.meta.find((e) => e.lng === props.lng);
        if (!meta) {
          meta = entry.meta[0];
        }
        if (template) {
          for (let i = 2; i < meta.props.length; i++) {
            const prop = meta.props[i];
            const tProp = template.props.find((e) => e.id === prop.id);
            if (tProp && prop.data) {
              if (
                tProp.type === BCMSPropType.MEDIA &&
                (prop.data as BCMSMedia[])[0]
              ) {
                imageId = (prop.data as BCMSMedia[])[0]._id;
              } else if (tProp.type === BCMSPropType.STRING) {
                subtitle = (prop.data as string[])[0];
              }
            }
          }
        }
        return {
          ...entry,
          title: (meta.props[0].data as string[])[0],
          image: store.getters.media_findOne((e) => e._id === imageId),
          subtitle,
          status,
        };
      });
    });
    const hasData = computed(() => {
      return {
        image: !!entries.value.find((e) => e.image),
        status: !!entries.value.find((e) => e.status),
      };
    });

    function loadMore() {
      visibleChunks++;
      showToIndex.value = visibleChunks * CHUNK_SIZE;
    }
    function onScroll(event: Event) {
      const el = event.target as HTMLBodyElement;
      if (
        showToIndex.value < props.entries.length &&
        el.scrollTop + window.innerHeight === el.scrollHeight
      ) {
        loadMore();
      }
    }

    async function whereIsUsed(data: {
      eid: string;
      tid: string;
      title: string;
    }) {
      await window.bcms.util.throwable(
        async () => {
          const result = await window.bcms.sdk.entry.whereIsItUsed({
            templateId: data.tid,
            entryId: data.eid,
          });
          const user = await window.bcms.sdk.user.get();
          const policy = user.customPool.policy;
          const items: BCMSWhereIsItUsedItem[] = [];
          for (let i = 0; i < result.length; i++) {
            const item = result[i];
            if (
              user.roles[0].name === BCMSJwtRoleName.ADMIN ||
              policy.templates.find((e) => e._id === item.tid)
            ) {
              const template = await window.bcms.sdk.template.get(item.tid);
              const entry = await window.bcms.sdk.entry.getLite({
                templateId: item.tid,
                entryId: item.eid,
              });
              items.push({
                type: 'entry',
                label: template.label,
                id: entry.cid,
                template: {
                  id: template.cid,
                  label: template.label,
                },
                linkText: (entry.meta[0].props[0].data as string[])[0],
              });
            }
          }
          return items;
        },
        async (items) => {
          window.bcms.modal.whereIsItUsed.show({
            colsVisible: {
              label: true,
              location: true,
            },
            title: translations.value.modal.whereIsItUsed.groupTitle({
              label: data.title,
            }),
            items,
          });
        },
      );
    }

    document.body.addEventListener('scroll', onScroll);

    onMounted(() => {
      tidBuffer = props.template._id;
    });
    onBeforeUpdate(() => {
      if (tidBuffer !== props.template._id) {
        tidBuffer = props.template._id;
        visibleChunks = 1;
        showToIndex.value = CHUNK_SIZE;
        document.body.scrollTo({ top: 0 });
      }
    });
    onUnmounted(() => {
      document.body.removeEventListener('scroll', onScroll);
    });

    return () => (
      <>
        {props.entries.length > 0 ? (
          <>
            <ul v-cy={'entries-list'} class="list-none">
              <li
                class={`bcmsEntryTable bcmsEntryTable${
                  hasData.value.image ? '_wi' : ''
                }${
                  hasData.value.status ? '_ws' : ''
                } grid grid-cols-1 py-5 border-b border-dark border-opacity-20 gap-5 text-base leading-tight -tracking-0.01 items-center justify-between first:hidden md:first:grid md:border-grey md:border-opacity-50 md:relative md:first:font-semibold dark:text-light`}
              >
                {hasData.value.image ? <div /> : ''}
                <div>
                  <span>{translations.value.page.entries.table.createdAt}</span>
                </div>
                <div>
                  <span>{translations.value.page.entries.table.updatedAt}</span>
                </div>
                {hasData.value.status ? (
                  <div>
                    <span>{translations.value.page.entries.table.status}</span>
                  </div>
                ) : (
                  ''
                )}
                <div class="truncate">
                  <span>{translations.value.page.entries.table.title}</span>
                </div>
              </li>
              {entries.value.map((entryLite, entryLiteIndex) => {
                if (entryLiteIndex > showToIndex.value) {
                  return '';
                }
                return (
                  <li
                    v-cy={`item-${entryLiteIndex}`}
                    class={`bcmsEntryTable bcmsEntryTable${
                      hasData.value.image ? '_wi' : ''
                    }${hasData.value.status ? '_ws' : ''}
                relative grid grid-cols-1 py-5 border-b border-dark border-opacity-20 gap-5 text-base leading-tight -tracking-0.01 items-center justify-between first:hidden md:grid-cols-[minmax(100px,0.1fr),minmax(100px,0.1fr),0.8fr,145px] md:first:grid md:border-grey md:border-opacity-50 md:relative md:first:font-semibold`}
                    style={`z-index: ${props.entries.length - entryLiteIndex}`}
                  >
                    {hasData.value.image ? (
                      <div
                        class="col-start-1 before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-semibold before:text-grey before:text-xs before:leading-tight before:mr-5 md:col-start-[unset] md:before:hidden"
                        data-column-name="Image"
                      >
                        {entryLite.image ? (
                          <BCMSImage
                            class="object-cover w-20 h-20 inline md:w-[80px] md:h-[80px] rounded-2.5"
                            media={entryLite.image}
                            alt={entryLite.title}
                          />
                        ) : (
                          ''
                        )}
                      </div>
                    ) : (
                      ''
                    )}
                    <div
                      class="col-start-1 before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-semibold before:text-grey before:text-xs before:leading-tight before:mr-5 md:col-start-[unset] md:before:hidden dark:text-light dark:text-light"
                      data-column-name="Created At"
                    >
                      <BCMSTimestampDisplay timestamp={entryLite.createdAt} />
                    </div>
                    <div
                      class="col-start-1 before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-semibold before:text-grey before:text-xs before:leading-tight before:mr-5 md:col-start-[unset] md:before:hidden dark:text-light dark:text-light"
                      data-column-name="Updated At"
                    >
                      <BCMSTimestampDisplay timestamp={entryLite.updatedAt} />
                    </div>
                    {hasData.value.status ? (
                      <div
                        class="col-start-1 before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-semibold before:text-grey before:text-xs before:leading-tight before:mr-5 md:col-start-[unset] md:before:hidden dark:text-light"
                        data-column-name="Status"
                      >
                        <span>{entryLite.status || ''}</span>
                      </div>
                    ) : (
                      ''
                    )}
                    <div
                      class="col-start-1 before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-semibold before:text-grey before:text-xs before:leading-tight before:mr-5 md:col-start-[unset] md:before:hidden dark:text-light"
                      data-column-name="Title"
                      title={entryLite.title}
                    >
                      <span>{entryLite.title}</span>
                      {entryLite.subtitle ? (
                        <div class="text-grey">
                          {entryLite.subtitle
                            .split(' ')
                            .map((e) => {
                              if (e.length > 20) {
                                return (
                                  e.slice(0, 10) +
                                  '[...]' +
                                  e.slice(e.length - 10, e.length)
                                );
                              }
                            })
                            .join(' ')}
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                    <div class="mb-auto flex col-start-2 col-end-3 row-start-1 row-end-3 items-center items-end md:mb-0 md:col-start-[unset] md:col-end-[unset] md:row-start-[unset] md:row-end-[unset] md:flex-row md:items-center">
                      <div>
                        {store.getters.feature_available('who_is_editing')
                          ? userLocations.value
                              .filter(
                                (e) =>
                                  e.path ===
                                  `/dashboard/t/${props.template.cid}/e/${entryLite.cid}`,
                              )
                              .map((e) => {
                                return <BCMSUserAvatar user={e.user} />;
                              })
                          : ''}
                      </div>
                      <BCMSLink
                        disabled={!props.policy.get}
                        cyTag="edit"
                        href={`/dashboard/t/${props.template.cid}/e/${entryLite.cid}`}
                        class={`group rounded-3.5 transition-shadow duration-300 flex items-center font-medium text-base leading-normal -tracking-0.01 whitespace-normal no-underline border border-solid select-none ${'hover:shadow-btnAlternate hover:text-dark hover:text-opacity-100 focus:shadow-btnAlternate focus:text-dark focus:text-opacity-100 active:shadow-btnAlternate active:text-dark active:text-opacity-100'} bg-light border-light text-dark text-opacity-80 py-1.5 px-3.5 md:mb-0 md:mr-5 dark:bg-darkGrey dark:border-darkGrey`}
                      >
                        <BCMSIcon
                          class={`text-sm mr-5 w-5 h-5 text-grey fill-current transition-colors duration-200 ${
                            props.policy.put
                              ? 'group-hover:text-green group-focus-visible:text-green dark:group-hover:text-yellow dark:group-focus-visible:text-yellow'
                              : ''
                          } dark:text-light`}
                          src="/edit"
                        />
                        <span class="relative z-10 transition-colors duration-200 dark:text-light">
                          {props.policy.put
                            ? translations.value.page.entries.table.edit
                            : translations.value.page.entries.table.view}
                        </span>
                      </BCMSLink>
                      <BCMSOverflowMenu cyTag="overflow" position="right">
                        {props.policy.post && props.policy.put ? (
                          <BCMSOverflowMenuItem
                            cyTag="duplicate"
                            text={
                              translations.value.page.entries.table
                                .overflowItems.duplicate
                            }
                            icon="copy"
                            onClick={() => {
                              ctx.emit('duplicate', entryLite);
                            }}
                          />
                        ) : (
                          ''
                        )}
                        <BCMSOverflowMenuItem
                          cyTag="view-model"
                          text={
                            translations.value.page.entries.table.overflowItems
                              .viewModel
                          }
                          icon="code"
                          onClick={() => {
                            window.bcms.modal.entry.viewModel.show({
                              templateId: entryLite.templateId,
                              entryId: entryLite._id,
                            });
                          }}
                        />
                        <BCMSOverflowMenuItem
                          cyTag="where-is-it-used"
                          text={
                            translations.value.page.entries.table.overflowItems
                              .whereIsUsed
                          }
                          icon="link"
                          onClick={() => {
                            whereIsUsed({
                              eid: entryLite._id,
                              tid: entryLite.templateId,
                              title: entryLite.title,
                            });
                          }}
                        />
                        {props.policy.delete ? (
                          <BCMSOverflowMenuItem
                            cyTag="remove"
                            text={
                              translations.value.page.entries.table
                                .overflowItems.remove
                            }
                            icon="trash"
                            onClick={() => {
                              ctx.emit('remove', entryLite);
                            }}
                          />
                        ) : (
                          ''
                        )}
                      </BCMSOverflowMenu>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <BCMSEmptyState
            src="/entries.png"
            maxWidth="270px"
            maxHeight="325px"
            class="md:absolute md:bottom-32 md:right-32"
          />
        )}
      </>
    );
  },
});
export default component;

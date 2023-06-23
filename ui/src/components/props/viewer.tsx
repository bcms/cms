import { computed, defineComponent, onMounted, type PropType } from 'vue';
import type {
  BCMSProp,
  BCMSPropEntryPointerData,
  BCMSPropGroupPointerData,
} from '@becomes/cms-sdk/types';
import { BCMSPropType } from '@becomes/cms-sdk/types';
import BCMSButton from '../button';
import BCMSIcon from '../icon';
import BCMSLink from '../link';
import { BCMSOverflowMenu, BCMSOverflowMenuItem } from '../overflow';
import { useTranslation } from '../../translations';

const component = defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
    props: { type: Array as PropType<BCMSProp[]>, required: true },
    whereIsItUsedAvailable: Boolean,
  },
  emits: {
    add: () => {
      return true;
    },
    deleteEntity: () => {
      return true;
    },
    whereIsItUsed: () => {
      return true;
    },
    propMove: (_data: { direction: -1 | 1; index: number }) => {
      return true;
    },
    propEdit: (_index: number) => {
      return true;
    },
    propDelete: (_index: number) => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });
    const throwable = window.bcms.util.throwable;
    const stringUtil = window.bcms.util.string;
    const store = window.bcms.vue.store;
    const groups = computed(() => {
      return store.getters.group_items;
    });
    const templates = computed(() => {
      return store.getters.template_items;
    });

    const logic = {
      getGroupLabel(prop: BCMSProp): string {
        const group = groups.value.find(
          (e) => e._id === (prop.defaultData as BCMSPropGroupPointerData)._id,
        );
        return group
          ? `${group.label}${
              prop.array ? ' ' + translations.value.prop.viewer.array : ''
            }`
          : translations.value.prop.viewer.loading;
      },
      getTemplateLabel(prop: BCMSProp): string {
        const template = templates.value.find((e) =>
          (prop.defaultData as BCMSPropEntryPointerData[]).find(
            (d) => d.templateId === e._id,
          ),
        );
        return template
          ? `${template.label}${
              prop.array ? ' ' + translations.value.prop.viewer.array : ''
            }`
          : translations.value.prop.viewer.loading;
      },
      getTemplateLabelById(id: string): string {
        const template = templates.value.find((e) => e._id === id);
        return template ? `${template.label}` : 'Loading ...';
      },
    };

    onMounted(async () => {
      await throwable(async () => {
        return await window.bcms.sdk.group.getAll();
      });
      await throwable(async () => {
        return await window.bcms.sdk.template.getAll();
      });
    });

    return () => (
      <div>
        <div class="grid grid-cols-1 gap-5 text-base leading-tight -tracking-0.01 justify-between items-center mb-12 xl:grid-cols-[auto,1fr]">
          <div class="flex flex-wrap items-center max-w-max">
            <BCMSButton
              cyTag="add-prop-button"
              class="mr-2.5 mb-3.5"
              onClick={() => {
                ctx.emit('add');
              }}
            >
              {translations.value.prop.viewer.actions.add}
            </BCMSButton>
            <BCMSButton
              cyTag="delete-manager-button"
              class="mr-2.5 mb-3.5"
              kind="danger"
              onClick={() => {
                ctx.emit('deleteEntity');
              }}
            >
              {translations.value.prop.viewer.actions.delete}
            </BCMSButton>
            {props.whereIsItUsedAvailable ? (
              <BCMSButton
                cyTag="where-is-it-used-button"
                class="mb-3.5 hover:shadow-none focus:shadow-none"
                kind="ghost"
                onClick={() => {
                  ctx.emit('whereIsItUsed');
                }}
              >
                <span>
                  {translations.value.prop.viewer.actions.whereIsItUsed}
                </span>
              </BCMSButton>
            ) : (
              ''
            )}
          </div>
          <p class="text-left mb-3.5 xl:text-right dark:text-light">
            {translations.value.prop.viewer.propertiesCount({
              count: props.props.length || 'No',
              label: props.name,
            })}
          </p>
        </div>
        {props.props.length > 0 ? (
          <ul class="pb-5 list-none">
            <li class="hidden relative gap-5 font-semibold border-b border-dark border-opacity-20 grid-cols-1 py-5 md:grid md:grid-cols-[minmax(170px,0.4fr),minmax(120px,0.4fr),0.2fr,30px] md:py-[15px] md:border-grey md:border-opacity-50">
              <div class="flex items-center">
                <span class="max-w-max mr-4 md:min-w-[50px]" />
                <span class="truncate dark:text-light">
                  {translations.value.prop.viewer.table.label}
                </span>
              </div>
              <div class="truncate dark:text-light">
                {translations.value.prop.viewer.table.name}
              </div>
              <div class="flex items-center" style="word-break: break-all;">
                <span class="truncate dark:text-light">
                  {translations.value.prop.viewer.table.type}
                </span>
              </div>
            </li>
            {props.props.map((prop, propIndex) => {
              return (
                <li
                  class="relative border-b border-dark border-opacity-20 grid gap-5 grid-cols-1 py-5 md:grid-cols-[minmax(170px,0.4fr),minmax(120px,0.4fr),0.2fr,30px] md:py-[15px] md:border-grey md:border-opacity-50"
                  style={`z-index: ${props.props.length - propIndex}`}
                >
                  <div
                    class="flex items-center before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-semibold before:text-grey before:text-xs before:leading-tight col-start-1 col-end-2 md:col-start-[unset] md:col-end-[unset] md:before:hidden"
                    data-column-name={
                      translations.value.prop.viewer.table.label
                    }
                    title={prop.label}
                  >
                    <span
                      v-cy={prop.required ? 'required' : 'not-required'}
                      class="max-w-max mr-4 md:min-w-[50px] dark:text-light"
                    >
                      {prop.required ? (
                        <BCMSIcon
                          src="/lock"
                          class="w-6 h-6 text-base fill-current"
                        />
                      ) : (
                        <BCMSIcon
                          src="/unlock"
                          class="w-6 h-6 text-base fill-current"
                        />
                      )}
                    </span>
                    <div>
                      <span class="truncate dark:text-light">{prop.label}</span>
                      <div class="text-xs text-grey">{prop.id}</div>
                    </div>
                  </div>
                  <div
                    class="flex items-center truncate before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-semibold before:text-grey before:text-xs before:leading-tight col-start-1 col-end-2 md:col-start-[unset] md:col-end-[unset] md:before:hidden dark:text-light"
                    data-column-name={translations.value.prop.viewer.table.name}
                    title={prop.name}
                  >
                    {prop.name}
                  </div>
                  <div
                    class="flex items-center before:content-[attr(data-column-name)] before:w-15 before:flex-shrink-0 before:inline-block before:font-semibold before:text-grey before:text-xs before:leading-tight col-start-1 col-end-2 md:col-start-[unset] md:col-end-[unset] md:before:hidden"
                    style="word-break: break-all;"
                    data-column-name={translations.value.prop.viewer.table.type}
                  >
                    {prop.type == BCMSPropType.GROUP_POINTER &&
                    groups.value.length > 0 ? (
                      <BCMSLink
                        href={`/dashboard/g/${
                          groups.value.find(
                            (e) =>
                              (prop.defaultData as BCMSPropGroupPointerData)
                                ._id === e._id,
                          )?.cid
                        }`}
                        tooltip={
                          prop.array
                            ? translations.value.prop.viewer.tooltip
                                .groupPointerArray
                            : translations.value.prop.viewer.tooltip
                                .groupPointer
                        }
                        class="relative flex items-center font-semibold no-underline text-green hover:underline focus-visible:underline dark:text-yellow"
                      >
                        <BCMSIcon
                          src="/link"
                          class="absolute w-5 text-green fill-current top-1/2 -right-5 -translate-y-1/2 md:right-[unset] md:-left-7.5 dark:text-yellow"
                        />
                        <span class="pr-5 break-normal">
                          {logic.getGroupLabel(prop)}
                        </span>
                      </BCMSLink>
                    ) : prop.type === BCMSPropType.ENTRY_POINTER &&
                      templates.value.length > 0 ? (
                      <div class="space-y-2">
                        {(prop.defaultData as BCMSPropEntryPointerData[])
                          .length > 3 ? (
                          <BCMSLink
                            href=""
                            class="relative flex items-center font-semibold no-underline text-green hover:underline focus-visible:underline dark:text-yellow"
                            clickOverride={true}
                            onClick={(event) => {
                              event.preventDefault();
                              window.bcms.modal.props.viewEntryPointer.show({
                                title:
                                  translations.value.prop.viewer.entryPointerSeeAll(
                                    {
                                      count: (
                                        prop.defaultData as BCMSPropEntryPointerData[]
                                      ).length,
                                    },
                                  ),
                                items: (
                                  prop.defaultData as BCMSPropEntryPointerData[]
                                ).map((info) => {
                                  return {
                                    uri: `/dashboard/t/${
                                      templates.value.find(
                                        (e) => e._id === info.templateId,
                                      )?.cid
                                    }`,
                                    label: logic.getTemplateLabelById(
                                      info.templateId,
                                    ),
                                  };
                                }),
                              });
                            }}
                          >
                            <BCMSIcon
                              src="/link"
                              class="absolute w-5 text-green fill-current top-1/2 -right-7.5 -translate-y-1/2 md:right-[unset] md:-left-7.5 dark:text-yellow"
                            />
                            <span class="truncate">
                              {translations.value.prop.viewer.entryPointerSeeAll(
                                {
                                  count: (
                                    prop.defaultData as BCMSPropEntryPointerData[]
                                  ).length,
                                },
                              )}
                            </span>
                          </BCMSLink>
                        ) : (
                          (prop.defaultData as BCMSPropEntryPointerData[]).map(
                            (info) => {
                              return (
                                <BCMSLink
                                  href={`/dashboard/t/${
                                    templates.value.find(
                                      (e) => e._id === info.templateId,
                                    )?.cid
                                  }`}
                                  tooltip="Entry Pointer"
                                  class="relative flex items-center font-semibold no-underline text-green hover:underline focus-visible:underline dark:text-yellow"
                                >
                                  <BCMSIcon
                                    src="/link"
                                    class="absolute w-5 text-green fill-current top-1/2 -right-7.5 -translate-y-1/2 md:right-[unset] md:-left-7.5 dark:text-yellow"
                                  />
                                  <span class="truncate">
                                    {logic.getTemplateLabelById(
                                      info.templateId,
                                    )}
                                  </span>
                                </BCMSLink>
                              );
                            },
                          )
                        )}
                      </div>
                    ) : (
                      <>
                        <span class="truncate dark:text-light">
                          {stringUtil.toPretty(prop.type)}
                        </span>
                        <span class="ml-[5px] truncate dark:text-light">
                          {prop.array
                            ? translations.value.prop.viewer.array
                            : ''}
                        </span>
                      </>
                    )}
                  </div>
                  {(props.name === 'template' &&
                    prop.name !== 'title' &&
                    prop.name !== 'slug') ||
                  props.name !== 'template' ? (
                    <BCMSOverflowMenu
                      cyTag="prop-overflow"
                      position="right"
                      class="col-start-2 col-end-3 row-start-1 md:col-start-[unset] md:col-end-[unset] md:row-start-[unset]"
                    >
                      {(props.name === 'template' &&
                        propIndex > 2 &&
                        props.props.length > 3) ||
                      (props.name !== 'template' &&
                        propIndex > 0 &&
                        props.props.length > 1) ? (
                        <BCMSOverflowMenuItem
                          cyTag="prop-overflow-mu"
                          text={
                            translations.value.prop.viewer.overflowItems.moveUp
                          }
                          icon="arrow/up"
                          onClick={() => {
                            ctx.emit('propMove', {
                              direction: -1,
                              index: propIndex,
                            });
                          }}
                        />
                      ) : (
                        ''
                      )}
                      {propIndex < props.props.length - 1 && (
                        <BCMSOverflowMenuItem
                          cyTag="prop-overflow-md"
                          text={
                            translations.value.prop.viewer.overflowItems
                              .moveDown
                          }
                          icon="arrow/down"
                          onClick={() => {
                            ctx.emit('propMove', {
                              direction: 1,
                              index: propIndex,
                            });
                          }}
                        />
                      )}
                      <BCMSOverflowMenuItem
                        cyTag="prop-overflow-edit"
                        text={translations.value.prop.viewer.overflowItems.edit}
                        icon="edit"
                        onClick={() => {
                          ctx.emit('propEdit', propIndex);
                        }}
                      />
                      <BCMSOverflowMenuItem
                        cyTag="prop-overflow-del"
                        text={
                          translations.value.prop.viewer.overflowItems.delete
                        }
                        icon="trash"
                        onClick={() => {
                          ctx.emit('propDelete', propIndex);
                        }}
                      />
                    </BCMSOverflowMenu>
                  ) : (
                    ''
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div class="text-grey text-2xl mt-7.5">
            {translations.value.prop.viewer.emptyText({
              label: props.name,
            })}
          </div>
        )}
      </div>
    );
  },
});
export default component;

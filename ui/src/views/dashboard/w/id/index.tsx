import { Teleport } from 'vue';
import type {
  BCMSPropEntryPointerData,
  BCMSPropEnumData,
  BCMSWidget,
} from '@becomes/cms-sdk/types';
import { BCMSPropType } from '@becomes/cms-sdk/types';
import { computed, defineComponent, onMounted, ref } from 'vue';
import {
  BCMSManagerInfo,
  BCMSPropsViewer,
  BCMSManagerNav,
  BCMSEmptyState,
} from '../../../../components';
import type { BCMSWhereIsItUsedItem } from '../../../../types';
import { useRoute, useRouter } from 'vue-router';
import { useTranslation } from '../../../../translations';
import { BCMSLastRoute } from '@ui/util';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const throwable = window.bcms.util.throwable;
    const meta = window.bcms.meta;
    const store = window.bcms.vue.store;
    const router = useRouter();
    const route = useRoute();
    const mounted = ref(false);
    const widget = computed<{
      items: BCMSWidget[];
      target?: BCMSWidget;
    }>(() => {
      const target = store.getters.widget_findOne(
        (e) => e.cid === (route.params.wid as string),
      );
      if (target) {
        meta.set({
          title: translations.value.page.widget.meta.dynamicTitle({
            label: target.label,
          }),
        });
      }
      return {
        items: store.getters.widget_items
          .slice(0, store.getters.widget_items.length)
          .sort((a, b) => (a.name < b.name ? -1 : 1)),
        target,
      };
    });

    const logic = {
      createNewItem() {
        window.bcms.modal.addUpdate.widget.show({
          title: translations.value.modal.addUpdateWidget.newTitle,
          widgetNames: widget.value.items.map((e) => e.name),
          mode: 'add',
          async onDone(data) {
            await throwable(
              async () => {
                return await window.bcms.sdk.widget.create({
                  label: data.label,
                  desc: data.desc,
                  previewImage: data.previewImage,
                  previewScript: '',
                  previewStyle: '',
                });
              },
              async (result) => {
                BCMSLastRoute.templates = result.cid;
                await router.push(`/dashboard/w/${result.cid}`);
              },
            );
          },
        });
      },
      async remove() {
        const target = widget.value.target as BCMSWidget;
        if (
          await window.bcms.confirm(
            translations.value.page.widget.confirm.remove.title({
              label: target.label,
            }),
            translations.value.page.widget.confirm.remove.description({
              label: target.label,
            }),
            target.name,
          )
        ) {
          await throwable(
            async () => {
              await window.bcms.sdk.widget.deleteById(target._id);
            },
            async () => {
              BCMSLastRoute.widgets = widget.value.items[0]
                ? widget.value.items[0].cid
                : '';
              await router.push({
                path: `/dashboard/w/${BCMSLastRoute.widgets}`,
                replace: true,
              });
            },
          );
        }
      },
      edit() {
        const target = widget.value.target as BCMSWidget;
        window.bcms.modal.addUpdate.widget.show({
          mode: 'update',
          label: target.label,
          title: translations.value.modal.addUpdateWidget.editTitle({
            label: target.label,
          }),
          desc: target.desc,
          widgetNames: widget.value.items.map((e) => e.name),
          previewImage: target.previewImage,
          async onDone(data) {
            await throwable(async () => {
              await window.bcms.sdk.widget.update({
                _id: target._id,
                label: data.label,
                desc: data.desc,
                previewImage: data.previewImage,
              });
            });
          },
        });
      },
      prop: {
        add() {
          const target = widget.value.target as BCMSWidget;
          window.bcms.modal.props.add.show({
            takenPropNames: target.props.map((e) => e.name),
            location: 'widget',
            entityId: target._id,
            async onDone(data) {
              await throwable(async () => {
                await window.bcms.sdk.widget.update({
                  _id: target._id,
                  propChanges: [
                    {
                      add: data,
                    },
                  ],
                });
              });
            },
          });
        },
        async move(data: { direction: -1 | 1; index: number }) {
          const target = widget.value.target as BCMSWidget;
          const prop = target.props[data.index];
          await throwable(async () => {
            await window.bcms.sdk.widget.update({
              _id: target._id,
              propChanges: [
                {
                  update: {
                    id: prop.id,
                    label: prop.label,
                    required: prop.required,
                    move: data.direction,
                  },
                },
              ],
            });
          });
        },
        async remove(index: number) {
          const target = widget.value.target as BCMSWidget;
          const prop = target.props[index];
          if (
            await window.bcms.confirm(
              translations.value.page.widget.confirm.removeProperty.title({
                label: prop.label,
              }),
              translations.value.page.widget.confirm.removeProperty.description(
                {
                  label: prop.label,
                },
              ),
            )
          ) {
            await throwable(async () => {
              await window.bcms.sdk.widget.update({
                _id: target._id,
                propChanges: [
                  {
                    remove: prop.id,
                  },
                ],
              });
            });
          }
        },
        edit(index: number) {
          const target = widget.value.target as BCMSWidget;
          const prop = target.props[index];
          window.bcms.modal.props.edit.show({
            title: translations.value.modal.editProp.title({
              label: prop.name,
            }),
            location: 'widget',
            entityId: target._id,
            prop,
            takenPropNames: target.props
              .filter((_e, i) => i !== index)
              .map((e) => e.name),
            async onDone(data) {
              await throwable(async () => {
                await window.bcms.sdk.widget.update({
                  _id: target._id,
                  propChanges: [
                    {
                      update: {
                        id: prop.id,
                        label: data.prop.label,
                        required: data.prop.required,
                        move: 0,
                        enumItems:
                          prop.type === BCMSPropType.ENUMERATION
                            ? (data.prop.defaultData as BCMSPropEnumData).items
                            : undefined,
                        array: data.prop.array,
                        entryPointer:
                          prop.type === BCMSPropType.ENTRY_POINTER
                            ? (data.prop
                                .defaultData as BCMSPropEntryPointerData[])
                            : undefined,
                      },
                    },
                  ],
                });
              });
            },
          });
        },
      },
    };
    async function redirect() {
      if (route.params.wid) {
        BCMSLastRoute.widgets = route.params.wid as string;
      }
      const targetId = BCMSLastRoute.widgets
        ? BCMSLastRoute.widgets
        : widget.value.items[0].cid;
      if (targetId) {
        await router.push({
          path: '/dashboard/w/' + targetId,
          replace: true,
        });
      }
    }
    async function whereIsItUsed() {
      await throwable(
        async () => {
          const widData = widget.value.target as BCMSWidget;
          const result = await window.bcms.sdk.widget.whereIsItUsed(
            widData._id,
          );
          if (result.entryIds.length > 0) {
            const template = await window.bcms.sdk.template.get(
              result.entryIds[0].tid,
            );
            if (template) {
              const entries = await window.bcms.sdk.entry.getAllLite({
                templateId: result.entryIds[0].tid,
              });
              return {
                template,
                entries: entries.filter((e) =>
                  result.entryIds.find((t) => t._id === e._id),
                ),
              };
            }
          }
          return { template: undefined, entries: [] };
        },
        async (result) => {
          const items: BCMSWhereIsItUsedItem[] = result.entries.map((entry) => {
            return {
              type: 'entry',
              label: (entry.meta[0].props[0].data as string[])[0],
              id: entry.cid,
              template: {
                id: '' + result.template?.cid,
                label: '' + result.template?.label,
              },
            };
          });
          window.bcms.modal.whereIsItUsed.show({
            items,
            title: translations.value.modal.whereIsItUsed.widgetTitle({
              label: widget.value.target?.label,
            }),
          });
        },
      );
    }

    onMounted(async () => {
      if (!widget.value.target) {
        await throwable(async () => {
          await window.bcms.sdk.widget.getAll();
        });
        if (widget.value.items.length > 0) {
          await redirect();
        }
      } else {
        await redirect();
      }
      mounted.value = true;
    });

    return () => (
      <div>
        {widget.value.target && mounted.value ? (
          <Teleport to="#managerNav">
            <BCMSManagerNav
              label={translations.value.page.widget.nav.label}
              actionText={translations.value.page.widget.nav.actionText}
              items={widget.value.items.map((e) => {
                return {
                  name: e.label,
                  link: `/dashboard/w/${e.cid}`,
                  selected: widget.value.target?.cid === e.cid,
                  onClick: () => {
                    BCMSLastRoute.widgets = e.cid;
                    router.push({
                      path: `/dashboard/w/${e.cid}`,
                      replace: true,
                    });
                  },
                };
              })}
              onAction={logic.createNewItem}
            />
          </Teleport>
        ) : (
          ''
        )}
        {widget.value.items.length > 0 ? (
          widget.value.target ? (
            <>
              <BCMSManagerInfo
                id={widget.value.target._id}
                name={widget.value.target.label}
                createdAt={widget.value.target.createdAt}
                updatedAt={widget.value.target.updatedAt}
                onEdit={logic.edit}
                description={widget.value.target.desc}
                key={widget.value.target._id}
              />
              <BCMSPropsViewer
                name={'widget'}
                props={widget.value.target.props}
                onDeleteEntity={logic.remove}
                onAdd={logic.prop.add}
                onPropMove={logic.prop.move}
                onPropDelete={logic.prop.remove}
                onPropEdit={logic.prop.edit}
                whereIsItUsedAvailable={true}
                onWhereIsItUsed={whereIsItUsed}
              />
            </>
          ) : (
            ''
          )
        ) : (
          <BCMSEmptyState
            src="/widgets.png"
            maxWidth="315px"
            maxHeight="320px"
            class="mt-20 md:absolute md:bottom-32 md:right-32"
            title={translations.value.page.widget.emptyState.title}
            subtitle={translations.value.page.widget.emptyState.subtitle}
            clickHandler={logic.createNewItem}
            ctaText={translations.value.page.widget.emptyState.actionText}
          />
        )}
      </div>
    );
  },
});
export default component;

import { Teleport } from 'vue';
import type {
  BCMSPropEnumData,
  BCMSGroup,
  BCMSPropEntryPointerData,
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
    const group = computed<{
      items: BCMSGroup[];
      target?: BCMSGroup;
    }>(() => {
      const target = store.getters.group_findOne(
        (e) => e.cid === (route.params.gid as string),
      );
      if (target) {
        meta.set({
          title: translations.value.page.group.meta.dynamicTitle({
            label: target.label,
          }),
        });
      }
      return {
        items: store.getters.group_items
          .slice(0)
          .sort((a, b) => (a.name < b.name ? -1 : 1)),
        target,
      };
    });

    const logic = {
      createNewItem() {
        window.bcms.modal.addUpdate.group.show({
          title: translations.value.modal.addUpdateGroup.newTitle,
          groupNames: group.value.items.map((e) => e.name),
          mode: 'add',
          async onDone(data) {
            await throwable(
              async () => {
                return await window.bcms.sdk.group.create({
                  label: data.label,
                  desc: data.desc,
                });
              },
              async (result) => {
                await router.push(`/dashboard/g/${result.cid}`);
              },
            );
          },
        });
      },
      async remove() {
        const target = group.value.target as BCMSGroup;
        if (
          await window.bcms.confirm(
            translations.value.page.group.confirm.remove.title({
              label: target.label,
            }),
            translations.value.page.group.confirm.remove.description({
              label: target.label,
            }),
            target.name,
          )
        ) {
          await throwable(
            async () => {
              await window.bcms.sdk.group.deleteById(target._id);
            },
            async () => {
              BCMSLastRoute.groups = group.value.items[0]
                ? group.value.items[0].cid
                : '';
              await router.push({
                path: `/dashboard/g/${BCMSLastRoute.groups}`,
                replace: true,
              });
            },
          );
        }
      },
      edit() {
        const target = group.value.target as BCMSGroup;
        window.bcms.modal.addUpdate.group.show({
          mode: 'update',
          label: target.label,
          title: translations.value.modal.addUpdateGroup.editTitle({
            label: target.label,
          }),
          desc: target.desc,
          groupNames: group.value.items.map((e) => e.name),
          async onDone(data) {
            await throwable(async () => {
              await window.bcms.sdk.group.update({
                _id: target._id,
                label: data.label,
                desc: data.desc,
              });
            });
          },
        });
      },
      prop: {
        add() {
          const target = group.value.target as BCMSGroup;
          window.bcms.modal.props.add.show({
            takenPropNames: target.props.map((e) => e.name),
            location: 'group',
            entityId: target._id,
            async onDone(data) {
              await throwable(
                async () => {
                  return await window.bcms.sdk.group.update({
                    _id: target._id,
                    propChanges: [
                      {
                        add: data,
                      },
                    ],
                  });
                },
                async (result) => {
                  BCMSLastRoute.groups = result.cid;
                },
              );
            },
          });
        },
        async move(data: { direction: -1 | 1; index: number }) {
          const target = group.value.target as BCMSGroup;
          const prop = target.props[data.index];
          await throwable(async () => {
            await window.bcms.sdk.group.update({
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
          const target = group.value.target as BCMSGroup;
          const prop = target.props[index];
          if (
            await window.bcms.confirm(
              translations.value.page.group.confirm.removeProperty.title({
                label: prop.label,
              }),
              translations.value.page.group.confirm.removeProperty.description({
                label: prop.label,
              }),
            )
          ) {
            await throwable(async () => {
              await window.bcms.sdk.group.update({
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
          const target = group.value.target as BCMSGroup;
          const prop = target.props[index];
          window.bcms.modal.props.edit.show({
            title: translations.value.modal.editProp.title({
              label: prop.label,
            }),
            location: 'group',
            entityId: target._id,
            prop,
            takenPropNames: target.props
              .filter((_e, i) => i !== index)
              .map((e) => e.name),
            async onDone(data) {
              await throwable(async () => {
                await window.bcms.sdk.group.update({
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
      if (route.params.gid) {
        BCMSLastRoute.groups = route.params.gid as string;
      }
      const targetId = BCMSLastRoute.groups
        ? BCMSLastRoute.groups
        : group.value.items[0].cid;
      if (targetId) {
        await router.push({
          path: '/dashboard/g/' + targetId,
          replace: true,
        });
      }
    }
    async function whereIsItUsed() {
      await throwable(
        async () => {
          const result = await window.bcms.sdk.group.whereIsItUsed(
            (group.value.target as BCMSGroup)._id,
          );
          const templates = await window.bcms.sdk.template.getMany(
            result.templateIds.map((e) => e._id),
          );
          const groups = await window.bcms.sdk.group.getMany(
            result.groupIds.map((e) => e._id),
          );
          const widgets = await window.bcms.sdk.widget.getMany(
            result.widgetIds.map((e) => e._id),
          );
          return {
            templates,
            groups,
            widgets,
          };
        },
        async (result) => {
          const items: BCMSWhereIsItUsedItem[] = [];
          for (let i = 0; i < result.templates.length; i++) {
            const template = result.templates[i];
            items.push({
              type: 'template',
              label: template.label,
              id: template.cid,
              template: {
                id: template.cid,
                label: template.label,
              },
            });
          }
          for (let i = 0; i < result.groups.length; i++) {
            const grp = result.groups[i];
            items.push({
              type: 'group',
              label: grp.label,
              id: grp.cid,
            });
          }
          for (let i = 0; i < result.widgets.length; i++) {
            const widget = result.widgets[i];
            items.push({
              type: 'widget',
              label: widget.label,
              id: widget.cid,
            });
          }
          window.bcms.modal.whereIsItUsed.show({
            title: translations.value.modal.whereIsItUsed.groupTitle({
              label: group.value.target?.label,
            }),
            items,
          });
        },
      );
    }

    onMounted(async () => {
      if (!group.value.target) {
        await throwable(async () => {
          await window.bcms.sdk.group.getAll();
        });
        if (group.value.items.length > 0) {
          await redirect();
        }
      } else {
        await redirect();
      }
      mounted.value = true;
    });

    return () => (
      <div>
        {group.value.target && mounted.value ? (
          <Teleport to="#managerNav">
            <BCMSManagerNav
              label={translations.value.page.group.nav.label}
              actionText={translations.value.page.group.nav.actionText}
              items={group.value.items.map((e) => {
                return {
                  name: e.label,
                  link: `/dashboard/g/${e.cid}`,
                  selected: group.value.target?.cid === e.cid,
                  onClick: () => {
                    BCMSLastRoute.groups = e.cid;
                    console.log(BCMSLastRoute.groups);
                    router.push({
                      path: `/dashboard/g/${e.cid}`,
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
        {group.value.items.length > 0 ? (
          group.value.target ? (
            <>
              <BCMSManagerInfo
                id={group.value.target._id}
                name={group.value.target.label}
                createdAt={group.value.target.createdAt}
                updatedAt={group.value.target.updatedAt}
                onEdit={logic.edit}
                description={group.value.target.desc}
                key={group.value.target._id}
              />
              <BCMSPropsViewer
                name={'group'}
                props={group.value.target.props}
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
            src="/groups.png"
            maxWidth="335px"
            maxHeight="320px"
            class="mt-20 md:absolute md:bottom-32 md:right-32"
            title={translations.value.page.group.emptyState.title}
            subtitle={translations.value.page.group.emptyState.subtitle}
            clickHandler={logic.createNewItem}
            ctaText={translations.value.page.group.emptyState.actionText}
          />
        )}
      </div>
    );
  },
});

export default component;

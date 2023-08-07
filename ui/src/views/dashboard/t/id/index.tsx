import { Teleport } from 'vue';
import type {
  BCMSPropEntryPointerData,
  BCMSPropEnumData,
  BCMSTemplate,
} from '@becomes/cms-sdk/types';
import { BCMSPropType } from '@becomes/cms-sdk/types';
import { computed, defineComponent, onMounted, ref } from 'vue';
import {
  BCMSManagerInfo,
  BCMSPropsViewer,
  BCMSManagerNav,
  BCMSEmptyState,
} from '../../../../components';
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
    const template = computed<{
      items: BCMSTemplate[];
      target?: BCMSTemplate;
    }>(() => {
      const target = store.getters.template_findOne(
        (e) => e.cid === (route.params.tid as string),
      );
      if (target) {
        meta.set({
          title: translations.value.page.template.meta.dynamicTitle({
            label: target.label,
          }),
        });
      }
      return {
        items: store.getters.template_items
          .slice(0)
          .sort((a, b) => (a.name < b.name ? -1 : 1)),
        target,
      };
    });
    const mounted = ref(false);

    const logic = {
      createNewItem() {
        window.bcms.modal.addUpdate.template.show({
          title: translations.value.modal.addUpdateTemplate.newTitle,
          templateNames: template.value.items.map((e) => e.name),
          mode: 'add',
          async onDone(data) {
            await throwable(
              async () => {
                return await window.bcms.sdk.template.create({
                  label: data.label,
                  desc: data.desc,
                  singleEntry: data.singleEntry,
                });
              },
              async (result) => {
                BCMSLastRoute.templates = result.cid;
                await router.push(`/dashboard/t/${result.cid}`);
              },
            );
          },
        });
      },
      async remove() {
        const target = template.value.target as BCMSTemplate;
        if (
          await window.bcms.confirm(
            translations.value.page.template.confirm.remove.title({
              label: target.label,
            }),
            translations.value.page.template.confirm.remove.description({
              label: target.label,
            }),
            target.name,
          )
        ) {
          await throwable(
            async () => {
              await window.bcms.sdk.template.deleteById(target._id);
            },
            async () => {
              BCMSLastRoute.templates = template.value.items[0]
                ? template.value.items[0].cid
                : '';
              await router.push({
                path: `/dashboard/t/${BCMSLastRoute.templates}`,
                replace: true,
              });
            },
          );
        }
      },
      edit() {
        const target = template.value.target as BCMSTemplate;
        window.bcms.modal.addUpdate.template.show({
          mode: 'update',
          label: target.label,
          title: translations.value.modal.addUpdateTemplate.editTitle({
            label: target.label,
          }),
          desc: target.desc,
          singleEntry: target.singleEntry,
          templateNames: template.value.items.map((e) => e.name),
          async onDone(data) {
            await throwable(async () => {
              await window.bcms.sdk.template.update({
                _id: target._id,
                label: data.label,
                desc: data.desc,
                singleEntry: data.singleEntry,
              });
            });
          },
        });
      },
      prop: {
        add() {
          const target = template.value.target as BCMSTemplate;
          window.bcms.modal.props.add.show({
            takenPropNames: target.props.map((e) => e.name),
            location: 'template',
            entityId: target._id,
            async onDone(data) {
              await throwable(async () => {
                await window.bcms.sdk.template.update({
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
          const target = template.value.target as BCMSTemplate;
          const prop = target.props[data.index];
          await throwable(async () => {
            await window.bcms.sdk.template.update({
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
          const target = template.value.target as BCMSTemplate;
          const prop = target.props[index];
          if (
            await window.bcms.confirm(
              translations.value.page.template.confirm.removeProperty.title({
                label: prop.label,
              }),
              translations.value.page.template.confirm.removeProperty.description(
                {
                  label: prop.label,
                },
              ),
            )
          ) {
            await throwable(async () => {
              await window.bcms.sdk.template.update({
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
          const target = template.value.target as BCMSTemplate;
          const prop = target.props[index];
          window.bcms.modal.props.edit.show({
            title: translations.value.modal.editProp.title({
              label: prop.label,
            }),
            location: 'template',
            entityId: target._id,
            prop,
            takenPropNames: target.props
              .filter((_e, i) => i !== index)
              .map((e) => e.name),
            async onDone(data) {
              await throwable(async () => {
                await window.bcms.sdk.template.update({
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
      if (route.params.tid) {
        BCMSLastRoute.templates = route.params.tid + '';
      }
      const targetId = BCMSLastRoute.templates
        ? BCMSLastRoute.templates
        : template.value.items[0].cid;
      if (targetId) {
        await router.push({
          path: '/dashboard/t/' + targetId,
          replace: true,
        });
      }
    }

    onMounted(async () => {
      if (!template.value.target) {
        await throwable(async () => {
          await window.bcms.sdk.template.getAll();
        });
        if (template.value.items.length > 0) {
          await redirect();
        }
      } else {
        await redirect();
      }
      mounted.value = true;
    });

    return () => (
      <div>
        {template.value.target && mounted.value ? (
          <Teleport to="#managerNav">
            <BCMSManagerNav
              label={translations.value.page.template.nav.label}
              actionText={translations.value.page.template.nav.actionText}
              items={template.value.items.map((e) => {
                return {
                  name: e.label,
                  link: `/dashboard/t/${e.cid}`,
                  selected: template.value.target?.cid === e.cid,
                  onClick: () => {
                    BCMSLastRoute.templates = e.cid;
                    router.push({
                      path: `/dashboard/t/${e.cid}`,
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
        {template.value.items.length > 0 ? (
          template.value.target ? (
            <>
              <BCMSManagerInfo
                id={template.value.target._id}
                name={template.value.target.label}
                createdAt={template.value.target.createdAt}
                updatedAt={template.value.target.updatedAt}
                onEdit={logic.edit}
                description={template.value.target.desc}
                key={template.value.target._id}
              />
              <BCMSPropsViewer
                name={'template'}
                props={template.value.target.props}
                onDeleteEntity={logic.remove}
                onAdd={logic.prop.add}
                onPropMove={logic.prop.move}
                onPropDelete={logic.prop.remove}
                onPropEdit={logic.prop.edit}
              />
            </>
          ) : (
            ''
          )
        ) : (
          <BCMSEmptyState
            src="/templates.png"
            maxWidth="335px"
            maxHeight="320px"
            class="mt-20 md:absolute md:bottom-32 md:right-32"
            title={translations.value.page.template.emptyState.title}
            subtitle={translations.value.page.template.emptyState.subtitle}
            clickHandler={logic.createNewItem}
            ctaText={translations.value.page.template.emptyState.actionText}
          />
        )}
      </div>
    );
  },
});
export default component;

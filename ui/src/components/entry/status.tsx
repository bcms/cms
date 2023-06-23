import { computed, defineComponent, onMounted, ref } from 'vue';
import type { BCMSStatus } from '@becomes/cms-sdk/types';
import { BCMSJwtRoleName } from '@becomes/cms-sdk/types';
import { DefaultComponentProps } from '../_default';
import { BCMSSelect } from '../input';
import type { BCMSSelectOption, BCMSStatusUpdateData } from '../../types';
import { useTranslation } from '../../translations';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    selected: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: 'Select a status',
    },
    invalidText: String,
  },
  emits: {
    change: (_statusId: string) => {
      return true;
    },
  },
  setup(props, ctx) {
    const throwable = window.bcms.util.throwable;
    const store = window.bcms.vue.store;
    const isUserAdmin = ref(false);
    const status = computed<{
      list: BCMSStatus[];
      options: BCMSSelectOption[];
    }>(() => {
      const statuses = store.getters.status_items;
      const editOption: BCMSSelectOption[] = isUserAdmin.value
        ? [
            {
              label: 'Edit statuses',
              value: '___edit___',
            },
          ]
        : [];
      const output = {
        list: statuses,
        options: [
          ...statuses
            .map((e) => {
              return {
                label: e.label,
                value: e._id,
              };
            })
            .sort((a, b) => (b.label < a.label ? 1 : -1)),
          ...editOption,
        ],
      };
      return output;
    });

    const translations = computed(() => {
      return useTranslation();
    });

    onMounted(async () => {
      if (status.value.list.length === 0) {
        await throwable(async () => {
          return await window.bcms.sdk.status.getAll();
        });
      }
      await throwable(
        async () => {
          return await window.bcms.sdk.user.get();
        },
        async (result) => {
          if (result) {
            isUserAdmin.value = result.roles[0].name === BCMSJwtRoleName.ADMIN;
          }
        }
      );
    });

    async function doUpdates(updates: BCMSStatusUpdateData[]) {
      for (const i in updates) {
        const update = updates[i];
        if (update.type === 'remove' && update._id) {
          await deleteStatus(update._id);
        } else {
          await createStatus({
            label: update.label,
            color: update.color,
          });
        }
      }
    }
    async function deleteStatus(id: string) {
      await throwable(async () => {
        return await window.bcms.sdk.status.deleteById(id);
      });
    }
    async function createStatus(data: { label: string; color?: string }) {
      await throwable(async () => {
        return await window.bcms.sdk.status.create(data);
      });
    }

    return () => (
      <div id={props.id} class={`${props.class}`} style={props.style}>
        <BCMSSelect
          placeholder={props.placeholder}
          invalidText={props.invalidText}
          selected={props.selected}
          options={status.value.options}
          onChange={(option) => {
            if (option.value === '___edit___') {
              window.bcms.modal.entry.status.show({
                title: translations.value.modal.entryStatus.updateTitle,
                onDone: async (data) => {
                  await doUpdates(data.updates);
                },
              });
            } else {
              ctx.emit('change', option.value);
            }
          }}
        />
      </div>
    );
  },
});
export default component;

import { computed, defineComponent, onBeforeUpdate, onMounted, ref } from 'vue';
import type { BCMSMedia } from '@becomes/cms-sdk/types';
import { BCMSMediaType } from '@becomes/cms-sdk/types';
import BCMSIcon from '../icon';
import { useTranslation } from '../../translations';

const component = defineComponent({
  props: {
    targetMediaId: {
      type: String,
      default: '',
    },
  },
  emits: {
    click: (_media: BCMSMedia) => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });
    const throwable = window.bcms.util.throwable;
    let lastMediaId = '';
    const tree = ref<BCMSMedia[]>([]);

    async function getParentTree(parentId?: string): Promise<BCMSMedia[]> {
      const output: BCMSMedia[] = [];
      if (!parentId) {
        return output;
      }
      const parent: BCMSMedia | undefined = await throwable(
        async () => {
          return await window.bcms.sdk.media.getById(parentId);
        },
        async (value) => {
          return value;
        }
      );
      if (!parent) {
        return output;
      }
      output.push(parent);
      if (parent.isInRoot) {
        return output;
      }
      return [...output, ...(await getParentTree(parent.parentId))];
    }

    onMounted(async () => {
      lastMediaId = props.targetMediaId;
      tree.value = (await getParentTree(props.targetMediaId)).reverse();
    });
    onBeforeUpdate(async () => {
      if (lastMediaId !== props.targetMediaId) {
        lastMediaId = props.targetMediaId;
        tree.value = (await getParentTree(props.targetMediaId)).reverse();
      }
    });

    return () => (
      <nav class="flex">
        <ul class="list-none flex items-center flex-wrap">
          <li class="flex items-center">
            <button
              onClick={() => {
                ctx.emit('click', {
                  _id: '',
                  type: BCMSMediaType.DIR,
                  createdAt: 0,
                  updatedAt: 0,
                  hasChildren: false,
                  isInRoot: false,
                  mimetype: '',
                  name: '',
                  parentId: '',
                  size: 0,
                  userId: '',
                  altText: '',
                  caption: '',
                  width: -1,
                  height: -1,
                });
              }}
              class="uppercase text-xs tracking-0.06 leading-normal flex no-underline text-dark transition-colors duration-200 hover:text-opacity-60 focus-visible:text-opacity-60 dark:text-light"
            >
              <span>{translations.value.page.media.title}</span>
            </button>
          </li>
          {tree.value.map((item) => {
            return (
              <li class="flex items-center">
                <BCMSIcon
                  src="/chevron/right"
                  class="text-dark fill-current w-2.5 mx-2.5 dark:text-light"
                />
                <button
                  onClick={() => {
                    ctx.emit('click', item);
                  }}
                  class="uppercase text-xs tracking-0.06 leading-normal flex no-underline text-dark transition-colors duration-200 hover:text-opacity-60 focus-visible:text-opacity-60 dark:text-light"
                >
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  },
});
export default component;

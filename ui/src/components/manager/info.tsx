import { computed, defineComponent } from 'vue';
import { DefaultComponentProps } from '../_default';
import BCMSIcon from '../icon';
import BCMSTimestampDisplay from '../timestamp-display';
import { useRoute } from 'vue-router';
import { useTranslation } from '../../translations';
import { BCMSMarkdownDisplay } from '..';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    createdAt: {
      type: Number,
      required: true,
    },
    updatedAt: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  emits: {
    edit: () => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });
    // const dateUtil = useDateUtility();
    const route = useRoute();
    // const throwable = window.bcms.util.throwable;
    // const store = window.bcms.vue.store;

    // const newTitle = ref(props.name);
    // const newDescription = ref(props.description);

    // const createdAt = computed(() => {
    //   return dateUtil.prettyElapsedTimeSince(props.createdAt);
    // });
    // const updatedAt = computed(() => {
    //   return dateUtil.prettyElapsedTimeSince(props.updatedAt);
    // });

    // const isEditing = computed(() => {
    //   return titleEditing.value || descriptionEditing.value;
    // });

    const logic = {
      getManagerName() {
        const name = route.path.split('/')[2];
        switch (name) {
          case 't': {
            return 'Template';
          }
          case 'g': {
            return 'Group';
          }
          case 'w': {
            return 'Widget';
          }
          case 'key-manager': {
            return 'Key';
          }
        }
      },
    };

    return () => (
      <div
        class={`managerInfo ${
          logic.getManagerName() === 'Key' ? 'block' : 'grid'
        } grid-cols-1 justify-between gap-10 my-7.5 sm:grid-cols-[1fr,auto] sm:mb-10 md:mb-14 desktop:mt-0 desktop:grid-cols-1 lg:mb-[70px] xl:grid-cols-[0.6fr,0.4fr] xl:gap-5`}
      >
        <div
          class={`${
            logic.getManagerName() === 'Key' ? 'mb-[35px]' : ''
          } min-w-[225px]`}
        >
          <div class="flex items-center mb-[25px]">
            <h1
              class="text-9.5 leading-none font-normal -tracking-0.01 select-none dark:text-light"
              tabindex="0"
              onDblclick={() => {
                ctx.emit('edit');
              }}
            >
              {props.name}
            </h1>

            <button
              v-cy={'edit-button'}
              class="items-center hidden ml-5 group lg:flex"
              onClick={() => {
                ctx.emit('edit');
              }}
            >
              <BCMSIcon
                src="/edit"
                class="w-6 h-6 transition-colors duration-300 fill-current text-grey group-hover:text-dark group-focus-visible:text-dark dark:group-hover:text-light dark:group-focus-visible:text-light"
              />
            </button>
          </div>
          <BCMSMarkdownDisplay
            cyTag="description-double-click"
            class="mr-5"
            markdown={props.description}
            onEdit={() => {
              ctx.emit('edit');
            }}
          />
        </div>
        <div class="hidden lg:block">
          <p class="flex text-sm leading-tight">
            <span class="inline-block min-w-[70px] mr-[25px] -tracking-0.01 mb-2.5 dark:text-grey">
              {translations.value.page.manager.info.table.id}
            </span>
            <span class="text-grey">{props.id}</span>
          </p>
          <p class="flex text-sm leading-tight">
            <span class="inline-block min-w-[70px] mr-[25px] -tracking-0.01 mb-2.5 dark:text-grey">
              {translations.value.page.manager.info.table.created}
            </span>
            <span class="text-grey">
              <BCMSTimestampDisplay timestamp={props.createdAt} />
            </span>
          </p>
          <p class="flex text-sm leading-tight">
            <span class="inline-block min-w-[70px] mr-[25px] -tracking-0.01 mb-2.5 dark:text-grey">
              {translations.value.page.manager.info.table.updated}
            </span>
            <span class="text-grey">
              <BCMSTimestampDisplay timestamp={props.updatedAt} />
            </span>
          </p>
        </div>
      </div>
    );
  },
});

export default component;

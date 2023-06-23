import {
  computed,
  defineComponent,
  onBeforeUpdate,
  type PropType,
  ref,
  type VNode,
} from 'vue';
import { useTranslation } from '../../translations';
import BCMSButton from '../button';
import { BCMSCheckboxInput } from '.';
import { DefaultComponentProps } from '../_default';

interface Data {
  label?: string;
  desc: string;
  selected: boolean;
  helperText?: string;
  invalidText?: string;
}

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    title: {
      type: Object as PropType<VNode | string>,
      default: <></>,
    },
    initialValue: {
      type: Array as PropType<Data[]>,
      required: true,
    },
  },
  emits: {
    change: (_data: Data[]) => {
      return true;
    },
  },
  setup(props, { emit }) {
    const translations = computed(() => {
      return useTranslation();
    });
    const data = ref(getData());
    const allChecked = computed(() => {
      return !data.value.find((e) => !e.selected);
    });

    function getData(): Data[] {
      if (props.initialValue) {
        return props.initialValue;
      }
      return [];
    }

    function checkAll() {
      if (allChecked.value) {
        for (let i = 0; i < data.value.length; i++) {
          data.value[i].selected = false;
        }
      } else {
        for (let i = 0; i < data.value.length; i++) {
          data.value[i].selected = true;
        }
      }

      emit('change', data.value);
    }

    function change(index: number, selected: boolean) {
      data.value[index].selected = selected;

      emit('change', data.value);
    }

    onBeforeUpdate(() => {
      if (JSON.stringify(data.value) !== JSON.stringify(props.initialValue)) {
        data.value = getData();
      }
    });

    return () => (
      <div v-cy={props.cyTag} class={props.class}>
        <h3 class="text-[28px] leading-tight font-normal text-dark mb-5">
          {props.title}
        </h3>
        <div class="max-w-max">
          <BCMSButton
            class="mb-4 hover:shadow-none focus:shadow-none"
            kind="ghost"
            onClick={checkAll}
          >
            {allChecked.value
              ? translations.value.input.checkboxArray.uncheck
              : translations.value.input.checkboxArray.check}
          </BCMSButton>
          {data.value.map((item, itemIndex) => (
            <BCMSCheckboxInput
              cyTag={`${props.cyTag}-get`}
              description={item.desc}
              label={item.label}
              helperText={item.helperText}
              invalidText={item.invalidText}
              class="mb-5 ml-5"
              value={item.selected}
              onInput={(event) => {
                change(itemIndex, event);
              }}
            />
          ))}
        </div>
      </div>
    );
  },
});

export default component;

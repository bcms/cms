import {
  computed,
  defineComponent,
  onBeforeUpdate,
  onUnmounted,
  type PropType,
  reactive,
  ref,
} from 'vue';
import { DefaultComponentProps } from '../_default';
import {
  BCMSPropWrapper,
  BCMSPropWrapperArray,
  BCMSPropWrapperArrayItem,
} from './_wrapper';
import { BCMSColorPickerInput } from '../input';
import type {
  BCMSArrayPropMoveEventData,
  BCMSPropValueExtended,
  BCMSPropValueExtendedColorPicker,
} from '../../types';
import { useTranslation } from '../../translations';

type PropValueType = BCMSPropValueExtendedColorPicker;

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    prop: {
      type: Object as PropType<BCMSPropValueExtended>,
      required: true,
    },
    lng: {
      type: String,
      default: 'en',
    },
    basePropPath: String,
  },
  emits: {
    update: (_value: string, _propPath: string) => {
      return true;
    },
    add: (_propPath: string) => {
      return true;
    },
    move: (_propPath: string, _moveData: BCMSArrayPropMoveEventData) => {
      return true;
    },
    remove: (_propPath: string) => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });
    props = reactive(props);

    const propData = computed(() => {
      return props.prop.data as PropValueType;
    });

    const errors = ref(propData.value.value.map(() => ''));
    const unregisterFromChecker = window.bcms.prop.checker.register(() => {
      let isOk = true;
      if (props.prop.required) {
        if (props.prop.array && propData.value.value.length === 0) {
          errors.value[0] = translations.value.prop.input.error.emptyArray;
          isOk = false;
        } else {
          if (propData.value.value.length === 0) {
            errors.value[0] =
              translations.value.prop.colorPicker.error.selectColor;
            isOk = false;
          } else {
            for (let i = 0; i < propData.value.value.length; i++) {
              if (!propData.value.value[i]) {
                errors.value[i] =
                  translations.value.prop.colorPicker.error.selectColor;
                isOk = false;
              } else {
                errors.value[i] = '';
              }
            }
          }
        }
      }
      return isOk;
    });

    onBeforeUpdate(() => {
      const value = propData.value.value;
      if (value.length !== errors.value.length) {
        errors.value = value.map(() => '');
      }
    });
    onUnmounted(() => {
      unregisterFromChecker();
    });

    return () => (
      <BCMSPropWrapper
        id={props.id}
        cyTag="prop-color"
        class={props.class}
        style={props.style}
        prop={props.prop}
      >
        <div>
          {props.prop.array ? (
            <BCMSPropWrapperArray
              prop={props.prop}
              error={
                errors.value[0] ===
                translations.value.prop.input.error.emptyArray
              }
              onAdd={() => {
                // const prop = window.bcms.util.object.instance(props.prop);
                // (prop.data as PropValueType).push('');
                ctx.emit('add', props.basePropPath + '.data');
              }}
            >
              {propData.value.value.map((_, valueIndex) => {
                return (
                  <BCMSPropWrapperArrayItem
                    arrayLength={propData.value.value.length}
                    itemPositionInArray={valueIndex}
                    onMove={(data) => {
                      ctx.emit('move', props.basePropPath + '.data', data);
                    }}
                    onRemove={(index) => {
                      ctx.emit('remove', props.basePropPath + '.data.' + index);
                    }}
                  >
                    <BCMSColorPickerInput
                      propPath={props.basePropPath + '.data.' + valueIndex}
                      value={propData.value.value[valueIndex]}
                      invalidText={errors.value[valueIndex]}
                      view="entry"
                      onChange={(inputValue) => {
                        ctx.emit(
                          'update',
                          inputValue,
                          props.basePropPath + '.data.' + valueIndex
                        );
                      }}
                    />
                  </BCMSPropWrapperArrayItem>
                );
              })}
            </BCMSPropWrapperArray>
          ) : (
            <>
              <BCMSColorPickerInput
                propPath={props.basePropPath + '.data.0'}
                value={propData.value.value[0] || ''}
                invalidText={errors.value[0]}
                view="entry"
                allowCustom={propData.value.options.allowCustom}
                allowGlobal={propData.value.options.allowGlobal}
                onChange={(inputValue) => {
                  ctx.emit(
                    'update',
                    inputValue,
                    props.basePropPath + '.data.0'
                  );
                }}
              />
            </>
          )}
        </div>
      </BCMSPropWrapper>
    );
  },
});
export default component;

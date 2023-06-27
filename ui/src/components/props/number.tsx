import { computed, defineComponent, type PropType } from 'vue';
import { DefaultComponentProps } from '../_default';
import {
  BCMSPropWrapper,
  BCMSPropWrapperArray,
  BCMSPropWrapperArrayItem,
} from './_wrapper';
import { BCMSNumberInput } from '../input';
import type {
  BCMSArrayPropMoveEventData,
  BCMSPropValueExtended,
} from '../../types';

type PropValueType = number[];

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    prop: {
      type: Object as PropType<BCMSPropValueExtended>,
      required: true,
    },
    basePropPath: String,
  },
  emits: {
    update: (_value: number, _propPath: string) => {
      return true;
    },
    move: (_propPath: string, _data: BCMSArrayPropMoveEventData) => {
      return true;
    },
    add: (_propPath: string) => {
      return true;
    },
    remove: (_propPath: string) => {
      return true;
    },
  },
  setup(props, ctx) {
    const propsValue = computed(() => {
      return props.prop.data as PropValueType;
    });

    return () => (
      <BCMSPropWrapper
        id={props.id}
        cyTag="prop-number"
        class={props.class}
        style={props.style}
        prop={props.prop}
      >
        <div>
          {props.prop.array ? (
            <BCMSPropWrapperArray
              prop={props.prop}
              onAdd={() => {
                ctx.emit('add', props.basePropPath + '.data');
              }}
            >
              {(props.prop.data as PropValueType).map((_, valueIndex) => {
                return (
                  <BCMSPropWrapperArrayItem
                    arrayLength={propsValue.value.length}
                    itemPositionInArray={valueIndex}
                    onMove={(data) => {
                      ctx.emit('move', props.basePropPath + '.data', data);
                    }}
                    onRemove={(index) => {
                      ctx.emit('remove', props.basePropPath + '.data.' + index);
                    }}
                  >
                    <BCMSNumberInput
                      propPath={props.basePropPath + '.data.' + valueIndex}
                      value={propsValue.value[valueIndex]}
                      placeholder={props.prop.label}
                      onInput={(inputValue) => {
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
            <BCMSNumberInput
              propPath={props.basePropPath + '.data.0'}
              value={propsValue.value[0]}
              placeholder={props.prop.label}
              onInput={(value) => {
                ctx.emit('update', value, props.basePropPath + '.data.0');
              }}
            />
          )}
        </div>
      </BCMSPropWrapper>
    );
  },
});
export default component;

import { computed, defineComponent, onMounted, type PropType } from 'vue';
import { DefaultComponentProps } from '../_default';
import {
  BCMSPropWrapper,
  BCMSPropWrapperArray,
  BCMSPropWrapperArrayItem,
} from './_wrapper';
import BCMSPropsEditor from './editor';
import type {
  BCMSArrayPropMoveEventData,
  BCMSPropValueExtended,
  BCMSPropValueExtendedGroupPointerData,
} from '../../types';
import { useTranslation } from '../../translations';
import BCMSButton from '../button';

type PropValueType = BCMSPropValueExtendedGroupPointerData;

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    lng: String,
    prop: {
      type: Object as PropType<BCMSPropValueExtended>,
      required: true,
    },
    basePropPath: String,
  },
  emits: {
    update: (_value: unknown, _propPath: string) => {
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
    updateContent: (_propPath: string, _updates: number[]) => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });
    const throwable = window.bcms.util.throwable;
    const store = window.bcms.vue.store;
    const propsValue = computed(() => {
      return props.prop.data as PropValueType;
    });
    const group = computed(() => {
      return store.getters.group_findOne(
        (e) => e._id === (props.prop.data as PropValueType)._id
      );
    });

    onMounted(async () => {
      if (!group.value) {
        await throwable(async () => {
          return await window.bcms.sdk.group.get(
            (props.prop.data as PropValueType)._id
          );
        });
      }
    });

    return () => (
      <BCMSPropWrapper
        id={props.id}
        cyTag="prop-group-pointer"
        class={props.class}
        style={props.style}
        prop={props.prop}
        onRemoveGroup={() => {
          ctx.emit('remove', props.basePropPath + '.data.items.0');
          // removeItem(0);
        }}
      >
        <div>
          {props.prop.array ? (
            <BCMSPropWrapperArray
              prop={props.prop}
              onAdd={async () => {
                ctx.emit('add', props.basePropPath + '.data.items');
              }}
            >
              {propsValue.value.items.map((_, itemIndex) => {
                return (
                  <BCMSPropWrapperArrayItem
                    arrayLength={propsValue.value.items.length}
                    itemPositionInArray={itemIndex}
                    onMove={(data) => {
                      ctx.emit(
                        'move',
                        props.basePropPath + '.data.items',
                        data
                      );
                    }}
                    onRemove={(_index) => {
                      ctx.emit(
                        'remove',
                        props.basePropPath + '.data.items.' + itemIndex
                      );
                      // const prop = window.bcms.util.object.instance(props.prop);
                      // (prop.data as PropValueType).items.splice(index, 1);
                      // ctx.emit('update', prop);
                    }}
                  >
                    {group.value ? (
                      <>
                        <BCMSPropsEditor
                          id={propsValue.value.items[itemIndex].id}
                          basePropPath={
                            props.basePropPath +
                            '.data.items.' +
                            itemIndex +
                            '.props.'
                          }
                          props={propsValue.value.items[itemIndex].props}
                          lng={props.lng}
                          onAdd={(propPath) => {
                            ctx.emit('add', propPath);
                          }}
                          onMove={(propPath, data) => {
                            ctx.emit('move', propPath, data);
                          }}
                          onRemove={(propPath) => {
                            ctx.emit('remove', propPath);
                          }}
                          onUpdate={(value, propPath) => {
                            ctx.emit('update', value, propPath);
                          }}
                          onUpdateContent={(propPath, updates) => {
                            ctx.emit('updateContent', propPath, updates);
                          }}
                        />
                      </>
                    ) : (
                      translations.value.prop.groupPointer.loading
                    )}
                  </BCMSPropWrapperArrayItem>
                );
              })}
            </BCMSPropWrapperArray>
          ) : (
            <>
              {group.value && propsValue.value.items.length > 0 ? (
                <BCMSPropsEditor
                  basePropPath={props.basePropPath + '.data.items.0.props.'}
                  props={propsValue.value.items[0].props}
                  lng={props.lng}
                  onAdd={(propPath) => {
                    ctx.emit('add', propPath);
                  }}
                  onMove={(propPath, data) => {
                    ctx.emit('move', propPath, data);
                  }}
                  onRemove={(propPath) => {
                    ctx.emit('remove', propPath);
                  }}
                  onUpdate={(value, propPath) => {
                    ctx.emit('update', value, propPath);
                  }}
                  onUpdateContent={(propPath, updates) => {
                    ctx.emit('updateContent', propPath, updates);
                  }}
                />
              ) : group.value ? (
                <BCMSButton
                  size="m"
                  onClick={async () => {
                    ctx.emit('add', props.basePropPath + '.data.items');
                  }}
                  class="mt-7"
                >
                  {translations.value.prop.groupPointer.addGroup(
                    group.value.label
                  )}
                </BCMSButton>
              ) : (
                translations.value.prop.groupPointer.loading
              )}
            </>
          )}
        </div>
      </BCMSPropWrapper>
    );
  },
});
export default component;

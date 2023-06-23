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
import { BCMSContentEditor } from '../content';
import type {
  BCMSArrayPropMoveEventData,
  BCMSEntrySync,
  BCMSPropValueExtended,
  BCMSPropValueExtendedRichTextData,
} from '../../types';
import { useTranslation } from '../../translations';
import type { BCMSEntryContentNode } from '@becomes/cms-sdk/types';

type PropValueType = BCMSPropValueExtendedRichTextData[];

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    lng: String,
    prop: {
      type: Object as PropType<BCMSPropValueExtended>,
      required: true,
    },
    parentId: String,
    basePropPath: String,
    entrySync: Object as PropType<BCMSEntrySync>,
  },
  emits: {
    update: (_nodes: BCMSEntryContentNode[], _propPath: string) => {
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
    updateContent: (_propPath: string, _updates: number[]) => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });
    props = reactive(props);
    const errors = ref((props.prop.data as PropValueType).map(() => ''));

    const unregisterFromChecker = window.bcms.prop.checker.register(() => {
      let isOk = true;
      if (props.prop.required) {
        if ((props.prop.data as PropValueType).length === 0) {
          errors.value[0] = translations.value.prop.richText.error.emptyValue;
          isOk = false;
        } else {
          for (let i = 0; i < (props.prop.data as PropValueType).length; i++) {
            if ((props.prop.data as PropValueType)[i].nodes.length === 0) {
              errors.value[i] =
                translations.value.prop.richText.error.emptyValue;
              isOk = false;
            } else {
              errors.value[i] = '';
            }
          }
        }
      }
      return isOk;
    });

    onBeforeUpdate(() => {
      const value = props.prop.data as PropValueType;
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
        cyTag="prop-richText"
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
                    arrayLength={(props.prop.data as PropValueType).length}
                    itemPositionInArray={valueIndex}
                    onMove={(data) => {
                      ctx.emit('move', props.basePropPath + '.data', data);
                    }}
                    onRemove={(index) => {
                      ctx.emit('remove', props.basePropPath + '.data.' + index);
                    }}
                  >
                    <BCMSContentEditor
                      propPath={
                        props.basePropPath + '.data.' + valueIndex + '.nodes'
                      }
                      entrySync={props.entrySync}
                      id={
                        (props.prop.data as PropValueType)[valueIndex].id +
                        (props.parentId || '')
                      }
                      content={{
                        lng: props.lng || '',
                        nodes: (props.prop.data as PropValueType)[valueIndex]
                          .nodes,
                      }}
                      lng={props.lng}
                      inMeta={true}
                      invalidText={errors.value[valueIndex]}
                      allowedWidgetIds={[]}
                      disallowWidgets
                      onEditorReady={(editor) => {
                        editor.on('update', () => {
                          ctx.emit(
                            'update',
                            editor.getJSON().content as BCMSEntryContentNode[],
                            props.basePropPath + `.data.${valueIndex}.nodes`
                          );
                        });
                      }}
                      onUpdateContent={(propPath, updates) => {
                        ctx.emit('updateContent', propPath, updates);
                      }}
                    />
                  </BCMSPropWrapperArrayItem>
                );
              })}
            </BCMSPropWrapperArray>
          ) : (
            <>
              <BCMSContentEditor
                propPath={props.basePropPath + '.data.0.nodes'}
                entrySync={props.entrySync}
                content={{
                  lng: props.lng || '',
                  nodes: (props.prop.data as PropValueType)[0].nodes,
                }}
                lng={props.lng}
                id={props.prop.id + (props.parentId || '')}
                allowedWidgetIds={[]}
                inMeta={true}
                invalidText={errors.value[0]}
                disallowWidgets
                onEditorReady={(editor) => {
                  setTimeout(() => {
                    editor.on('update', () => {
                      ctx.emit(
                        'update',
                        editor.getJSON().content as BCMSEntryContentNode[],
                        props.basePropPath + '.data.0.nodes'
                      );
                    });
                  }, 100);
                }}
                onUpdateContent={(propPath, updates) => {
                  ctx.emit('updateContent', propPath, updates);
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

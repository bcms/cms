import { defineComponent, type PropType } from 'vue';
import { BCMSPropType } from '@becomes/cms-sdk/types';
import { DefaultComponentProps } from '../_default';
import type {
  BCMSArrayPropMoveEventData,
  BCMSEntrySync,
  BCMSPropValueExtended,
} from '../../types';
import BCMSPropString from './string';
import BCMSPropNumber from './number';
import BCMSPropBoolean from './boolean';
import BCMSPropDate from './date';
import BCMSPropEnum from './enum';
import BCMSPropEntryPointer from './entry-pointer';
import BCMSPropGroupPointer from './group-pointer';
import BCMSPropMedia from './media';
import BCMSPropRichText from './rich-text';
import BCMSPropColorPicker from './color';
import { BCMSEntrySyncService } from '../../services';

const singleColItems = [
  BCMSPropType.BOOLEAN,
  BCMSPropType.DATE,
  BCMSPropType.ENUMERATION,
  BCMSPropType.NUMBER,
];

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    lng: String,
    props: {
      type: Array as PropType<BCMSPropValueExtended[]>,
      required: true,
    },
    propsOffset: { type: Number, default: 0 },
    basePropPath: String,
    parentId: String,
  },
  emits: {
    update: (_value: any, _propPath: string) => {
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
    const entrySync = BCMSEntrySyncService.instance as BCMSEntrySync;
    const store = window.bcms.vue.store;
    let checkNextType = true;

    function isSingleCol(
      currentProp: BCMSPropValueExtended,
      nextProp?: BCMSPropValueExtended
    ): boolean {
      if (!checkNextType) {
        checkNextType = true;
        return true;
      }
      if (
        !currentProp.array &&
        singleColItems.includes(currentProp.type) &&
        nextProp &&
        !nextProp.array &&
        singleColItems.includes(nextProp.type)
      ) {
        checkNextType = false;
        return true;
      }
      return false;
    }

    return () => (
      <div
        id={props.id}
        class={`grid grid-cols-2 gap-4 ${props.class}`}
        style={props.style}
        v-cy={props.cyTag ? props.cyTag : 'props'}
        data-bcms-prop-path={props.basePropPath}
      >
        {props.props.map((prop, propIndex) => {
          if (
            prop.type === BCMSPropType.COLOR_PICKER &&
            !store.getters.feature_available('color_picker')
          ) {
            return '';
          }
          return (
            <div
              class={`max-w-full col-span-2 ${
                isSingleCol(prop, props.props[propIndex + 1])
                  ? 'xs:col-span-1'
                  : ''
              }`}
            >
              {prop.type === BCMSPropType.STRING ? (
                <BCMSPropString
                  basePropPath={
                    props.basePropPath + '' + (propIndex + props.propsOffset)
                  }
                  prop={prop}
                  onMove={(propPath, data) => {
                    ctx.emit('move', propPath, data);
                  }}
                  onAdd={(propPath) => {
                    ctx.emit('add', propPath);
                  }}
                  onRemove={(propPath) => {
                    ctx.emit('remove', propPath);
                  }}
                  onUpdate={(value, propPath) => {
                    ctx.emit('update', value, propPath);
                  }}
                />
              ) : prop.type === BCMSPropType.NUMBER ? (
                <BCMSPropNumber
                  basePropPath={
                    props.basePropPath + '' + (propIndex + props.propsOffset)
                  }
                  prop={prop}
                  onMove={(propPath, data) => {
                    ctx.emit('move', propPath, data);
                  }}
                  onAdd={(propPath) => {
                    ctx.emit('add', propPath);
                  }}
                  onRemove={(propPath) => {
                    ctx.emit('remove', propPath);
                  }}
                  onUpdate={(value, propPath) => {
                    ctx.emit('update', value, propPath);
                  }}
                />
              ) : prop.type === BCMSPropType.BOOLEAN ? (
                <BCMSPropBoolean
                  basePropPath={
                    props.basePropPath + '' + (propIndex + props.propsOffset)
                  }
                  prop={prop}
                  onMove={(propPath, data) => {
                    ctx.emit('move', propPath, data);
                  }}
                  onAdd={(propPath) => {
                    ctx.emit('add', propPath);
                  }}
                  onRemove={(propPath) => {
                    ctx.emit('remove', propPath);
                  }}
                  onUpdate={(value, propPath) => {
                    ctx.emit('update', value, propPath);
                  }}
                />
              ) : prop.type === BCMSPropType.DATE ? (
                <BCMSPropDate
                  basePropPath={
                    props.basePropPath + '' + (propIndex + props.propsOffset)
                  }
                  prop={prop}
                  onMove={(propPath, data) => {
                    ctx.emit('move', propPath, data);
                  }}
                  onAdd={(propPath) => {
                    ctx.emit('add', propPath);
                  }}
                  onRemove={(propPath) => {
                    ctx.emit('remove', propPath);
                  }}
                  onUpdate={(value, propPath) => {
                    ctx.emit('update', value, propPath);
                  }}
                />
              ) : prop.type === BCMSPropType.ENUMERATION ? (
                <BCMSPropEnum
                  basePropPath={
                    props.basePropPath + '' + (propIndex + props.propsOffset)
                  }
                  prop={prop}
                  onUpdate={(value, propPath) => {
                    ctx.emit('update', value, propPath);
                    // ctx.emit('update', { propIndex, prop: propModified });
                  }}
                />
              ) : prop.type === BCMSPropType.ENTRY_POINTER ? (
                <BCMSPropEntryPointer
                  basePropPath={
                    props.basePropPath + '' + (propIndex + props.propsOffset)
                  }
                  templateIds={prop.templateIds}
                  prop={prop}
                  onMove={(propPath, data) => {
                    ctx.emit('move', propPath, data);
                  }}
                  onAdd={(propPath) => {
                    ctx.emit('add', propPath);
                  }}
                  onRemove={(propPath) => {
                    ctx.emit('remove', propPath);
                  }}
                  onUpdate={(value, propPath) => {
                    ctx.emit('update', value, propPath);
                  }}
                />
              ) : prop.type === BCMSPropType.GROUP_POINTER ? (
                <BCMSPropGroupPointer
                  basePropPath={
                    props.basePropPath + '' + (propIndex + props.propsOffset)
                  }
                  prop={prop}
                  lng={props.lng}
                  onMove={(propPath, data) => {
                    ctx.emit('move', propPath, data);
                  }}
                  onAdd={(propPath) => {
                    ctx.emit('add', propPath);
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
              ) : prop.type === BCMSPropType.MEDIA ? (
                <BCMSPropMedia
                  basePropPath={
                    props.basePropPath + '' + (propIndex + props.propsOffset)
                  }
                  prop={prop}
                  onMove={(propPath, data) => {
                    ctx.emit('move', propPath, data);
                  }}
                  onAdd={(propPath) => {
                    ctx.emit('add', propPath);
                  }}
                  onRemove={(propPath) => {
                    ctx.emit('remove', propPath);
                  }}
                  onUpdate={(value, propPath) => {
                    ctx.emit('update', value, propPath);
                  }}
                />
              ) : prop.type === BCMSPropType.RICH_TEXT ? (
                <>
                  <BCMSPropRichText
                    basePropPath={
                      props.basePropPath + '' + (propIndex + props.propsOffset)
                    }
                    prop={prop}
                    lng={props.lng}
                    entrySync={entrySync}
                    onMove={(propPath, data) => {
                      ctx.emit('move', propPath, data);
                    }}
                    onAdd={(propPath) => {
                      ctx.emit('add', propPath);
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
              ) : prop.type === BCMSPropType.COLOR_PICKER ? (
                <BCMSPropColorPicker
                  prop={prop}
                  lng={props.lng}
                  onMove={(propPath, data) => {
                    ctx.emit('move', propPath, data);
                  }}
                  onAdd={(propPath) => {
                    ctx.emit('add', propPath);
                  }}
                  onRemove={(propPath) => {
                    ctx.emit('remove', propPath);
                  }}
                  onUpdate={(value, propPath) => {
                    ctx.emit('update', value, propPath);
                  }}
                />
              ) : (
                ''
              )}
            </div>
          );
        })}
      </div>
    );
  },
});
export default component;

import { defineComponent, type PropType } from 'vue';
import type {
    Prop,
    PropValue,
} from '@thebcms/selfhosted-backend/prop/models/main';
import type { PropValidator } from '@thebcms/selfhosted-ui/util/prop-validation';
import type { EntrySync } from '@thebcms/selfhosted-ui/services/entry-sync';
import { PropStringInput } from '@thebcms/selfhosted-ui/components/prop/string';
import { PropNumberInput } from '@thebcms/selfhosted-ui/components/prop/number';
import { PropBooleanInput } from '@thebcms/selfhosted-ui/components/prop/boolean';
import { PropDateInput } from '@thebcms/selfhosted-ui/components/prop/date';
import { PropEnumInput } from '@thebcms/selfhosted-ui/components/prop/enum';
import { PropMediaInput } from '@thebcms/selfhosted-ui/components/prop/media';
import { PropRichTextInput } from '@thebcms/selfhosted-ui/components/prop/rich-text';
import { PropGroupPointerInput } from '@thebcms/selfhosted-ui/components/prop/group-pointer';
import { PropEntryPointerInput } from '@thebcms/selfhosted-ui/components/prop/entry-pointer';

export const EntryMetaEditor = defineComponent({
    props: {
        propPath: {
            type: String,
            required: true,
        },
        props: {
            type: Array as PropType<Prop[]>,
            required: true,
        },
        propsIdxOffset: Number,
        values: {
            type: Array as PropType<PropValue[]>,
            required: true,
        },
        lngCode: {
            type: String,
            required: true,
        },
        lngIdx: {
            type: Number,
            required: true,
        },
        entryId: {
            type: String,
            required: true,
        },
        propValidator: {
            type: Object as PropType<PropValidator>,
            required: true,
        },
        propDepth: {
            type: Number,
            default: 0,
        },
        entrySync: Object as PropType<EntrySync>,
    },
    emits: {
        editProp: (_propPath: string, _value: unknown) => {
            return true;
        },
        addValue: (_propPath: string, _prop: Prop) => {
            return true;
        },
        removeArrayItem: (_propPath: string) => {
            return true;
        },
        moveArrayItem: (_propPath: string, _direction: number) => {
            return true;
        },
    },
    setup(props, ctx) {
        return () => (
            <div id={props.propPath}>
                {props.props.map((prop, _propIdx) => {
                    const propIdx = props.propsIdxOffset
                        ? _propIdx + props.propsIdxOffset
                        : _propIdx;
                    const value = props.values.find((e) => e.id === prop.id);
                    if (value) {
                        if (prop.type === 'STRING') {
                            return (
                                <PropStringInput
                                    propValidator={props.propValidator}
                                    propPath={props.propPath + `.${propIdx}`}
                                    prop={prop}
                                    value={value}
                                    propDepth={props.propDepth}
                                    entrySync={props.entrySync}
                                    onEdit={(propPath, propValue) => {
                                        ctx.emit(
                                            'editProp',
                                            propPath,
                                            propValue,
                                        );
                                    }}
                                    onAddValue={(propPath) => {
                                        ctx.emit('addValue', propPath, prop);
                                    }}
                                    onRemoveArrayItem={(propPath) => {
                                        ctx.emit('removeArrayItem', propPath);
                                    }}
                                    onMoveArrayItem={(propPath, direction) => {
                                        ctx.emit(
                                            'moveArrayItem',
                                            propPath,
                                            direction,
                                        );
                                    }}
                                />
                            );
                        } else if (prop.type === 'NUMBER') {
                            return (
                                <PropNumberInput
                                    propPath={props.propPath + `.${propIdx}`}
                                    prop={prop}
                                    value={value}
                                    entrySync={props.entrySync}
                                    propValidator={props.propValidator}
                                    onEdit={(propPath, propValue) => {
                                        ctx.emit(
                                            'editProp',
                                            propPath,
                                            propValue,
                                        );
                                    }}
                                    onAddValue={(propPath) => {
                                        ctx.emit('addValue', propPath, prop);
                                    }}
                                    onRemoveArrayItem={(propPath) => {
                                        ctx.emit('removeArrayItem', propPath);
                                    }}
                                    onMoveArrayItem={(propPath, direction) => {
                                        ctx.emit(
                                            'moveArrayItem',
                                            propPath,
                                            direction,
                                        );
                                    }}
                                />
                            );
                        } else if (prop.type === 'BOOLEAN') {
                            return (
                                <PropBooleanInput
                                    propPath={props.propPath + `.${propIdx}`}
                                    prop={prop}
                                    value={value}
                                    entrySync={props.entrySync}
                                    onEdit={(propPath, propValue) => {
                                        ctx.emit(
                                            'editProp',
                                            propPath,
                                            propValue,
                                        );
                                    }}
                                    onAddValue={(propPath) => {
                                        ctx.emit('addValue', propPath, prop);
                                    }}
                                    onRemoveArrayItem={(propPath) => {
                                        ctx.emit('removeArrayItem', propPath);
                                    }}
                                    onMoveArrayItem={(propPath, direction) => {
                                        ctx.emit(
                                            'moveArrayItem',
                                            propPath,
                                            direction,
                                        );
                                    }}
                                />
                            );
                        } else if (prop.type === 'DATE') {
                            return (
                                <PropDateInput
                                    propPath={props.propPath + `.${propIdx}`}
                                    prop={prop}
                                    value={value}
                                    entrySync={props.entrySync}
                                    propValidator={props.propValidator}
                                    onEdit={(propPath, propValue) => {
                                        ctx.emit(
                                            'editProp',
                                            propPath,
                                            propValue,
                                        );
                                    }}
                                    onAddValue={(propPath) => {
                                        ctx.emit('addValue', propPath, prop);
                                    }}
                                    onRemoveArrayItem={(propPath) => {
                                        ctx.emit('removeArrayItem', propPath);
                                    }}
                                    onMoveArrayItem={(propPath, direction) => {
                                        ctx.emit(
                                            'moveArrayItem',
                                            propPath,
                                            direction,
                                        );
                                    }}
                                />
                            );
                        } else if (prop.type === 'ENUMERATION') {
                            return (
                                <PropEnumInput
                                    propPath={props.propPath + `.${propIdx}`}
                                    prop={prop}
                                    value={value}
                                    propValidator={props.propValidator}
                                    entrySync={props.entrySync}
                                    onEdit={(propPath, propValue) => {
                                        ctx.emit(
                                            'editProp',
                                            propPath,
                                            propValue,
                                        );
                                    }}
                                    onAddValue={(propPath) => {
                                        ctx.emit('addValue', propPath, prop);
                                    }}
                                    onRemoveArrayItem={(propPath) => {
                                        ctx.emit('removeArrayItem', propPath);
                                    }}
                                    onMoveArrayItem={(propPath, direction) => {
                                        ctx.emit(
                                            'moveArrayItem',
                                            propPath,
                                            direction,
                                        );
                                    }}
                                />
                            );
                        } else if (prop.type === 'MEDIA') {
                            return (
                                <PropMediaInput
                                    propPath={props.propPath + `.${propIdx}`}
                                    prop={prop}
                                    value={value}
                                    propValidator={props.propValidator}
                                    entrySync={props.entrySync}
                                    onEdit={(propPath, propValue) => {
                                        ctx.emit(
                                            'editProp',
                                            propPath,
                                            propValue,
                                        );
                                    }}
                                    onAddValue={(propPath) => {
                                        ctx.emit('addValue', propPath, prop);
                                    }}
                                    onRemoveArrayItem={(propPath) => {
                                        ctx.emit('removeArrayItem', propPath);
                                    }}
                                    onMoveArrayItem={(propPath, direction) => {
                                        ctx.emit(
                                            'moveArrayItem',
                                            propPath,
                                            direction,
                                        );
                                    }}
                                />
                            );
                        } else if (prop.type === 'RICH_TEXT') {
                            return (
                                <PropRichTextInput
                                    propPath={props.propPath + `.${propIdx}`}
                                    prop={prop}
                                    value={value}
                                    lngIdx={props.lngIdx}
                                    entryId={props.entryId}
                                    propValidator={props.propValidator}
                                    entrySync={props.entrySync}
                                    onEdit={(propPath, propValue) => {
                                        ctx.emit(
                                            'editProp',
                                            propPath,
                                            propValue,
                                        );
                                    }}
                                    onAddValue={(propPath) => {
                                        ctx.emit('addValue', propPath, prop);
                                    }}
                                    onRemoveArrayItem={(propPath) => {
                                        ctx.emit('removeArrayItem', propPath);
                                    }}
                                    onMoveArrayItem={(propPath, direction) => {
                                        ctx.emit(
                                            'moveArrayItem',
                                            propPath,
                                            direction,
                                        );
                                    }}
                                />
                            );
                        } else if (prop.type === 'GROUP_POINTER') {
                            return (
                                <PropGroupPointerInput
                                    propPath={props.propPath + `.${propIdx}`}
                                    prop={prop}
                                    value={value}
                                    lngCode={props.lngCode}
                                    lngIdx={props.lngIdx}
                                    entryId={props.entryId}
                                    propValidator={props.propValidator}
                                    propDepth={props.propDepth}
                                    entrySync={props.entrySync}
                                    onEditProp={(propPath, propValue) => {
                                        ctx.emit(
                                            'editProp',
                                            propPath,
                                            propValue,
                                        );
                                    }}
                                    onAddValue={(propPath, propFromEvent) => {
                                        ctx.emit(
                                            'addValue',
                                            propPath,
                                            propFromEvent,
                                        );
                                    }}
                                    onRemoveArrayItem={(propPath) => {
                                        ctx.emit('removeArrayItem', propPath);
                                    }}
                                    onMoveArrayItem={(propPath, direction) => {
                                        ctx.emit(
                                            'moveArrayItem',
                                            propPath,
                                            direction,
                                        );
                                    }}
                                />
                            );
                        } else if (prop.type === 'ENTRY_POINTER') {
                            return (
                                <PropEntryPointerInput
                                    propPath={props.propPath + `.${propIdx}`}
                                    prop={prop}
                                    value={value}
                                    entrySync={props.entrySync}
                                    propValidator={props.propValidator}
                                    onEdit={(propPath, propValue) => {
                                        ctx.emit(
                                            'editProp',
                                            propPath,
                                            propValue,
                                        );
                                    }}
                                    onAddValue={(propPath) => {
                                        ctx.emit('addValue', propPath, prop);
                                    }}
                                    onRemoveArrayItem={(propPath) => {
                                        ctx.emit('removeArrayItem', propPath);
                                    }}
                                    onMoveArrayItem={(propPath, direction) => {
                                        ctx.emit(
                                            'moveArrayItem',
                                            propPath,
                                            direction,
                                        );
                                    }}
                                />
                            );
                        }
                    }
                    return '';
                })}
            </div>
        );
    },
});

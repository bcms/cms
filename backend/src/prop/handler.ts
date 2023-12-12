import { useBcmsEntryParser } from '@backend/entry';
import { BCMSFactory } from '@backend/factory';
import { BCMSMediaService } from '@backend/media';
import { BCMSRepo } from '@backend/repo';
import { BCMSSocketManager } from '@backend/socket';
import { BCMSContentUtility } from '@backend/util';
import { useObjectUtility, useStringUtility } from '@becomes/purple-cheetah';
import {
  Module,
  ObjectUtility,
  ObjectUtilityError,
  StringUtility,
} from '@becomes/purple-cheetah/types';
import {
  BCMSProp,
  BCMSPropChangeUpdate,
  BCMSPropDataParsed,
  BCMSPropEntryPointerData,
  BCMSPropEntryPointerDataParsed,
  BCMSPropEnumData,
  BCMSPropGroupPointerData,
  BCMSPropHandlerPointer,
  BCMSPropMediaData,
  BCMSPropMediaDataParsed,
  BCMSPropParsed,
  BCMSPropType,
  BCMSPropValueGroupPointerData,
  BCMSSocketEventType,
  BCMSPropRichTextData,
  BCMSPropColorPickerData,
  BCMSPropValueColorPickerData,
  BCMSPropTagData,
  BCMSPropWidgetData,
  BCMSPropValueWidgetData,
  BCMSPropDateData,
  BCMSPropValueRichTextData,
  BCMSEntryContentNodeType,
  BCMSEntryContentNodeHeadingAttr,
  BCMSEntryContentParsedItem,
  BCMSPropChangeTransform,
  BCMSEntryContentNode,
  BCMSPropValueEntryPointer,
  BCMSPropEntryPointerDataSchema,
  BCMSPropValueMediaData,
  BCMSPropValue,
  BCMSPropChange,
  BCMSEntry,
} from '../types';

let objectUtil: ObjectUtility;
let stringUtil: StringUtility;

function nodeToText(node: BCMSEntryContentNode) {
  let output = '';
  if (node.type === BCMSEntryContentNodeType.text && node.text) {
    output = node.text;
  } else if (node.content) {
    output =
      node.content.map((childNode) => nodeToText(childNode)).join('') + '\n';
  }
  return output;
}

export class BCMSPropHandler {
  static async checkPropValues({
    props,
    values,
    level,
  }: {
    props: BCMSProp[];
    values: BCMSPropValue[];
    level: string;
  }): Promise<Error | void> {
    if (props.length !== values.length) {
      return Error(`[${level}] -> props and values are not the same length.`);
    }
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const value = values.find((e) => e.id === prop.id);
      if (!value) {
        return Error(`[${level}.${prop.name}] -> No value found.`);
      }
      switch (prop.type) {
        case BCMSPropType.STRING:
          {
            const checkData = objectUtil.compareWithSchema(
              {
                data: value.data,
              },
              {
                data: {
                  __type: 'array',
                  __required: true,
                  __child: {
                    __type: 'string',
                  },
                },
              },
              `${level}.${prop.name}`,
            );
            if (checkData instanceof ObjectUtilityError) {
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
            }
          }
          break;
        case BCMSPropType.NUMBER:
          {
            const checkData = objectUtil.compareWithSchema(
              {
                data: value.data,
              },
              {
                data: {
                  __type: 'array',
                  __required: true,
                  __child: {
                    __type: 'number',
                  },
                },
              },
              `${level}.${prop.name}`,
            );
            if (checkData instanceof ObjectUtilityError) {
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
            }
          }
          break;
        case BCMSPropType.BOOLEAN:
          {
            const checkData = objectUtil.compareWithSchema(
              {
                data: value.data,
              },
              {
                data: {
                  __type: 'array',
                  __required: true,
                  __child: {
                    __type: 'boolean',
                  },
                },
              },
              `${level}.${prop.name}`,
            );
            if (checkData instanceof ObjectUtilityError) {
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
            }
          }
          break;
        case BCMSPropType.DATE:
          {
            const checkData = objectUtil.compareWithSchema(
              {
                data: value.data,
              },
              {
                data: {
                  __type: 'array',
                  __required: true,
                  __child: {
                    __type: 'number',
                  },
                },
              },
              `${level}.${prop.name}`,
            );
            if (checkData instanceof ObjectUtilityError) {
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
            }
          }
          break;
        case BCMSPropType.ENUMERATION:
          {
            const checkData = objectUtil.compareWithSchema(
              {
                data: value.data,
              },
              {
                data: {
                  __type: 'array',
                  __required: true,
                  __child: {
                    __type: 'string',
                  },
                },
              },
              `${level}.${prop.name}`,
            );
            if (checkData instanceof ObjectUtilityError) {
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
            }
          }
          break;
        case BCMSPropType.MEDIA:
          {
            const checkData = objectUtil.compareWithSchema(
              {
                data: value.data,
              },
              {
                data: {
                  __type: 'array',
                  __required: true,
                  __child: {
                    __type: 'object',
                    __content: {
                      _id: {
                        __type: 'string',
                        __required: true,
                      },
                      alt_text: {
                        __type: 'string',
                        __required: false,
                      },
                      caption: {
                        __type: 'string',
                        __required: false,
                      },
                    },
                  },
                },
              },
              `${level}.${prop.name}`,
            );
            if (checkData instanceof ObjectUtilityError) {
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
            }
          }
          break;
        case BCMSPropType.WIDGET:
          {
            const propData = prop.defaultData as BCMSPropWidgetData;
            const valueData = value.data as BCMSPropValueWidgetData;
            if (propData._id !== valueData._id) {
              return Error(
                `[${level}.${prop.name}._id] -> ` +
                  'Prop and value widget IDs do not match.',
              );
            }
            const widget = await BCMSRepo.widget.findById(propData._id);
            if (!widget) {
              return Error(
                `[${level}.${prop.name}._id] -> ` +
                  `Widget with ID ${propData._id} does not exist.`,
              );
            }
            for (let j = 0; j < valueData.props.length; j++) {
              const item = valueData.props[j];
              const widgetCheckPropValuesResult =
                await BCMSPropHandler.checkPropValues({
                  level: `${level}.${prop.name}.props.${j}`,
                  props: widget.props,
                  values: [item],
                });
              if (widgetCheckPropValuesResult instanceof Error) {
                return widgetCheckPropValuesResult;
              }
            }
          }
          break;
        case BCMSPropType.GROUP_POINTER:
          {
            const propData = prop.defaultData as BCMSPropGroupPointerData;
            const valueData = value.data as BCMSPropValueGroupPointerData;
            if (propData._id !== valueData._id) {
              return Error(
                `[${level}.${prop.name}._id] -> ` +
                  'Prop and value group pointer IDs do not match.',
              );
            }
            const group = await BCMSRepo.group.findById(propData._id);
            if (!group) {
              return Error(
                `[${level}.${prop.name}._id] -> ` +
                  `Group with ID ${propData._id} does not exist.`,
              );
            }
            for (let j = 0; j < valueData.items.length; j++) {
              const item = valueData.items[j];
              const groupCheckPropValuesResult =
                await BCMSPropHandler.checkPropValues({
                  level: `${level}.${prop.name}.items.${j}.props`,
                  props: group.props,
                  values: item.props,
                });
              if (groupCheckPropValuesResult instanceof Error) {
                return groupCheckPropValuesResult;
              }
            }
          }
          break;
        case BCMSPropType.ENTRY_POINTER:
          {
            const checkData = objectUtil.compareWithSchema(
              {
                data: value.data,
              },
              {
                data: {
                  __type: 'array',
                  __required: true,
                  __child: {
                    __type: 'object',
                    __content: {
                      tid: {
                        __type: 'string',
                        __required: true,
                      },
                      eid: {
                        __type: 'string',
                        __required: true,
                      },
                    },
                  },
                },
              },
              `${level}.${prop.name}`,
            );
            if (checkData instanceof ObjectUtilityError) {
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
            }
            const propData = prop.defaultData as BCMSPropEntryPointerData[];
            const valueData = value.data as BCMSPropValueEntryPointer[];
            for (let j = 0; j < valueData.length; j++) {
              const valueInfo = valueData[j];
              const propInfo = propData.find(
                (e) => e.templateId === valueInfo.tid,
              );
              if (!propInfo) {
                return Error(
                  `[${level}.${prop.name}.${j}.templateId] -> ` +
                    `Template ID "${valueInfo.tid}" is not allowed for this property.`,
                );
              }
              const entryId = valueInfo.eid;
              if (entryId) {
                const entry = await BCMSRepo.entry.findById(entryId);
                if (!entry) {
                  return Error(
                    `[${level}.${prop.name}.${j}] -> ` +
                      `Entry with ID ${entryId} does not exist.`,
                  );
                }
                if (entry.templateId !== propInfo.templateId) {
                  return Error(
                    `[${level}.${prop.name}.${j}] -> ` +
                      `Entry with ID ${entryId} does not belong` +
                      ` to template "${propInfo.templateId}" but to` +
                      ` template "${entry.templateId}".`,
                  );
                }
              }
            }
          }
          break;
        case BCMSPropType.COLOR_PICKER:
          {
            const checkData = objectUtil.compareWithSchema(
              {
                data: value.data,
              },
              {
                data: {
                  __type: 'array',
                  __required: true,
                  __child: {
                    __type: 'string',
                  },
                },
              },
              `${level}.${prop.name}`,
            );
            if (checkData instanceof ObjectUtilityError) {
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
            }
            const propData = prop.defaultData as BCMSPropColorPickerData;
            const valueData = value.data as BCMSPropValueColorPickerData;
            for (let j = 0; j < valueData.length; j++) {
              const colorIdOrHex = valueData[j];
              if (colorIdOrHex) {
                if (
                  !propData.allowCustom &&
                  !(await BCMSRepo.color.findById(colorIdOrHex))
                ) {
                  return Error(
                    `[${level}.${prop.name}.${j}] -> ` +
                      `Color with ID ${colorIdOrHex} does not exist in "options".`,
                  );
                }
              } else {
                return Error(
                  `[${level}.${prop.name}.${j}] -> ` + `Missing prop "value".`,
                );
              }
            }
          }
          break;
        case BCMSPropType.RICH_TEXT:
          {
            const checkData = objectUtil.compareWithSchema(
              {
                data: value.data,
              },
              {
                data: {
                  __type: 'array',
                  __required: true,
                  __child: {
                    __type: 'object',
                    __content: {
                      nodes: {
                        __type: 'array',
                        __required: true,
                        __child: {
                          __type: 'object',
                          __content: {},
                        },
                      },
                    },
                  },
                },
              },
              `${level}.${prop.name}`,
            );
            if (checkData instanceof ObjectUtilityError) {
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
            }
          }
          break;
        case BCMSPropType.TAG:
          {
            const checkData = objectUtil.compareWithSchema(
              {
                data: value.data,
              },
              {
                data: {
                  __type: 'array',
                  __required: true,
                  __child: {
                    __type: 'string',
                  },
                },
              },
              `${level}.${prop.name}`,
            );
            if (checkData instanceof ObjectUtilityError) {
              return Error(`[${level}.${prop.name}] -> ` + checkData.message);
            }
          }
          break;
        default: {
          return Error(
            `[${level}.${prop.name}] -> Unknown prop type "${prop.type}"`,
          );
        }
      }
    }
  }

  static async testInfiniteLoop(
    props: BCMSProp[],
    _pointer?: BCMSPropHandlerPointer,
    level?: string,
  ): Promise<Error | void> {
    if (!level) {
      level = 'props';
    }
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      let pointer: BCMSPropHandlerPointer;
      if (!_pointer) {
        pointer = {
          group: [],
        };
      } else {
        pointer = JSON.parse(JSON.stringify(_pointer));
      }
      if (prop.type === BCMSPropType.GROUP_POINTER) {
        const data = prop.defaultData as BCMSPropGroupPointerData;
        const group = await BCMSRepo.group.findById(data._id);
        if (!group) {
          return Error(
            `[ ${level}.value._id ] --> ` +
              `Group with ID "${data._id}" does not exist.`,
          );
        }
        if (pointer.group.find((e) => e._id === data._id)) {
          return Error(
            `Pointer loop detected: [ ${pointer.group
              .map((e) => {
                return e.label;
              })
              .join(' -> ')} -> ${
              group.label
            } ] this is forbidden since it will result in an infinite loop.`,
          );
        }
        pointer.group.push({
          _id: data._id,
          label: group.label,
        });
        const result = await BCMSPropHandler.testInfiniteLoop(
          group.props,
          pointer,
          `${level}[i].group.props`,
        );
        if (result instanceof Error) {
          return result;
        }
      }
    }
  }

  static async propsChecker(
    _propsToCheck: BCMSProp[],
    _props: BCMSProp[],
    _level?: string,
    _inTemplate?: boolean,
  ): Promise<Error | void> {
    // TODO: Implement logic
    return;
  }

  static async applyPropChanges(
    _props: BCMSProp[],
    changes: BCMSPropChange[],
    level?: string,
    inTemplate?: boolean,
  ): Promise<BCMSProp[] | Error> {
    if (!level) {
      level = 'props';
    }
    const props: BCMSProp[] = JSON.parse(JSON.stringify(_props));
    if (!(changes instanceof Array)) {
      return Error('Parameter "changes" must be an array.');
    }
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      if (typeof change.remove === 'string') {
        const propToRemoveIndex = props.findIndex(
          (e) => e.id === change.remove,
        );
        if (inTemplate && props[0].name === 'title') {
          if (propToRemoveIndex > 1) {
            props.splice(propToRemoveIndex, 1);
          }
        } else {
          props.splice(propToRemoveIndex, 1);
        }
      } else if (typeof change.add === 'object') {
        const prop = BCMSFactory.prop.create(change.add.type, change.add.array);
        if (!prop) {
          return Error(
            `Invalid property type "${change.add.type}"` +
              ` was provided as "changes[${i}].add.type".`,
          );
        }
        prop.label = change.add.label;
        prop.name = stringUtil.toSlugUnderscore(prop.label);
        prop.required = change.add.required;
        if (props.find((e) => e.name === prop.name)) {
          return Error(
            `[${level}] -> Prop with name "${prop.name}" already exists.`,
          );
        }
        if (
          prop.type === BCMSPropType.STRING ||
          prop.type === BCMSPropType.NUMBER ||
          prop.type === BCMSPropType.BOOLEAN
        ) {
          if (change.add.defaultData) {
            prop.defaultData = change.add.defaultData;
          }
        } else if (prop.type === BCMSPropType.DATE) {
          const changeData = change.add.defaultData as number[];
          if (!changeData) {
            return Error(
              `[${level}.change.${i}.add.defaultData] -> Missing prop.`,
            );
          }
          for (let j = 0; j < changeData.length; j++) {
            (prop.defaultData as BCMSPropDateData).push(changeData[j]);
          }
        } else if (prop.type === BCMSPropType.TAG) {
          const changeData = change.add.defaultData as string[];
          if (!changeData) {
            return Error(
              `[${level}.change.${i}.add.defaultData] -> Missing prop.`,
            );
          }
          for (let j = 0; j < changeData.length; j++) {
            const tag = await BCMSRepo.tag.findById(changeData[j]);
            if (!tag) {
              return Error(
                `[${level}.change.${i}.add.defaultData] ->` +
                  ` Tag with ID "${changeData[j]}" does not exist.`,
              );
            }

            (prop.defaultData as BCMSPropTagData).push(changeData[j]);
          }
        } else if (prop.type === BCMSPropType.ENUMERATION) {
          const changeData = change.add.defaultData as BCMSPropEnumData;
          if (!changeData.items[0]) {
            return Error(
              `[${level}.change.${i}.add.defaultData] -> Missing prop.`,
            );
          }
          if (changeData.selected) {
            if (!changeData.items.includes(changeData.selected)) {
              return Error(
                `[${level}.change.${i}.add.defaultData] -> Select enum do not exist in items.`,
              );
            }
          }
          (prop.defaultData as BCMSPropEnumData) = {
            items: changeData.items,
            selected: changeData.selected,
          };
        } else if (prop.type === BCMSPropType.MEDIA) {
          const defaultData = change.add.defaultData as BCMSPropMediaData[];
          if (defaultData && defaultData.length > 0) {
            for (let j = 0; j < defaultData.length; j++) {
              const data = defaultData[j];
              if (data) {
                const media = await BCMSRepo.media.findById(data);
                if (!media) {
                  return Error(
                    `[${level}.change.${i}.add.defaultData] ->` +
                      ` Media with ID "${data}" does not exist.`,
                  );
                }
                (prop.defaultData as BCMSPropMediaData[]).push(media._id);
              }
            }
          }
        } else if (prop.type === BCMSPropType.GROUP_POINTER) {
          const changeData = change.add.defaultData as BCMSPropGroupPointerData;
          if (!changeData || !changeData._id) {
            return Error(
              `[${level}.change.${i}.add.defaultData] -> Missing prop "_id".`,
            );
          }
          const group = await BCMSRepo.group.findById(changeData._id);
          if (!group) {
            return Error(
              `[${level}.change.${i}.add.defaultData._id] ->` +
                ` Group with ID "${changeData._id}" does not exist.`,
            );
          }
          (prop.defaultData as BCMSPropGroupPointerData) = {
            _id: changeData._id,
          };
        } else if (prop.type === BCMSPropType.WIDGET) {
          const changeData = change.add.defaultData as BCMSPropWidgetData;
          if (!changeData || !changeData._id) {
            return Error(
              `[${level}.change.${i}.add.defaultData] -> Missing prop "_id".`,
            );
          }
          const widget = await BCMSRepo.widget.findById(changeData._id);
          if (!widget) {
            return Error(
              `[${level}.change.${i}.add.defaultData._id] ->` +
                ` Widget with ID "${changeData._id}" does not exist.`,
            );
          }
          (prop.defaultData as BCMSPropWidgetData) = {
            _id: changeData._id,
          };
        } else if (prop.type === BCMSPropType.ENTRY_POINTER) {
          const changeData = change.add
            .defaultData as BCMSPropEntryPointerData[];
          if (!changeData) {
            return Error(
              `[${level}.change.${i}.add] ->` + ` Missing prop "defaultData".`,
            );
          }
          let defaultData = prop.defaultData as BCMSPropEntryPointerData[];
          if (!defaultData) {
            (prop.defaultData as BCMSPropEntryPointerData[]) = [];
            defaultData = prop.defaultData as BCMSPropEntryPointerData[];
          }
          for (let j = 0; j < changeData.length; j++) {
            const changeInfo = changeData[j];
            if (!changeInfo || !changeInfo.templateId) {
              return Error(
                `[${level}.change.${i}.add.defaultData.${j}] ->` +
                  ` Missing prop "templateId".`,
              );
            }
            if (
              defaultData.find((e) => e.templateId === changeInfo.templateId)
            ) {
              return Error(
                `[${level}.change.${i}.add.defaultData.${j}.templateId] ->` +
                  ` Template ID "${changeInfo.templateId}" is already added.`,
              );
            }
            const template = await BCMSRepo.template.findById(
              changeInfo.templateId,
            );
            if (!template) {
              return Error(
                `[${level}.change.${i}.add.defaultData.${j}.templateId] ->` +
                  ` Template with ID "${changeInfo.templateId}" does not exist.`,
              );
            }
            defaultData.push({
              displayProp: 'title',
              templateId: template._id,
              entryIds: changeInfo.entryIds || [],
            });
          }
        } else if (prop.type === BCMSPropType.COLOR_PICKER) {
          const changeData = change.add.defaultData as BCMSPropColorPickerData;
          if (!changeData.selected) {
            return Error(
              `[${level}.change.${i}.add.defaultData] ->` +
                ` Missing prop "selected".`,
            );
          }
          const selectedColors: string[] = changeData.selected;
          (prop.defaultData as BCMSPropColorPickerData) = {
            allowGlobal: changeData.allowGlobal,
            allowCustom: changeData.allowCustom,
            selected: selectedColors,
          };
        } else if (prop.type === BCMSPropType.RICH_TEXT) {
          if (change.add.defaultData) {
            prop.defaultData = [];
            const defaultData = change.add
              .defaultData as BCMSPropRichTextData[];
            for (let j = 0; j < defaultData.length; j++) {
              const data = defaultData[j];
              if (data.nodes) {
                (prop.defaultData as BCMSPropRichTextData[]).push(data);
              }
            }
          }
        }
        props.push(prop);
      } else if (typeof change.update === 'object') {
        const update = change.update as BCMSPropChangeUpdate;
        const propToUpdateIndex = props.findIndex((e) => e.id === update.id);
        if (
          (inTemplate && propToUpdateIndex > 1) ||
          (!inTemplate && propToUpdateIndex !== -1)
        ) {
          const propBuffer = props[propToUpdateIndex];
          if (propBuffer.label !== update.label) {
            const newName = stringUtil.toSlugUnderscore(update.label);
            if (props.find((e) => e.name === newName)) {
              return Error(
                `[${level}] -> Prop with name "${newName}" already exists.`,
              );
            }
            propBuffer.label = update.label;
            propBuffer.name = newName;
          }
          propBuffer.required = update.required;
          if (update.enumItems) {
            (propBuffer.defaultData as BCMSPropEnumData).items =
              update.enumItems;
          }
          if (update.colorData) {
            const selectedColors = update.colorData.selected;
            if (!selectedColors) {
              return Error(`[${level}] ->` + ` Missing prop "selected".`);
            }
            (propBuffer.defaultData as BCMSPropColorPickerData) = {
              allowCustom: update.colorData.allowCustom,
              allowGlobal: update.colorData.allowGlobal,
              selected: selectedColors,
            };
          }
          if (update.move) {
            if (update.move > 0 && propToUpdateIndex < props.length - 1) {
              const temp = JSON.parse(
                JSON.stringify(props[propToUpdateIndex + 1]),
              );
              props[propToUpdateIndex + 1] = propBuffer;
              props[propToUpdateIndex] = temp;
            } else if (update.move < 0 && propToUpdateIndex > 0) {
              if (propToUpdateIndex < 3) {
                if ((inTemplate && props[0].name !== 'title') || !inTemplate) {
                  const temp = JSON.parse(
                    JSON.stringify(props[propToUpdateIndex - 1]),
                  );
                  props[propToUpdateIndex - 1] = propBuffer;
                  props[propToUpdateIndex] = temp;
                }
              } else {
                const temp = JSON.parse(
                  JSON.stringify(props[propToUpdateIndex - 1]),
                );
                props[propToUpdateIndex - 1] = propBuffer;
                props[propToUpdateIndex] = temp;
              }
            }
          } else {
            props[propToUpdateIndex] = propBuffer;
          }
          if (update.entryPointer) {
            const check = objectUtil.compareWithSchema(
              {
                entryPointer: update.entryPointer,
              },
              {
                entryPointer: {
                  __type: 'array',
                  __required: true,
                  __child: {
                    __type: 'object',
                    __content: BCMSPropEntryPointerDataSchema,
                  },
                },
              },
            );
            if (check instanceof ObjectUtilityError) {
              return Error(`[${level}] -> ${check.message}`);
            }
            propBuffer.defaultData = update.entryPointer;
          }
          if (typeof update.array === 'boolean') {
            if (propBuffer.type !== BCMSPropType.ENUMERATION) {
              propBuffer.array = update.array;
            }
          }
        }
      } else if (typeof change.transform === 'object') {
        const transform = change.transform as BCMSPropChangeTransform;
        const propIndex = props.findIndex((p) => p.id === transform.from);
        const prop = props[propIndex];
        const wantedPropType = transform.to;
        if (!prop) {
          throw Error(`(${level}.transform.from) --> Invalid ID.`);
        }
        if (wantedPropType === BCMSPropType.STRING) {
          if (
            prop.type === BCMSPropType.NUMBER ||
            prop.type === BCMSPropType.BOOLEAN
          ) {
            prop.type = BCMSPropType.STRING;
            prop.defaultData = (
              prop.defaultData as Array<number | boolean>
            ).map((e) => `${e}`);
          } else if (prop.type === BCMSPropType.DATE) {
            prop.type = BCMSPropType.STRING;
            prop.defaultData = (prop.defaultData as number[]).map((e) =>
              new Date(e).toUTCString(),
            );
          } else if (prop.type === BCMSPropType.ENUMERATION) {
            const selectEnum = (prop.defaultData as BCMSPropEnumData).selected;
            if (selectEnum) {
              prop.type = BCMSPropType.STRING;
              prop.defaultData = [`${selectEnum}`];
            }
          } else if (prop.type === BCMSPropType.MEDIA) {
            const mediaPaths: string[] = [];
            const currentDefaultData = prop.defaultData as BCMSPropMediaData[];
            for (let j = 0; j < currentDefaultData.length; j++) {
              const mediaId = currentDefaultData[j];
              const media = await BCMSRepo.media.findById(mediaId);
              if (media) {
                mediaPaths.push(`${await BCMSMediaService.getPath(media)}`);
              }
            }
            prop.type = BCMSPropType.STRING;
            prop.defaultData = mediaPaths;
          } else if (prop.type === BCMSPropType.RICH_TEXT) {
            const rich_texts = prop.defaultData as BCMSPropRichTextData[];
            const text: string[] = [];
            for (let j = 0; j < rich_texts.length; j++) {
              const textIndex = text.push('') - 1;
              const nodes = rich_texts[j].nodes;
              for (let k = 0; k < nodes.length; k++) {
                const node = nodes[k];
                text[textIndex] += nodeToText(node);
              }
            }
            prop.type = BCMSPropType.STRING;
            prop.defaultData = text;
          } else {
            return Error(`Default data can not be converted to another prop`);
          }
        } else if (wantedPropType === BCMSPropType.NUMBER) {
          if (
            prop.type === BCMSPropType.STRING ||
            prop.type === BCMSPropType.BOOLEAN
          ) {
            const currentDefaultData = prop.defaultData as Array<
              string | boolean
            >;
            const newDefaultData: number[] = [];
            for (let j = 0; j < currentDefaultData.length; j++) {
              const item = currentDefaultData[j];
              let data = Number(item);
              if (isNaN(data)) {
                data = 0;
              }
              newDefaultData.push(data);
            }
            prop.type = BCMSPropType.NUMBER;
            prop.defaultData = newDefaultData;
          } else {
            return Error(`Default data can not be converted to another prop`);
          }
        } else if (wantedPropType === BCMSPropType.BOOLEAN) {
          const boolean: boolean[] = [];
          if (prop.type === BCMSPropType.STRING) {
            const currentDefaultData = prop.defaultData as string[];
            for (let j = 0; j < currentDefaultData.length; j++) {
              const item = currentDefaultData[j];
              boolean.push(item.toLocaleLowerCase() === 'true' ? true : false);
            }
          } else if (prop.type === BCMSPropType.NUMBER) {
            const currentDefaultData = prop.defaultData as number[];
            for (let j = 0; j < currentDefaultData.length; j++) {
              const item = currentDefaultData[j];
              boolean.push(item > 0 ? true : false);
            }
          } else {
            return Error(`Default data can not be converted to another prop`);
          }
          prop.type = BCMSPropType.BOOLEAN;
          prop.defaultData = boolean;
        } else if (wantedPropType === BCMSPropType.DATE) {
          const dates: number[] = [];
          if (prop.type === BCMSPropType.STRING) {
            const currentDefaultData = prop.defaultData as string[];
            for (let j = 0; j < currentDefaultData.length; j++) {
              const item = currentDefaultData[j];
              let date = Date.parse(item);
              if (isNaN(date)) {
                date = 0;
              }
              dates.push(date);
            }
          } else {
            return Error(`Default data can not be converted to another prop`);
          }
          prop.type = BCMSPropType.DATE;
          prop.defaultData = dates;
        } else if (wantedPropType === BCMSPropType.RICH_TEXT) {
          const newDefaultData: BCMSPropRichTextData[] = [];
          if (prop.type === BCMSPropType.STRING) {
            const currentDefaultData = prop.defaultData as string[];
            for (let j = 0; j < currentDefaultData.length; j++) {
              const item = currentDefaultData[j];
              newDefaultData.push({
                nodes: [
                  {
                    type: BCMSEntryContentNodeType.paragraph,
                    content: [
                      {
                        type: BCMSEntryContentNodeType.text,
                        text: item,
                      },
                    ],
                  },
                ],
              });
            }
          } else {
            return Error(`Default data can not be converted to another prop`);
          }
          prop.type = BCMSPropType.RICH_TEXT;
          prop.defaultData = newDefaultData;
        }
      } else {
        return Error(`(${level}) --> changes[${i}] in of unknown type.`);
      }
    }
    return props;
  }

  static fixInvalidRustPropNames(name: string): string {
    return ['type', 'ref'].includes(name) ? `_${name}` : name;
  }

  static async parse({
    programLng,
    meta,
    values,
    level,
    depth,
    maxDepth,
    onlyLng,
  }: {
    programLng: 'rust' | 'js';
    meta: BCMSProp[];
    values: BCMSPropValue[];
    level?: string;
    depth?: number;
    maxDepth: number;
    onlyLng?: string;
  }): Promise<BCMSPropParsed> {
    if (!level) {
      level = 'props';
    }
    if (!depth) {
      depth = 0;
    }
    const parsed: BCMSPropParsed = {};
    for (let i = 0; i < meta.length; i++) {
      const prop = meta[i];
      const value = values.find((e) => e.id === prop.id);
      const propName =
        programLng === 'rust'
          ? this.fixInvalidRustPropNames(prop.name)
          : prop.name;
      if (value) {
        if (
          prop.type === BCMSPropType.STRING ||
          prop.type === BCMSPropType.NUMBER ||
          prop.type === BCMSPropType.BOOLEAN ||
          prop.type === BCMSPropType.DATE ||
          prop.type === BCMSPropType.TAG
        ) {
          if (prop.array) {
            parsed[propName] = value.data as string[];
          } else {
            parsed[propName] = (value.data as string[])[0];
          }
        } else if (prop.type === BCMSPropType.MEDIA) {
          const valueData = value.data as BCMSPropValueMediaData[];
          if (prop.array) {
            (parsed[propName] as BCMSPropMediaDataParsed[]) = [];
            for (let j = 0; j < valueData.length; j++) {
              const singleValueData = valueData[j];
              if (typeof singleValueData === 'object') {
                const media = await BCMSRepo.media.findById(
                  singleValueData._id,
                );
                if (media) {
                  let svg =
                    media.mimetype === 'image/svg+xml'
                      ? (
                          await BCMSMediaService.storage.get({ media })
                        ).toString()
                      : undefined;
                  if (svg) {
                    svg =
                      '<svg' +
                      stringUtil.textBetween(svg, '<svg', '</svg>') +
                      '</svg>';
                  }
                  const mediaData: BCMSPropMediaDataParsed = {
                    src: await BCMSMediaService.getPath(media),
                    _id: singleValueData._id,
                    alt_text: singleValueData.alt_text || media.altText,
                    caption: singleValueData.caption || media.caption,
                    height: media.height,
                    width: media.width,
                    name: media.name,
                    type: media.type,
                    svg,
                  };
                  if (programLng === 'rust') {
                    (mediaData as any)._type = media.type;
                    (mediaData as any).type = undefined;
                  }
                  (parsed[propName] as BCMSPropMediaDataParsed[]).push(
                    mediaData,
                  );
                }
              }
            }
          } else {
            if (valueData[0]) {
              const media = await BCMSRepo.media.findById(valueData[0]._id);
              if (media) {
                let svg =
                  media.mimetype === 'image/svg+xml'
                    ? (await BCMSMediaService.storage.get({ media })).toString()
                    : undefined;
                if (svg) {
                  svg =
                    '<svg' +
                    stringUtil.textBetween(svg, '<svg', '</svg>') +
                    '</svg>';
                }
                const mediaData: BCMSPropMediaDataParsed = {
                  src: await BCMSMediaService.getPath(media),
                  _id: valueData[0]._id,
                  alt_text: valueData[0].alt_text || media.altText,
                  caption: valueData[0].caption || media.caption,
                  height: media.height,
                  width: media.width,
                  name: media.name,
                  type: media.type,
                  svg,
                };
                if (programLng === 'rust') {
                  (mediaData as any)._type = media.type;
                  (mediaData as any).type = undefined;
                }
                (parsed[propName] as BCMSPropMediaDataParsed) = mediaData;
              }
            }
          }
        } else if (prop.type === BCMSPropType.ENUMERATION) {
          (parsed[propName] as BCMSPropEnumData) = {
            items: (prop.defaultData as BCMSPropEnumData).items,
            selected: (value.data as string[])[0],
          };
        } else if (prop.type === BCMSPropType.COLOR_PICKER) {
          const valueData = value.data as BCMSPropValueColorPickerData;
          if (prop.array) {
            parsed[propName] = [];
            for (let j = 0; j < valueData.length; j++) {
              const color = await BCMSRepo.color.findById(valueData[j]);
              if (color) {
                (parsed[propName] as BCMSPropDataParsed[]).push(color.value);
              }
            }
          } else {
            const color = await BCMSRepo.color.findById(valueData[0]);
            if (color) {
              (parsed[propName] as BCMSPropDataParsed) = color.value;
            }
          }
        } else if (prop.type === BCMSPropType.WIDGET) {
          const data = prop.defaultData as BCMSPropWidgetData;
          const valueData = value.data as BCMSPropValueWidgetData;
          const widget = await BCMSRepo.widget.findById(data._id);
          if (widget) {
            if (prop.array) {
              parsed[propName] = [];
              for (let j = 0; j < valueData.props.length; j++) {
                const valueDataItem = valueData.props[j];
                (parsed[propName] as BCMSPropDataParsed[]).push(
                  await BCMSPropHandler.parse({
                    programLng,
                    maxDepth,
                    meta: widget.props,
                    values: [valueDataItem],
                    depth,
                    level: `${level}.${prop.name}.${j}`,
                    onlyLng,
                  }),
                );
              }
            } else {
              parsed[propName] = await BCMSPropHandler.parse({
                programLng,
                maxDepth,
                meta: widget.props,
                values: [valueData.props[0]],
                depth,
                level: `${level}.${prop.name}`,
                onlyLng,
              });
            }
          }
        } else if (prop.type === BCMSPropType.GROUP_POINTER) {
          const data = prop.defaultData as BCMSPropGroupPointerData;
          const valueData = value.data as BCMSPropValueGroupPointerData;
          const group = await BCMSRepo.group.findById(data._id);
          if (group) {
            if (prop.array) {
              parsed[propName] = [];
              for (let j = 0; j < valueData.items.length; j++) {
                const valueDataItem = valueData.items[j];
                (parsed[propName] as BCMSPropDataParsed[]).push(
                  await BCMSPropHandler.parse({
                    programLng,
                    maxDepth,
                    meta: group.props,
                    values: valueDataItem.props,
                    depth,
                    level: `${level}.${prop.name}.${j}`,
                    onlyLng,
                  }),
                );
              }
            } else {
              if (valueData.items[0] && valueData.items[0].props) {
                parsed[propName] = await BCMSPropHandler.parse({
                  programLng,
                  maxDepth,
                  meta: group.props,
                  values: valueData.items[0].props,
                  depth,
                  level: `${level}.${prop.name}`,
                  onlyLng,
                });
              }
            }
          }
        } else if (prop.type === BCMSPropType.ENTRY_POINTER) {
          const valueData = value.data as BCMSPropValueEntryPointer[];
          if (depth >= maxDepth) {
            const templateMap: {
              [tid: string]: string[];
            } = {};
            for (let j = 0; j < valueData.length; j++) {
              const valueInfo = valueData[j];
              if (!templateMap[valueInfo.tid]) {
                templateMap[valueInfo.tid] = [];
              }
              templateMap[valueInfo.tid].push(valueInfo.eid);
            }
            (parsed[propName] as BCMSPropEntryPointerData[]) = Object.keys(
              templateMap,
            ).map((tid) => {
              return {
                displayProp: 'title',
                templateId: tid,
                entryIds: templateMap[tid],
              };
            });
            if (!prop.array) {
              (parsed[propName] as BCMSPropEntryPointerData) = (
                parsed[propName] as BCMSPropEntryPointerData[]
              )[0];
            }
          } else {
            (parsed[propName] as BCMSPropEntryPointerDataParsed[]) = [];
            for (let j = 0; j < valueData.length; j++) {
              const valueInfo = valueData[j];
              const template = await BCMSRepo.template.findById(valueInfo.tid);
              if (template) {
                if (prop.array) {
                  const parsedProp: BCMSPropEntryPointerDataParsed = {
                    _id: '',
                    createdAt: -1,
                    updatedAt: -1,
                    cid: '',
                    templateId: '',
                    templateName: template.name,
                    userId: '',
                    meta: {},
                    content: {},
                  };
                  const entryId = valueInfo.eid;
                  const entry = await BCMSRepo.entry.findById(entryId);
                  if (entry) {
                    for (let k = 0; k < entry.meta.length; k++) {
                      const entryMeta = entry.meta[k];
                      const lng = await BCMSRepo.language.methods.findByCode(
                        entryMeta.lng,
                      );
                      if (lng && (!onlyLng || onlyLng === lng.code)) {
                        parsedProp.meta[lng.code] = await BCMSPropHandler.parse(
                          {
                            programLng,
                            maxDepth,
                            meta: template.props,
                            values: entryMeta.props,
                            depth: depth + 1,
                            level: `${level}.${prop.name}.${k}`,
                            onlyLng,
                          },
                        );
                        parsedProp._id = entry._id;
                        parsedProp.cid = entry.cid;
                        parsedProp.createdAt = entry.createdAt;
                        parsedProp.updatedAt = entry.updatedAt;
                        parsedProp.templateId = entry.templateId;
                        parsedProp.userId = entry.userId;
                        if (entry.status) {
                          const status = await BCMSRepo.status.findById(
                            entry.status,
                          );
                          if (status) {
                            parsedProp.status = status.name;
                          } else {
                            parsedProp.status = entry.status;
                          }
                        } else {
                          parsedProp.status = entry.status;
                        }

                        const entryParser = useBcmsEntryParser();
                        const entryContent = entry.content.find(
                          (e) => e.lng === lng.code,
                        );
                        if (entryContent) {
                          parsedProp.content[lng.code] =
                            await entryParser.parseContent({
                              programLng,
                              nodes: entryContent.nodes,
                              maxDepth,
                              depth: depth + 1,
                              justLng: onlyLng,
                              level: `${level}.content`,
                            });
                        }
                      }
                    }
                    (parsed[propName] as BCMSPropEntryPointerDataParsed[]).push(
                      parsedProp,
                    );
                  }
                } else {
                  const entry = await BCMSRepo.entry.findById(valueInfo.eid);
                  if (entry) {
                    const parsedProp: BCMSPropEntryPointerDataParsed = {
                      _id: '',
                      createdAt: -1,
                      updatedAt: -1,
                      cid: '',
                      templateId: '',
                      templateName: template.name,
                      userId: '',
                      meta: {},
                      content: {},
                    };
                    for (let k = 0; k < entry.meta.length; k++) {
                      const entryMeta = entry.meta[k];
                      const lng = await BCMSRepo.language.methods.findByCode(
                        entryMeta.lng,
                      );
                      if (lng && (!onlyLng || lng.code === onlyLng)) {
                        parsedProp.meta[lng.code] = await BCMSPropHandler.parse(
                          {
                            programLng,
                            maxDepth,
                            meta: template.props,
                            values: entryMeta.props,
                            depth: depth + 1,
                            level: `${level}.${prop.name}`,
                            onlyLng,
                          },
                        );
                        parsedProp.cid = entry.cid;
                        parsedProp._id = entry._id;
                        parsedProp.createdAt = entry.createdAt;
                        parsedProp.updatedAt = entry.updatedAt;
                        parsedProp.templateId = entry.templateId;
                        parsedProp.userId = entry.userId;
                        if (entry.status) {
                          const status = await BCMSRepo.status.findById(
                            entry.status,
                          );
                          if (status) {
                            parsedProp.status = status.name;
                          } else {
                            parsedProp.status = entry.status;
                          }
                        } else {
                          parsedProp.status = entry.status;
                        }
                        const entryParser = useBcmsEntryParser();
                        const entryContent = entry.content.find(
                          (e) => e.lng === lng.code,
                        );
                        if (entryContent) {
                          parsedProp.content[lng.code] =
                            await entryParser.parseContent({
                              programLng,
                              nodes: entryContent.nodes,
                              maxDepth,
                              depth,
                              justLng: lng.code,
                              level: `${level}.content`,
                            });
                          parsed[propName] = parsedProp;
                        }
                      }
                    }
                  }
                  break;
                }
              }
            }
          }
        } else if (prop.type === BCMSPropType.RICH_TEXT) {
          const data = prop.defaultData as BCMSPropRichTextData[];
          const valueData = value.data as BCMSPropValueRichTextData[];
          let items: BCMSPropValueRichTextData[] = [];
          if (valueData) {
            items = valueData;
          } else {
            items = data;
          }
          if (prop.array) {
            parsed[propName] = items.map((item) => {
              return item.nodes.map((node) => {
                return {
                  type: node.type,
                  attrs:
                    node.type === BCMSEntryContentNodeType.heading
                      ? {
                          level: (node.attrs as BCMSEntryContentNodeHeadingAttr)
                            .level,
                        }
                      : undefined,
                  value: BCMSContentUtility.nodeToHtml({ node }),
                };
              }) as BCMSEntryContentParsedItem[];
            });
          } else {
            parsed[propName] = items[0].nodes.map((node) => {
              return {
                type: node.type,
                attrs:
                  node.type === BCMSEntryContentNodeType.heading
                    ? {
                        level: (node.attrs as BCMSEntryContentNodeHeadingAttr)
                          .level,
                      }
                    : undefined,
                value: BCMSContentUtility.nodeToHtml({ node }),
              };
            });
          }
        }
      }
    }
    return parsed;
  }

  static async findEntryPointer(data: {
    entry: BCMSEntry;
  }): Promise<Array<{ eid: string; tid: string }>> {
    const target = data.entry;
    const output: Array<{ eid: string; tid: string }> = [];
    const entries = await BCMSRepo.entry.findAll();
    for (let e = 0; e < entries.length; e++) {
      const entry = entries[e];
      if (entry._id !== target._id) {
        const entryString = JSON.stringify(entry);
        if (entryString.includes(target._id)) {
          output.push({
            eid: entry._id,
            tid: entry.templateId,
          });
        }
      }
    }
    return output;
  }

  /**
   * Have in mind that this method has side effects.
   * All props pointing to specified group will be removed from
   * other groups, templates and widgets and updated in the
   * database.
   */
  static async removeGroupPointer({
    groupId,
  }: {
    groupId: string;
  }): Promise<void | Error[]> {
    function filterGroupPointer(data: { props: BCMSProp[] }) {
      return data.props.filter(
        (prop) =>
          !(
            prop.type === BCMSPropType.GROUP_POINTER &&
            (prop.defaultData as BCMSPropGroupPointerData)._id === groupId
          ),
      );
    }
    const errors: Error[] = [];
    const groups = await BCMSRepo.group.methods.findAllByPropGroupPointer(
      groupId,
    );
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      group.props = filterGroupPointer({
        props: group.props,
      });

      const updatedGroup = await BCMSRepo.group.update(group);
      if (!updatedGroup) {
        errors.push(Error(`Failed to update group "${group._id}"`));
      } else {
        await BCMSSocketManager.emit.group({
          groupId: group._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (groups.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('group');
    }
    const widgets = await BCMSRepo.widget.methods.findAllByPropGroupPointer(
      groupId,
    );
    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      widget.props = filterGroupPointer({
        props: widget.props,
      });
      const updatedWidget = await BCMSRepo.widget.update(widget);
      if (!updatedWidget) {
        errors.push(Error(`Failed to update widget "${widget._id}"`));
      } else {
        await BCMSSocketManager.emit.widget({
          widgetId: widget._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (widgets.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('widget');
    }
    const templates = await BCMSRepo.template.methods.findAllByPropGroupPointer(
      groupId,
    );
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      template.props = filterGroupPointer({
        props: template.props,
      });
      const updatedTemplate = await BCMSRepo.template.update(template);
      if (!updatedTemplate) {
        errors.push(Error(`Failed to update template "${template._id}"`));
      } else {
        await BCMSSocketManager.emit.template({
          templateId: template._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (templates.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('templates');
    }
    if (errors.length > 0) {
      return errors;
    }
  }

  /**
   * Have in mind that this method has side effects.
   * All props pointing to specified template will be removed from
   * other templates, groups and widgets and updated in the
   * database.
   */
  static async removeEntryPointer({
    templateId,
  }: {
    templateId: string;
  }): Promise<void | Error[]> {
    function filterGroupPointer(data: { props: BCMSProp[] }) {
      const removeProps: string[] = [];
      for (let i = 0; i < data.props.length; i++) {
        const prop = data.props[i];
        if (
          prop.type === BCMSPropType.ENTRY_POINTER &&
          (prop.defaultData as BCMSPropEntryPointerData[]).find(
            (e) => e.templateId === templateId,
          )
        ) {
          prop.defaultData = (
            prop.defaultData as BCMSPropEntryPointerData[]
          ).filter((e) => e.templateId !== templateId);
          if (prop.defaultData.length === 0) {
            removeProps.push(prop.id);
          }
        }
      }
      return data.props.filter((e) => !removeProps.includes(e.id));
      // return data.props.filter(
      //   (prop) =>
      //     !(
      //       prop.type === BCMSPropType.ENTRY_POINTER &&
      //       (prop.defaultData as BCMSPropEntryPointerData[]).find(
      //         (e) => e.templateId === templateId,
      //       )
      //     ),
      // );
    }
    const errors: Error[] = [];
    const groups = await BCMSRepo.group.methods.findAllByPropEntryPointer(
      templateId,
    );
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      group.props = filterGroupPointer({
        props: group.props,
      });
      const updatedGroup = await BCMSRepo.group.update(group);
      if (!updatedGroup) {
        errors.push(Error(`Failed to update group "${group._id}"`));
      } else {
        await BCMSSocketManager.emit.group({
          groupId: group._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (groups.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('group');
    }
    const widgets = await BCMSRepo.widget.methods.findAllByPropEntryPointer(
      templateId,
    );
    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      widget.props = filterGroupPointer({
        props: widget.props,
      });
      const updatedWidget = await BCMSRepo.widget.update(widget);
      if (!updatedWidget) {
        errors.push(Error(`Failed to update widget "${widget._id}"`));
      } else {
        await BCMSSocketManager.emit.widget({
          widgetId: widget._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (widgets.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('widget');
    }
    const templates = await BCMSRepo.template.methods.findAllByPropEntryPointer(
      templateId,
    );
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      template.props = filterGroupPointer({
        props: template.props,
      });
      const updatedTemplate = await BCMSRepo.template.update(template);
      if (!updatedTemplate) {
        errors.push(Error(`Failed to update template "${template._id}"`));
      } else {
        await BCMSSocketManager.emit.template({
          templateId: template._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (templates.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('templates');
    }
    if (errors.length > 0) {
      return errors;
    }
  }

  /**
   * Have in mind that this method has side effects.
   * All props pointing to specified tag will be removed from
   * other templates, groups and widgets and updated in the
   * database.
   */
  static async removeTag({
    tagId,
  }: {
    tagId: string;
  }): Promise<void | Error[]> {
    function filterTag(data: { props: BCMSProp[] }) {
      for (let i = 0; i < data.props.length; i++) {
        const prop = data.props[i];
        if (prop.type === BCMSPropType.TAG) {
          data.props[i].defaultData = (
            prop.defaultData as BCMSPropTagData
          ).filter((e) => e !== tagId);
        }
      }
      return data.props;
    }
    const errors: Error[] = [];
    const groups = await BCMSRepo.group.methods.findAllByPropTag(tagId);
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      group.props = filterTag({
        props: group.props,
      });
      const updatedGroup = await BCMSRepo.group.update(group);
      if (!updatedGroup) {
        errors.push(Error(`Failed to update group "${group._id}"`));
      } else {
        await BCMSSocketManager.emit.group({
          groupId: group._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (groups.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('group');
    }
    const widgets = await BCMSRepo.widget.methods.findAllByPropTag(tagId);
    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      widget.props = filterTag({
        props: widget.props,
      });
      const updatedWidget = await BCMSRepo.widget.update(widget);
      if (!updatedWidget) {
        errors.push(Error(`Failed to update widget "${widget._id}"`));
      } else {
        await BCMSSocketManager.emit.widget({
          widgetId: widget._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (widgets.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('widget');
    }
    const templates = await BCMSRepo.template.methods.findAllByPropTag(tagId);
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      template.props = filterTag({
        props: template.props,
      });
      const updatedTemplate = await BCMSRepo.template.update(template);
      if (!updatedTemplate) {
        errors.push(Error(`Failed to update template "${template._id}"`));
      } else {
        await BCMSSocketManager.emit.template({
          templateId: template._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (templates.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('templates');
    }
    if (errors.length > 0) {
      return errors;
    }
  }

  /**
   * Have in mind that this method has side effects.
   * All props pointing to specified media will be removed from
   * other templates, groups and widgets and updated in the
   * database.
   */
  static async removeMedia({
    mediaId,
  }: {
    mediaId: string;
  }): Promise<void | Error[]> {
    function filterMedia(data: { props: BCMSProp[] }) {
      for (let i = 0; i < data.props.length; i++) {
        const prop = data.props[i];
        if (prop.type === BCMSPropType.MEDIA) {
          data.props[i].defaultData = (
            prop.defaultData as BCMSPropMediaData[]
          ).filter((e) => e !== mediaId);
        }
      }
      return data.props;
    }

    const errors: Error[] = [];
    const groups = await BCMSRepo.group.methods.findAllByPropMedia(mediaId);
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      group.props = filterMedia({ props: group.props });
      const updatedGroup = await BCMSRepo.group.update(group);
      if (!updatedGroup) {
        errors.push(Error(`Failed to update group "${group._id}"`));
      } else {
        await BCMSSocketManager.emit.group({
          groupId: group._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (groups.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('group');
    }
    const widgets = await BCMSRepo.widget.methods.findAllByPropMedia(mediaId);
    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      widget.props = filterMedia({
        props: widget.props,
      });
      const updatedWidget = await BCMSRepo.widget.update(widget);
      if (!updatedWidget) {
        errors.push(Error(`Failed to update widget "${widget._id}"`));
      } else {
        await BCMSSocketManager.emit.widget({
          widgetId: widget._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (widgets.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('widget');
    }
    const templates = await BCMSRepo.template.methods.findAllByPropMedia(
      mediaId,
    );
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      template.props = filterMedia({
        props: template.props,
      });
      const updatedTemplate = await BCMSRepo.template.update(template);
      if (!updatedTemplate) {
        errors.push(Error(`Failed to update template "${template._id}"`));
      } else {
        await BCMSSocketManager.emit.template({
          templateId: template._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (templates.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('templates');
    }
  }

  /**
   * Have in mind that this method has side effects.
   * All props pointing to specified widget will be removed from
   * other templates, groups and widgets and updated in the
   * database.
   */
  static async removeWidget({
    widgetId,
  }: {
    widgetId: string;
  }): Promise<void | Error[]> {
    function filterWidget(data: { props: BCMSProp[] }) {
      return data.props.filter(
        (prop) =>
          !(
            prop.type === BCMSPropType.WIDGET &&
            (prop.defaultData as BCMSPropWidgetData)._id === widgetId
          ),
      );
    }
    const errors: Error[] = [];
    const groups = await BCMSRepo.group.methods.findAllByPropWidget(widgetId);
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      group.props = filterWidget({
        props: group.props,
      });
      const updatedGroup = await BCMSRepo.group.update(group);
      if (!updatedGroup) {
        errors.push(Error(`Failed to update group "${group._id}"`));
      } else {
        await BCMSSocketManager.emit.group({
          groupId: group._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (groups.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('group');
    }
    // TODO: check if this is required. Widget cannot have widget inside of it.
    const widgets = await BCMSRepo.widget.methods.findAllByPropWidget(widgetId);
    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      widget.props = filterWidget({
        props: widget.props,
      });
      const updatedWidget = await BCMSRepo.widget.update(widget);
      if (!updatedWidget) {
        errors.push(Error(`Failed to update widget "${widget._id}"`));
      } else {
        await BCMSSocketManager.emit.widget({
          widgetId: widget._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (widgets.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('widget');
    }
    const templates = await BCMSRepo.template.methods.findAllByPropWidget(
      widgetId,
    );
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      template.props = filterWidget({
        props: template.props,
      });
      const updatedTemplate = await BCMSRepo.template.update(template);
      if (!updatedTemplate) {
        errors.push(Error(`Failed to update template "${template._id}"`));
      } else {
        await BCMSSocketManager.emit.template({
          templateId: template._id,
          type: BCMSSocketEventType.UPDATE,
          userIds: 'all',
        });
      }
    }
    if (templates.length > 0) {
      await BCMSRepo.change.methods.updateAndIncByName('templates');
    }
    if (errors.length > 0) {
      return errors;
    }
  }
}

export function createBcmsPropHandler(): Module {
  return {
    name: 'Prop handler',
    initialize(moduleConfig) {
      objectUtil = useObjectUtility();
      stringUtil = useStringUtility();

      moduleConfig.next();
    },
  };
}

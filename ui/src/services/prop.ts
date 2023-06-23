import { v4 as uuidv4 } from 'uuid';
import type {
  BCMSGroup,
  BCMSPropEntryPointerData,
  BCMSPropEnumData,
  BCMSPropGroupPointerData,
  BCMSPropValueData,
  BCMSPropValueEntryPointer,
  BCMSPropValueGroupPointerData,
  BCMSPropValueMediaData,
  BCMSPropValueRichTextData,
} from '@becomes/cms-sdk/types';
import { BCMSPropType } from '@becomes/cms-sdk/types';
import type {
  BCMSPropService,
  BCMSPropValueExtended,
  BCMSPropValueExtendedColorPicker,
  BCMSPropValueExtendedGroupPointerData,
  BCMSPropValueExtendedRichTextData,
} from '../types';
import { patienceDiffMerge } from '../util';
import type { BCMSPropColorPickerData } from '@becomes/cms-sdk/types/models/prop/color-picker';

let service: BCMSPropService;

export function useBcmsPropService(): BCMSPropService {
  return service;
}

export function createBcmsPropService(): void {
  const checkerValidators: {
    [id: string]: () => boolean;
  } = {};
  service = {
    async toPropValueExtended({ prop, value, lang, groupRequired }) {
      const output: BCMSPropValueExtended = {
        id: prop.id,
        data: undefined as never,
        label: prop.label,
        required: prop.required,
        array: prop.array,
        type: prop.type,
      };
      if (
        prop.type === BCMSPropType.STRING ||
        prop.type === BCMSPropType.NUMBER ||
        prop.type === BCMSPropType.BOOLEAN ||
        prop.type === BCMSPropType.DATE
      ) {
        if (value && value.data) {
          const valueData = [...(value.data as string[])];
          output.data = valueData;
        } else {
          output.data = [...(prop.defaultData as string[])];
        }
      } else if (prop.type === BCMSPropType.MEDIA) {
        if (value && value.data) {
          if (
            !prop.array &&
            (value.data as BCMSPropValueMediaData[]).length === 0
          ) {
            output.data = [
              {
                _id: '',
                alt_text: '',
                caption: '',
              },
            ] as BCMSPropValueMediaData[];
          } else {
            output.data = window.bcms.util.object.instance(
              value.data as BCMSPropValueMediaData[]
            );
            output.data.forEach((item) => {
              if (!item.alt_text) {
                item.alt_text = '';
              }
              if (!item.caption) {
                item.caption = '';
              }
              if (!item._id) {
                item._id = '';
              }
            });
          }
        } else {
          output.data = [
            {
              _id: '',
              alt_text: '',
              caption: '',
            },
          ] as BCMSPropValueMediaData[];
        }
      } else if (prop.type === BCMSPropType.ENUMERATION) {
        const propData = prop.defaultData as BCMSPropEnumData;
        output.enumItems = propData.items;
        if (value && value.data) {
          const valueData = value.data as string[];
          output.data = valueData;
        } else {
          output.data = [propData.selected ? propData.selected : ''];
        }
      } else if (prop.type === BCMSPropType.ENTRY_POINTER) {
        const propData = window.bcms.util.object.instance(
          prop.defaultData as BCMSPropEntryPointerData[]
        );
        output.templateIds = propData.map((e) => e.templateId);
        if (value && value.data) {
          output.data = value.data as BCMSPropValueEntryPointer[];
        } else {
          output.data = [];
          for (let j = 0; j < propData.length; j++) {
            const propInfo = propData[j];
            output.templateIds.push(propInfo.templateId);
          }
        }
      } else if (prop.type === BCMSPropType.GROUP_POINTER) {
        const propData = window.bcms.util.object.instance(
          prop.defaultData as BCMSPropGroupPointerData
        );
        output.groupId = propData._id;
        let group: BCMSGroup;
        try {
          group = await window.bcms.sdk.group.get(propData._id);
        } catch (_error) {
          return null;
        }
        if (value && value.data) {
          const valueData = value.data as BCMSPropValueGroupPointerData;
          (output.data as BCMSPropValueGroupPointerData) = {
            _id: group._id,
            items: [],
          };
          for (let i = 0; i < valueData.items.length; i++) {
            const item = valueData.items[i];
            (output.data as BCMSPropValueExtendedGroupPointerData).items.push({
              id: uuidv4(),
              props: [],
            });
            for (let j = 0; j < group.props.length; j++) {
              const groupProp = group.props[j];
              const groupOutput = await service.toPropValueExtended({
                prop: groupProp,
                lang,
                value: item.props.find((e) => e.id === groupProp.id),
              });
              if (groupOutput) {
                (output.data as BCMSPropValueExtendedGroupPointerData).items[
                  i
                ].props.push(groupOutput);
              }
            }
          }
        } else {
          (output.data as BCMSPropValueExtendedGroupPointerData) = {
            _id: group._id,
            items: [],
          };
          if (output.required || groupRequired) {
            (output.data as BCMSPropValueExtendedGroupPointerData).items.push({
              id: uuidv4(),
              props: [],
            });
            for (let j = 0; j < group.props.length; j++) {
              const groupProp = group.props[j];
              const groupOutput = await service.toPropValueExtended({
                prop: groupProp,
                lang,
              });
              if (groupOutput) {
                (
                  output.data as BCMSPropValueExtendedGroupPointerData
                ).items[0].props.push(groupOutput);
              }
            }
          }
        }
      } else if (prop.type === BCMSPropType.RICH_TEXT) {
        const valueData =
          value && value.data
            ? (value.data as BCMSPropValueRichTextData[])
            : (prop.defaultData as BCMSPropValueRichTextData[]);
        const nodesExtended: BCMSPropValueExtendedRichTextData[] = [];
        if (valueData.length > 0) {
          for (let i = 0; i < valueData.length; i++) {
            const rtData = valueData[i];
            nodesExtended.push({
              id: uuidv4(),
              nodes: await window.bcms.entry.content.toExtendedNodes({
                contentNodes: rtData.nodes,
                lang,
              }),
            });
          }
        } else {
          nodesExtended.push({
            id: prop.id,
            nodes: [],
          });
        }
        output.data = nodesExtended;
      } else if (prop.type === BCMSPropType.COLOR_PICKER) {
        if (value && value.data) {
          const valueData = value.data as string[];
          output.data = {
            value: valueData,
            options: {
              allowCustom: (prop.defaultData as BCMSPropColorPickerData)
                .allowCustom,
              allowGlobal: (prop.defaultData as BCMSPropColorPickerData)
                .allowGlobal,
            },
          };
        } else {
          output.data = {
            value: [],
            options: {
              allowCustom: (prop.defaultData as BCMSPropColorPickerData)
                .allowCustom,
              allowGlobal: (prop.defaultData as BCMSPropColorPickerData)
                .allowGlobal,
            },
          };
        }
      }

      return output;
    },

    fromPropValueExtended({ extended }) {
      if (extended.type === BCMSPropType.GROUP_POINTER) {
        const extendedData =
          extended.data as BCMSPropValueExtendedGroupPointerData;
        const data: BCMSPropValueData = {
          _id: extendedData._id,
          items: extendedData.items.map((item) => {
            return {
              props: item.props.map((prop) => {
                return service.fromPropValueExtended({ extended: prop });
              }),
            };
          }),
        };
        return {
          id: extended.id,
          data,
        };
      } else if (extended.type === BCMSPropType.COLOR_PICKER) {
        const extendedData = extended.data as BCMSPropValueExtendedColorPicker;

        return {
          id: extended.id,
          data: extendedData.value,
        };
      } else {
        return {
          id: extended.id,
          data: extended.data as never,
        };
      }
    },

    checker: {
      register(validate) {
        const id = uuidv4();
        checkerValidators[id] = validate;
        return () => {
          delete checkerValidators[id];
        };
      },
      validate() {
        let isOk = true;
        for (const id in checkerValidators) {
          if (!checkerValidators[id]()) {
            isOk = false;
          }
        }
        return isOk;
      },
    },

    pathStrToArr(path) {
      const output: Array<string | number> = path.slice(3).split('.');
      for (let i = 0; i < output.length; i++) {
        const p = output[i];
        const num = parseInt(p as string);
        if (!isNaN(num)) {
          output[i] = num;
        }
      }
      return output;
    },

    getValueFromPath(obj, path) {
      if (path.length === 1) {
        return obj[path[0]];
      } else if (obj[path[0]]) {
        return service.getValueFromPath(obj[path[0]], path.slice(1));
      }
    },

    findLastDataPropFromPath(obj, path, data) {
      if (path.length === 0) {
        return data;
      } else if (obj[path[0]]) {
        if (path[0] === 'data') {
          data = obj[path[0]];
        }
        return service.findLastDataPropFromPath(
          obj[path[0]],
          path.slice(1),
          data
        );
      } else {
        return data;
      }
    },

    async findSchemaFromPath(obj, schemaHolder, path, schema) {
      if (typeof path[0] === 'number') {
        schema = schemaHolder[path[0]];
      }
      if (path.length === 1) {
        return schema;
      } else if (obj[path[0]]) {
        if (obj[path[0]]._id) {
          const group = await window.bcms.sdk.group.get(obj[path[0]]._id);
          if (group) {
            return await service.findSchemaFromPath(
              obj[path[0]],
              group.props,
              path.slice(1),
              schema
            );
          }
        } else {
          return await service.findSchemaFromPath(
            obj[path[0]],
            schemaHolder,
            path.slice(1),
            schema
          );
        }
      }
      return schema;
    },

    mutateValue: {
      any(obj, path, value) {
        if (path.length === 1) {
          obj[path[0]] = value;
        } else if (obj[path[0]]) {
          if (!obj[path[0]]) {
            obj[path[0]] = {};
          }
          service.mutateValue.any(obj[path[0]], path.slice(1), value);
        }
      },
      string(obj, path, diff) {
        if (path.length === 1) {
          obj[path[0]] = patienceDiffMerge(diff, obj[path[0]]);
        } else if (obj[path[0]]) {
          service.mutateValue.string(obj[path[0]], path.slice(1), diff);
        }
      },
      removeArrayItem(obj, path) {
        if (path.length === 1) {
          obj.splice(path[0], 1);
        } else if (obj[path[0]]) {
          if (!obj[path[0]]) {
            obj[path[0]] = {};
          }
          service.mutateValue.removeArrayItem(obj[path[0]], path.slice(1));
        }
      },

      reorderArrayItems(obj, path, info) {
        if (path.length === 0) {
          const value = window.bcms.util.object.instance(
            obj[info.currentItemPosition]
          );
          obj.splice(info.currentItemPosition, 1);
          obj.splice(info.currentItemPosition + info.direction, 0, value);
        } else if (obj[path[0]]) {
          if (!obj[path[0]]) {
            obj[path[0]] = {};
          }
          service.mutateValue.reorderArrayItems(
            obj[path[0]],
            path.slice(1),
            info
          );
        }
      },

      async addArrayItem(obj, baseSchema, path, lang) {
        const propSchema = window.bcms.util.object.instance(
          await window.bcms.prop.findSchemaFromPath(obj, baseSchema, path)
        );
        if (propSchema) {
          const value = window.bcms.util.object.instance(
            await window.bcms.prop.toPropValueExtended({
              prop: propSchema,
              lang,
              groupRequired: propSchema.type === BCMSPropType.GROUP_POINTER,
            })
          );
          if (value) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const propValue: any[] = window.bcms.prop.getValueFromPath(
              obj,
              path
            );
            if (propValue) {
              propValue.push(
                value.data instanceof Array
                  ? (value.data as string[])[0]
                  : (value.data as BCMSPropValueGroupPointerData).items[0]
              );
            }
          }
        }
      },
    },
  };
}

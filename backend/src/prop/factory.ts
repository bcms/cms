import { v4 as uuidv4 } from 'uuid';
import {
  BCMSPropFactory,
  BCMSPropType,
  BCMSPropDataGql,
  BCMSPropEnumData,
  BCMSPropGql,
  BCMSProp,
  BCMSPropRichTextData,
} from '../types';

function bcmsPropTypeToGqlType(type: BCMSPropType): string {
  switch (type) {
    case BCMSPropType.STRING: {
      return 'BCMSPropDataValueString';
    }
    case BCMSPropType.NUMBER: {
      return 'BCMSPropDataValueNumber';
    }
    case BCMSPropType.BOOLEAN: {
      return 'BCMSPropDataValueBoolean';
    }
    case BCMSPropType.RICH_TEXT: {
      return 'BCMSPropDataValueRichText';
    }
    case BCMSPropType.COLOR_PICKER: {
      return 'BCMSPropDataValueColorPicker';
    }
    case BCMSPropType.ENTRY_POINTER: {
      return 'BCMSPropDataValueEntryPointer';
    }
    case BCMSPropType.ENUMERATION: {
      return 'BCMSPropDataValueEnumeration';
    }
    case BCMSPropType.GROUP_POINTER: {
      return 'BCMSPropDataValueGroupPointer';
    }
    case BCMSPropType.WIDGET: {
      return 'BCMSPropDataValueWidget';
    }
    case BCMSPropType.DATE: {
      return 'BCMSPropDataValueDate';
    }
    case BCMSPropType.MEDIA: {
      return 'BCMSPropDataValueMedia';
    }
    case BCMSPropType.TAG: {
      return 'BCMSPropDataValueTag';
    }
    default: {
      return '';
    }
  }
}

export function createBcmsPropFactory(): BCMSPropFactory {
  const self: BCMSPropFactory = {
    create(type, array) {
      switch (type) {
        case BCMSPropType.STRING: {
          return self.string(array);
        }
        case BCMSPropType.NUMBER: {
          return self.number(array);
        }
        case BCMSPropType.BOOLEAN: {
          return self.bool(array);
        }
        case BCMSPropType.DATE: {
          return self.date();
        }
        case BCMSPropType.ENUMERATION: {
          return self.enum();
        }
        case BCMSPropType.MEDIA: {
          return self.media(array);
        }
        case BCMSPropType.GROUP_POINTER: {
          return self.groupPointer(array);
        }
        case BCMSPropType.ENTRY_POINTER: {
          return self.entryPointer(array);
        }
        case BCMSPropType.RICH_TEXT: {
          return self.richText(array);
        }
        case BCMSPropType.COLOR_PICKER: {
          return self.colorPicker(array);
        }
        case BCMSPropType.WIDGET: {
          return self.widget(array);
        }
        case BCMSPropType.TAG: {
          return self.tag(array);
        }
        default: {
          return null;
        }
        // default: {
        //   return self.richText(array);
        // }
      }
    },
    string(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.STRING,
        defaultData: [],
      };
    },
    number(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.NUMBER,
        defaultData: [],
      };
    },
    bool(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.BOOLEAN,
        defaultData: [],
      };
    },
    date(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.DATE,
        defaultData: [],
      };
    },
    enum(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.ENUMERATION,
        defaultData: {
          items: [],
        },
      };
    },
    media(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.MEDIA,
        defaultData: [],
      };
    },
    groupPointer(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.GROUP_POINTER,
        defaultData: {
          _id: '',
          items: [],
        },
      };
    },
    entryPointer(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.ENTRY_POINTER,
        defaultData: [],
      };
    },
    richText(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.RICH_TEXT,
        defaultData: [],
      };
    },
    colorPicker(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.COLOR_PICKER,
        defaultData: {
          allowCustom: false,
          selected: [],
          allowGlobal: true,
        },
      };
    },
    tag(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.TAG,
        defaultData: [],
      };
    },
    widget(array) {
      return {
        id: uuidv4(),
        name: '',
        label: '',
        array: array ? array : false,
        required: true,
        type: BCMSPropType.WIDGET,
        defaultData: [],
      };
    },
    toGql(_props) {
      let props: BCMSProp[] = [];
      let isArray = false;
      if (_props instanceof Array) {
        props = _props;
        isArray = true;
      } else {
        props = [_props];
      }
      const output: BCMSPropGql[] = [];
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        let defaultData: BCMSPropDataGql = {} as never;
        if (prop.type === BCMSPropType.STRING) {
          defaultData = {
            string: prop.defaultData as string[],
          };
        } else if (prop.type === BCMSPropType.NUMBER) {
          defaultData = {
            number: prop.defaultData as number[],
          };
        } else if (prop.type === BCMSPropType.BOOLEAN) {
          defaultData = {
            boolean: prop.defaultData as boolean[],
          };
        } else if (prop.type === BCMSPropType.RICH_TEXT) {
          defaultData = {
            richText: prop.defaultData as BCMSPropRichTextData[],
          };
        } else {
          defaultData = prop.defaultData as BCMSPropEnumData;
        }
        output.push({
          array: prop.array,
          id: prop.id,
          label: prop.label,
          name: prop.name,
          required: prop.required,
          type: prop.type,
          defaultData: {
            ...defaultData,
            __typename: bcmsPropTypeToGqlType(prop.type),
          },
        });
      }
      return isArray ? output : output[0];
    },
  };
  return self;
}

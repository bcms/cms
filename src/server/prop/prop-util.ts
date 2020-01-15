import {
  Prop,
  PropType,
  PropEnum,
  PropGroupPointer,
  PropQuill,
  PropQuillContent,
  PropQuillContentType,
  PropQuillContentValueGeneric,
  PropQuillContentValueWidget,
} from './interfaces/prop.interface';
import { StringUtility, Logger } from 'purple-cheetah';
import { GroupService } from '../group/group.service';
import { EntryContent, Entry } from '../entry/models/entry.model';

export class PropUtil {
  public static get changesSchema(): any {
    return {
      name: {
        __type: 'object',
        __required: true,
        __child: {
          old: {
            __type: 'string',
            __required: true,
          },
          new: {
            __type: 'string',
            __required: true,
          },
        },
      },
      required: {
        __type: 'boolean',
        __required: true,
      },
      remove: {
        __type: 'boolean',
        __required: false,
      },
      add: {
        __type: 'boolean',
        __required: false,
      },
    };
  }

  public static async getPropsFromUntrustedObject(
    object: any,
    groupService: GroupService,
  ): Promise<Prop[]> {
    const returnProps: Prop[] = [];
    const props = object;
    if (typeof props !== 'object' || !(props instanceof Array)) {
      throw new Error(`'body.props' is not an array.`);
    }
    for (const i in props) {
      const prop = props[i];
      const p: Prop = {
        name: '',
        required: false,
        type: undefined,
        value: undefined,
      };
      if (typeof prop.type === 'undefined') {
        throw new Error(`'body.prop[${i}].type' is undefined.`);
      }
      p.type = prop.type;
      if (typeof prop.name === 'undefined') {
        throw new Error(`'body.prop[${i}].name' is undefined.`);
      }
      p.name = prop.name;
      if (typeof prop.required === 'undefined') {
        throw new Error(`'body.prop[${i}].required' is undefined.`);
      }
      p.required = prop.required;
      switch (prop.type) {
        case PropType.BOOLEAN:
          {
            p.type = PropType[prop.type];
            if (typeof prop.value !== 'boolean') {
              throw new Error(
                `Invalid type of 'props[${i}].value'. ` +
                  `Expected 'boolean' but got '${typeof prop.value}'.`,
              );
            }
            p.value = prop.value;
          }
          break;
        case PropType.DATE:
          {
            p.type = PropType[prop.type];
            if (typeof prop.value !== 'number') {
              throw new Error(
                `Invalid type of 'props[${i}].value'. ` +
                  `Expected 'number' but got '${typeof prop.value}'.`,
              );
            }
            p.value = prop.value;
          }
          break;
        case PropType.NUMBER:
          {
            p.type = PropType[prop.type];
            if (typeof prop.value !== 'number') {
              throw new Error(
                `Invalid type of 'props[${i}].value'. ` +
                  `Expected 'number' but got '${typeof prop.value}'.`,
              );
            }
            p.value = prop.value;
          }
          break;
        case PropType.STRING:
          {
            p.type = PropType[prop.type];
            if (typeof prop.value !== 'string') {
              throw new Error(
                `Invalid type of 'props[${i}].value'. ` +
                  `Expected 'string' but got '${typeof prop.value}'.`,
              );
            }
            p.value = prop.value;
          }
          break;
        case PropType.GROUP_POINTER:
          {
            const verifiedProp = await this.untrustedGroupPointerObjectToProp(
              prop,
              groupService,
              `props[${i}]`,
            );
            p.type = PropType[verifiedProp.type];
            p.value = verifiedProp.value;
          }
          break;
        case PropType.ENUMERATION:
          {
            p.type = PropType[prop.type];
            if (typeof prop.value === 'undefined') {
              throw new Error(
                `'value' is undefined for prop type '${prop.type}' ` +
                  `in 'props[${i}]'.`,
              );
            }
            if (typeof prop.value !== 'object') {
              throw new Error(
                `Invalid type of 'props[${i}].value'. ` +
                  `Expected 'object' but got '${typeof prop.value}'.`,
              );
            }
            if (typeof prop.value.items === 'undefined') {
              throw new Error(
                `'items' is undefined for prop type '${prop.type}' ` +
                  `in 'props[${i}].value'.`,
              );
            }
            if (!(prop.value.items instanceof Array)) {
              throw new Error(
                `Invalid type of 'props[${i}].value.items'. ` +
                  `Expected 'array' but got '${typeof prop.value}'.`,
              );
            }
            if (prop.value.items.length === 0) {
              throw new Error(
                `Empty array was provided in 'props[${i}].value.items' ` +
                  `for type '${prop.type}'.`,
              );
            }
            for (const j in prop.value.items) {
              const item = prop.value.items[j];
              if (typeof item !== 'string') {
                throw new Error(
                  `Invalid type of 'props[${i}].value.items[${j}]'. ` +
                    `Expected 'string' but got '${typeof item}'.`,
                );
              }
            }
            const temp: PropEnum = {
              items: prop.value.items,
              selected: prop.value.selected,
            };
            p.value = temp;
          }
          break;
        case PropType.QUILL:
          {
            p.type = PropType[prop.type];
            if (typeof prop.value !== 'object') {
              throw new Error(
                `Invalid type of 'props[${i}].value'. ` +
                  `Expected 'object' but got '${typeof prop.value}'.`,
              );
            }
            // Check Heading
            {
              if (typeof prop.value.heading !== 'object') {
                throw new Error(
                  `Invalid type of 'props[${i}].value.heading'. ` +
                    `Expected 'object' but got '${typeof prop.value.heading}'.`,
                );
              }
              if (typeof prop.value.heading.title !== 'string') {
                throw new Error(
                  `Invalid type of 'props[${i}].value.heading.title'. ` +
                    `Expected 'string' but got '${typeof prop.value.heading
                      .title}'.`,
                );
              }
              if (typeof prop.value.heading.title !== 'string') {
                throw new Error(
                  `Invalid type of 'props[${i}].value.heading.slug'. ` +
                    `Expected 'string' but got '${typeof prop.value.heading
                      .slug}'.`,
                );
              }
              if (typeof prop.value.heading.desc !== 'string') {
                throw new Error(
                  `Invalid type of 'props[${i}].value.heading.desc'. ` +
                    `Expected 'string' but got '${typeof prop.value.heading
                      .desc}'.`,
                );
              }
              if (typeof prop.value.heading.coverImageUri !== 'string') {
                throw new Error(
                  `Invalid type of 'props[${i}].value.heading.coverImageUri'. ` +
                    `Expected 'string' but got '${typeof prop.value.heading
                      .coverImageUri}'.`,
                );
              }
            }
            // Check Content
            {
              if (typeof prop.value.content !== 'object') {
                throw new Error(
                  `Invalid type of 'props[${i}].value'. ` +
                    `Expected 'object' but got '${typeof prop.value.content}'.`,
                );
              }
              if (!(prop.value.content instanceof Array)) {
                throw new Error(
                  `Expected an array for 'props[${i}].value.content'`,
                );
              }
              for (const j in prop.value.content) {
                const content = prop.value.content[j];
                if (typeof content.id !== 'string') {
                  throw new Error(
                    `Invalid type of 'props[${i}].value.content[${j}].id'. ` +
                      `Expected 'string' but got '${typeof content.id}'.`,
                  );
                }
                if (typeof content.type !== 'string') {
                  throw new Error(
                    `Invalid type of 'props[${i}].value.content[${j}].type'. ` +
                      `Expected 'string' but got '${typeof content.type}'.`,
                  );
                }
                if (typeof content.valueAsText !== 'string') {
                  throw new Error(
                    `Invalid type of 'props[${i}].value.content[${j}].valueAsText'. ` +
                      `Expected 'string' but got '${typeof content.valueAsText}'.`,
                  );
                }
                if (content.type === 'MEDIA') {
                  if (typeof content.value !== 'string') {
                    throw new Error(
                      `Invalid type of 'props[${i}].value.content[${j}].value'. ` +
                        `Expected 'string' but got '${typeof content.value}'.`,
                    );
                  }
                } else {
                  if (typeof content.value !== 'object') {
                    throw new Error(
                      `Invalid type of 'props[${i}].value.content[${j}].value'. ` +
                        `Expected 'object' but got '${typeof content.value}'.`,
                    );
                  }
                }
                if (content.type !== 'MEDIA' && content.type !== 'WIDGET') {
                  if (!(content.value.ops instanceof Array)) {
                    throw new Error(
                      `Expected an array for 'props[${i}].value.content[${j}].value.ops'`,
                    );
                  }
                }
              }
            }
            p.value = prop.value;
          }
          break;

        case PropType.STRING_ARRAY:
          {
            p.type = PropType[prop.type];
            if (!(prop.value instanceof Array)) {
              throw new Error(
                `Invalid type of 'props[${i}].value'. ` + `Expected 'array'.`,
              );
            }
            if (prop.value.length > 0) {
              for (const j in prop.value) {
                if (typeof prop.value[j] !== 'string') {
                  throw new Error(
                    `Invalid type found in 'props[${i}].value[${j}]'. ` +
                      `Expected 'string' but got '${typeof prop.value[j]}'.`,
                  );
                }
              }
            }
            p.value = prop.value;
          }
          break;
        case PropType.NUMBER_ARRAY:
          {
            p.type = PropType[prop.type];
            if (!(prop.value instanceof Array)) {
              throw new Error(
                `Invalid type of 'props[${i}].value'. ` + `Expected 'array'.`,
              );
            }
            if (prop.value.length > 0) {
              for (const j in prop.value) {
                if (typeof prop.value[j] !== 'number') {
                  throw new Error(
                    `Invalid type found in 'props[${i}].value[${j}]'. ` +
                      `Expected 'number' but got '${typeof prop.value[j]}'.`,
                  );
                }
              }
            }
            p.value = prop.value;
          }
          break;
        case PropType.BOOLEAN_ARRAY:
          {
            p.type = PropType[prop.type];
            if (!(prop.value instanceof Array)) {
              throw new Error(
                `Invalid type of 'props[${i}].value'. ` + `Expected 'array'.`,
              );
            }
            if (prop.value.length > 0) {
              for (const j in prop.value) {
                if (typeof prop.value[j] !== 'boolean') {
                  throw new Error(
                    `Invalid type found in 'props[${i}].value[${j}]'. ` +
                      `Expected 'boolean' but got '${typeof prop.value[j]}'.`,
                  );
                }
              }
            }
            p.value = prop.value;
          }
          break;
        case PropType.GROUP_POINTER_ARRAY:
          {
            p.type = PropType[prop.type];
            if (typeof prop.value !== 'object') {
              throw new Error(
                `Invalid type found in 'props[${i}].value'. ` +
                  `Expected 'object' but got '${typeof prop.value}'.`,
              );
            }
            if (typeof prop.value._id !== 'string') {
              throw new Error(
                `Invalid type found in 'props[${i}].value._id'. ` +
                  `Expected 'string' but got '${typeof prop.value}'.`,
              );
            }
            if (!(prop.value.array instanceof Array)) {
              throw new Error(
                `Invalid type of 'props[${i}].value.array'. ` +
                  `Expected 'array'.`,
              );
            }
            const verifiedProp = await this.untrustedGroupPointerObjectToProp(
              prop,
              groupService,
              `props[${i}].value`,
            );
            verifiedProp.value = verifiedProp.value as PropGroupPointer;
            p.value = {
              _id: verifiedProp.value._id,
              props: verifiedProp.value.props,
              array: [],
            };
          }
          break;

        default: {
          throw new Error(
            `Unsupported value '${prop.type}' for 'body.prop[${i}].type'.`,
          );
        }
      }
      returnProps.push(p);
    }
    return returnProps;
  }

  private static async untrustedGroupPointerObjectToProp(
    prop,
    groupService,
    messagePrefix,
  ) {
    const p: Prop = {
      name: '',
      required: false,
      type: undefined,
      value: undefined,
    };
    p.type = PropType[prop.type];
    if (typeof prop.value === 'undefined') {
      throw new Error(
        `'value' is undefined for prop type '${prop.type}' ` +
          `in '${messagePrefix}'.`,
      );
    }
    if (typeof prop.value !== 'object') {
      throw new Error(
        `Invalid type of '${messagePrefix}.value'. ` +
          `Expected 'object' but got '${typeof prop.value}'.`,
      );
    }
    if (typeof prop.value._id === 'undefined') {
      throw new Error(
        `'_id' is undefined for prop type '${prop.type}' ` +
          `in '${messagePrefix}.value'.`,
      );
    }
    if (typeof prop.value._id !== 'string') {
      throw new Error(
        `Invalid type of '${messagePrefix}.value._id'. ` +
          `Expected 'string' but got '${typeof prop.value._id}'.`,
      );
    }
    if (typeof prop.value.props === 'undefined') {
      throw new Error(
        `'props' is undefined for prop type '${prop.type}' ` +
          `in '${messagePrefix}.value'.`,
      );
    }
    if (!(prop.value.props instanceof Array)) {
      throw new Error(
        `Invalid type of '${messagePrefix}.value.props'. ` +
          `Expected 'array'.`,
      );
    }
    if (StringUtility.isIdValid(prop.value._id) === false) {
      throw new Error(
        `Invalid ID '${prop.value._id}' value was provided for ` +
          `type '${prop.type}' in '${messagePrefix}.value._id'.`,
      );
    }
    const g = await groupService.findById(prop.value);
    if (g === null) {
      throw new Error(
        `Group with ID '${prop.value}' does not exist but was ` +
          `provided in '${messagePrefix}.value'.`,
      );
    }
    p.value = p.value as PropGroupPointer;
    p.value = {
      _id: prop.value._id,
      props: await PropUtil.getPropsFromUntrustedObject(
        prop.value.props,
        groupService,
      ),
    };
    return p;
  }

  public static compareWithTemplate(
    propsToCheck: Prop[],
    propsTemplate: Prop[],
    level?: string,
  ) {
    if (level) {
      level = 'root';
    }
    for (const i in propsTemplate) {
      const propTemplate = propsTemplate[i];
      const propToCheck = propsToCheck.find(e => e.name === propTemplate.name);
      if (!propToCheck) {
        if (propTemplate.required === true) {
          throw new Error(`Missing property '${level}.${propTemplate.name}'.`);
        }
      }
      if (propToCheck.type !== propTemplate.type) {
        throw new Error(
          `Type mismatch for '${level}.${propTemplate.name}'. ` +
            `Expected '${propTemplate.type}' but got '${propToCheck.type}'.`,
        );
      }
      if (propTemplate.type === PropType.GROUP_POINTER) {
        propToCheck.value = propToCheck.value as PropGroupPointer;
        propTemplate.value = propTemplate.value as PropGroupPointer;
        PropUtil.compareWithTemplate(
          propToCheck.value.props,
          propTemplate.value.props,
          `${level}.${propTemplate.name}`,
        );
      }
    }
  }

  public static propsToJSONObject(
    props: Prop[],
    init?: {
      _id?: string;
      createdAt?: number;
      updatedAt?: number;
      user?: {
        _id?: string;
        name?: string;
      };
    },
  ): any {
    let object: any = {};
    if (init) {
      object = init;
    }
    for (const i in props) {
      const prop = props[i];
      switch (prop.type) {
        case PropType.GROUP_POINTER:
          {
            prop.value = prop.value as PropGroupPointer;
            object[prop.name] = PropUtil.propsToJSONObject(prop.value.props);
          }
          break;
        case PropType.QUILL:
          {
            prop.value = prop.value as PropQuill;
            object.title = prop.value.heading.title;
            object.slug = prop.value.heading.slug;
            object.description = prop.value.heading.desc;
            object.coverImageUri = prop.value.heading.coverImageUri;
          }
          break;
        default: {
          object[prop.name] = prop.value;
        }
      }
    }
    return object;
  }

  public static propsToMarkdown(
    props: Prop[],
    init?: {
      _id?: string;
      createdAt?: number;
      updatedAt?: number;
      user?: {
        _id?: string;
        name?: string;
      };
    },
  ): {
    meta: any;
    content: Array<{
      type: string;
      name?: string;
      value: any;
    }>;
  } {
    const meta = PropUtil.propsToJSONObject(props, init);
    const content: Array<{
      type: string;
      name?: string;
      value: any;
    }> = [];
    const quillProp = props.find(e => e.type === PropType.QUILL);
    if (quillProp) {
      quillProp.value = quillProp.value as PropQuill;
      for (const i in quillProp.value.content) {
        let value: any;
        let name: string;
        const prop = quillProp.value.content[i] as PropQuillContent;
        switch (prop.type) {
          case PropQuillContentType.HEADING_1:
            {
              value = `## ${prop.valueAsText}\n`;
            }
            break;
          case PropQuillContentType.HEADING_2:
            {
              value = `### ${prop.valueAsText}\n`;
            }
            break;
          case PropQuillContentType.HEADING_3:
            {
              value = `#### ${prop.valueAsText}\n`;
            }
            break;
          case PropQuillContentType.HEADING_4:
            {
              value = `##### ${prop.valueAsText}\n`;
            }
            break;
          case PropQuillContentType.HEADING_5:
            {
              value = `###### ${prop.valueAsText}\n`;
            }
            break;
          case PropQuillContentType.CODE:
            {
              value = `\`\`\`\n${prop.valueAsText}\`\`\`\n\n`;
            }
            break;
          case PropQuillContentType.PARAGRAPH:
            {
              value = '';
              prop.value = prop.value as PropQuillContentValueGeneric;
              for (const j in prop.value.ops) {
                const op = prop.value.ops[j];
                let insert: string = '@';
                if (op.attributes) {
                  if (op.attributes.bold === true) {
                    insert = `**${insert}**`;
                  }
                  if (op.attributes.italic === true) {
                    insert = `*${insert}*`;
                  }
                  if (op.attributes.underline === true) {
                    insert = `<u>${insert}</u>`;
                  }
                  if (op.attributes.strike === true) {
                    insert = `~~${insert}~~`;
                  }
                }
                value += insert.replace('@', op.insert);
              }
              value += '\n';
            }
            break;
          case PropQuillContentType.LIST:
            {
              let listItem: string = '';
              value = '';
              prop.value = prop.value as PropQuillContentValueGeneric;
              for (const j in prop.value.ops) {
                const op = prop.value.ops[j];
                let insert: string = '@';
                if (op.attributes) {
                  if (op.attributes && op.attributes.list) {
                    let tabs: string = '';
                    if (op.attributes.indent) {
                      for (let k = 0; k < op.attributes.indent; k = k + 1) {
                        tabs += '  ';
                      }
                    }
                    value += `${tabs}- ${listItem}\n`;
                    listItem = '';
                  } else {
                    if (op.attributes.bold === true) {
                      insert = `**${insert}**`;
                    }
                    if (op.attributes.italic === true) {
                      insert = `*${insert}*`;
                    }
                    if (op.attributes.underline === true) {
                      insert = `<u>${insert}</u>`;
                    }
                    if (op.attributes.strike === true) {
                      insert = `~~${insert}~~`;
                    }
                    listItem += insert.replace('@', op.insert);
                  }
                } else {
                  listItem += insert.replace('@', op.insert);
                }
              }
              value += '\n';
            }
            break;
          case PropQuillContentType.WIDGET:
            {
              prop.value = prop.value as PropQuillContentValueWidget;
              name = prop.value.name;
              value = PropUtil.propsToJSONObject(prop.value.props);
            }
            break;
          case PropQuillContentType.MEDIA:
            {
              value = prop.value;
            }
            break;
        }
        content.push({
          type: prop.type,
          name,
          value,
        });
      }
    }
    return {
      meta,
      content,
    };
  }

  public static contentToMarkdown(
    entryContent: EntryContent[],
    init?: {
      _id?: string;
      createdAt?: number;
      updatedAt?: number;
      user?: {
        _id?: string;
        name?: string;
      };
    },
  ): any {
    const data: any = {};
    for (const i in entryContent) {
      const lngData = PropUtil.propsToMarkdown(entryContent[i].props, init);
      data[entryContent[i].lng] = {
        meta: lngData.meta,
        content: lngData.content,
      };
    }
    return data;
  }

  public static contentToPrettyJSON(
    entryContent: EntryContent[],
    init?: {
      _id?: string;
      createdAt?: number;
      updatedAt?: number;
      user?: {
        _id?: string;
        name?: string;
      };
    },
  ) {
    const data: any = {};
    for (const i in entryContent) {
      data[entryContent[i].lng] = JSON.parse(
        JSON.stringify(PropUtil.propsToMarkdown(entryContent[i].props, init)),
      );
    }
    return data;
  }

  public static updateGroupName(
    entries: Entry[],
    oldName: string,
    newName: string,
  ) {
    const recursive = (props: Prop[], on: string, nn: string) => {
      props.forEach(prop => {
        if (prop.type === PropType.GROUP_POINTER) {
          prop.value = prop.value as PropGroupPointer;
          if (prop.name === on) {
            prop.name = nn;
          } else {
            prop.value.props = recursive(prop.value.props, on, nn);
          }
        }
      });
      return props;
    };
    entries.forEach(entry => {
      entry.content.forEach(content => {
        content.props = recursive(content.props, oldName, newName);
      });
    });
  }
}

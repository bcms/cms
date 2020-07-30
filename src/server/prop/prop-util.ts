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
  PropGroupPointerArray,
  PropEntryPointer,
  PropEntryPointerArray,
} from './interfaces/prop.interface';
import { StringUtility, Logger, Service } from 'purple-cheetah';
import { GroupService } from '../group/group.service';
import { EntryContent, Entry } from '../entry/models/entry.model';
import { CacheControl } from '../cache-control';
import * as Turndown from 'turndown';

interface OP {
  insert: string;
  attributes?: {
    italic?: boolean;
    bold?: boolean;
    underline?: boolean;
    link?: string;
    list?: string;
    indent?: number;
  };
}

export class PropUtil {
  private static td = new Turndown();

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
        __type: 'object',
        __required: false,
        __child: {},
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
        case PropType.MEDIA:
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
        case PropType.ENTRY_POINTER:
          {
            p.type = PropType[prop.type];
            if (typeof prop.value !== 'object') {
              throw new Error(
                `Invalid type of 'props[${i}].value'. ` +
                  `Expected 'object' but got '${typeof prop.value}'.`,
              );
            }
            if (typeof prop.value.templateId !== 'string') {
              throw new Error(
                `Invalid type of 'props[${i}].value.templateId'. ` +
                  `Expected 'string' but got '${typeof prop.value
                    .templateId}'.`,
              );
            }
            if (typeof prop.value.entryId !== 'string') {
              throw new Error(
                `Invalid type of 'props[${i}].value.entryId'. ` +
                  `Expected 'string' but got '${typeof prop.value.entryId}'.`,
              );
            }
            if (typeof prop.value.displayProp !== 'string') {
              throw new Error(
                `Invalid type of 'props[${i}].value.displayProp'. ` +
                  `Expected 'string' but got '${typeof prop.value
                    .displayProp}'.`,
              );
            }
            p.value = prop.value;
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
                  `Error in Content. Invalid type of 'props[${i}].value.content'. ` +
                    `Expected 'object' but got '${typeof prop.value.content}'.`,
                );
              }
              if (!(prop.value.content instanceof Array)) {
                throw new Error(
                  `Error in Content. Expected an array for 'props[${i}].value.content'`,
                );
              }
              for (const j in prop.value.content) {
                const content = prop.value.content[j];
                let errorMsg = `Error in content at section ${content.type}. `;
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
                    errorMsg +
                      `Invalid type of 'props[${i}].value.content[${j}].valueAsText'. ` +
                      `Expected 'string' but got '${typeof content.valueAsText}'.`,
                  );
                }
                if (content.type === 'MEDIA') {
                  if (typeof content.value !== 'string') {
                    throw new Error(
                      errorMsg +
                        `Invalid type of 'props[${i}].value.content[${j}].value'. ` +
                        `Expected 'string' but got '${typeof content.value}'.`,
                    );
                  }
                } else {
                  if (typeof content.value !== 'object') {
                    throw new Error(
                      errorMsg +
                        `Invalid type of 'props[${i}].value.content[${j}].value'. ` +
                        `Expected 'object' but got '${typeof content.value}'.`,
                    );
                  }
                }
                if (content.type !== 'MEDIA' && content.type !== 'WIDGET') {
                  if (!(content.value.ops instanceof Array)) {
                    throw new Error(
                      errorMsg +
                        `Section is probably empty. ` +
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
            verifiedProp.value = verifiedProp.value as PropGroupPointerArray;
            p.value = {
              _id: verifiedProp.value._id,
              props: verifiedProp.value.props,
              array: prop.value.array,
            };
          }
          break;
        case PropType.ENTRY_POINTER_ARRAY:
          {
            p.type = PropType[prop.type];
            if (typeof prop.value !== 'object') {
              throw new Error(
                `Invalid type of 'props[${i}].value'. ` +
                  `Expected 'object' but got '${typeof prop.value}'.`,
              );
            }
            if (typeof prop.value.templateId !== 'string') {
              throw new Error(
                `Invalid type of 'props[${i}].value.templateId'. ` +
                  `Expected 'string' but got '${typeof prop.value
                    .templateId}'.`,
              );
            }
            if (typeof prop.value.entryIds !== 'object') {
              throw new Error(
                `Invalid type of 'props[${i}].value.entryIds'. ` +
                  `Expected 'object' but got '${typeof prop.value.entryIds}'.`,
              );
            }
            if (!(prop.value.entryIds instanceof Array)) {
              throw new Error(
                `Invalid type of 'props[${i}].value.entryIds'. ` +
                  `Expected an 'array'.`,
              );
            }
            if (typeof prop.value.displayProp !== 'string') {
              throw new Error(
                `Invalid type of 'props[${i}].value.displayProp'. ` +
                  `Expected 'string' but got '${typeof prop.value
                    .displayProp}'.`,
              );
            }
            p.value = prop.value;
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
      const propToCheck = propsToCheck.find(
        (e) => e.name === propTemplate.name,
      );
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

  public static async propsToJSONObject(
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
    lng?: string,
  ): Promise<any> {
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
            object[prop.name] = await PropUtil.propsToJSONObject(
              prop.value.props,
              undefined,
              lng,
            );
          }
          break;
        case PropType.GROUP_POINTER_ARRAY:
          {
            prop.value = prop.value as PropGroupPointerArray;
            object[prop.name] = [];
            for (const j in (prop.value as PropGroupPointerArray).array) {
              const arr = (prop.value as PropGroupPointerArray).array[j];
              object[prop.name].push(
                await PropUtil.propsToJSONObject(arr.value, undefined, lng),
              );
            }
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
        case PropType.ENTRY_POINTER:
          {
            prop.value = prop.value as PropEntryPointer;
            const entry = await CacheControl.Entry.findById(prop.value.entryId);
            if (!entry || entry === null) {
              object[prop.name] = prop.value;
            } else {
              const entryContent = entry.content.find((e) => e.lng === lng);
              if (entryContent) {
                object[prop.name] = await PropUtil.propsToMarkdown(
                  entryContent.props,
                  undefined,
                  lng,
                );
              } else {
                object[prop.name] = prop.value;
              }
            }
          }
          break;
        case PropType.ENTRY_POINTER_ARRAY:
          {
            prop.value = prop.value as PropEntryPointerArray;
            object[prop.name] = [];
            for (const j in prop.value.entryIds) {
              const eid = prop.value.entryIds[j];
              const entry = await CacheControl.Entry.findById(eid);
              if (!entry || entry === null) {
                object[prop.name].push(prop.value);
              } else {
                const entryContent = entry.content.find((e) => e.lng === lng);
                if (entryContent) {
                  object[prop.name].push(
                    await PropUtil.propsToMarkdown(
                      entryContent.props,
                      undefined,
                      lng,
                    ),
                  );
                } else {
                  object[prop.name].push(prop.value);
                }
              }
            }
          }
          break;
        default: {
          object[prop.name] = prop.value;
        }
      }
    }
    return object;
  }

  public static async propsToMarkdown(
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
    lng?: string,
  ): Promise<{
    meta: any;
    content: {
      type: string;
      name?: string;
      value: any;
    }[];
  }> {
    const meta = await PropUtil.propsToJSONObject(props, init, lng);
    let content: {
      type: string;
      name?: string;
      value: any;
    }[] = [];
    const quillProp = props.find((e) => e.type === PropType.QUILL);
    if (quillProp) {
      quillProp.value = quillProp.value as PropQuill;
      content = await this.contentCompiler(quillProp.value.content, lng);
      // for (const i in quillProp.value.content) {
      //   let value: any;
      //   let name: string;
      //   const prop = quillProp.value.content[i] as PropQuillContent;
      //   switch (prop.type) {
      //     case PropQuillContentType.HEADING_1:
      //       {
      //         value = `## ${prop.valueAsText}\n`;
      //       }
      //       break;
      //     case PropQuillContentType.HEADING_2:
      //       {
      //         value = `### ${prop.valueAsText}\n`;
      //       }
      //       break;
      //     case PropQuillContentType.HEADING_3:
      //       {
      //         value = `#### ${prop.valueAsText}\n`;
      //       }
      //       break;
      //     case PropQuillContentType.HEADING_4:
      //       {
      //         value = `##### ${prop.valueAsText}\n`;
      //       }
      //       break;
      //     case PropQuillContentType.HEADING_5:
      //       {
      //         value = `###### ${prop.valueAsText}\n`;
      //       }
      //       break;
      //     case PropQuillContentType.CODE:
      //       {
      //         value = `\`\`\`\n${prop.valueAsText}\n\`\`\`\n\n`;
      //       }
      //       break;
      //     case PropQuillContentType.PARAGRAPH:
      //       {
      //         value = '';
      //         prop.value = prop.value as PropQuillContentValueGeneric;
      //         for (const j in prop.value.ops) {
      //           const op = prop.value.ops[j];
      //           let insert: string = '@';
      //           if (op.attributes) {
      //             if (insert.endsWith('\n')) {
      //               insert = insert.substring(0, insert.length - 1);
      //             }
      //             const spaceAt = {
      //               end:
      //                 typeof op.insert === 'string' && op.insert.endsWith(' '),
      //               start:
      //                 typeof op.insert === 'string' &&
      //                 op.insert.startsWith(' '),
      //             };
      //             if (op.attributes.bold === true) {
      //               insert = `${spaceAt.start ? ' ' : ''}**${insert}**${
      //                 spaceAt.end ? ' ' : ''
      //               }`;
      //             }
      //             if (op.attributes.italic === true) {
      //               insert = `${spaceAt.start ? ' ' : ''}*${insert}*${
      //                 spaceAt.end ? ' ' : ''
      //               }`;
      //             }
      //             if (op.attributes.underline === true) {
      //               insert = `<u>${insert}</u>`;
      //             }
      //             if (op.attributes.strike === true) {
      //               insert = `${spaceAt.start ? ' ' : ''}~~${insert}~~${
      //                 spaceAt.end ? ' ' : ''
      //               }`;
      //             }
      //             if (typeof op.attributes.link !== 'undefined') {
      //               insert = `${
      //                 spaceAt.start ? ' ' : ''
      //               }[${insert}](${op.attributes.link.trim()})${
      //                 spaceAt.end ? ' ' : ''
      //               }`;
      //             }
      //           }
      //           value += this.formatMarkdownInsert(
      //             insert.replace('@', op.insert),
      //           );
      //         }
      //         value += '\n';
      //       }
      //       break;
      //     case PropQuillContentType.LIST:
      //       {
      //         let listItem: string = '';
      //         value = '';
      //         prop.value = prop.value as PropQuillContentValueGeneric;
      //         for (const j in prop.value.ops) {
      //           const op = prop.value.ops[j];
      //           let insert: string = '@';
      //           if (op.attributes) {
      //             if (op.attributes.list) {
      //               let tabs: string = '';
      //               if (op.attributes.indent) {
      //                 for (let k = 0; k < op.attributes.indent; k = k + 1) {
      //                   tabs += '  ';
      //                 }
      //               }
      //               value += `${tabs}- ${listItem}\n`;
      //               listItem = '';
      //             } else {
      //               if (insert.endsWith('\n')) {
      //                 insert = insert.substring(0, insert.length - 1);
      //               }
      //               const spaceAt = {
      //                 end:
      //                   typeof op.insert === 'string' &&
      //                   op.insert.endsWith(' '),
      //                 start:
      //                   typeof op.insert === 'string' &&
      //                   op.insert.startsWith(' '),
      //               };
      //               if (op.attributes.bold === true) {
      //                 insert = `${spaceAt.start ? ' ' : ''}**${insert}**${
      //                   spaceAt.end ? ' ' : ''
      //                 }`;
      //               }
      //               if (op.attributes.italic === true) {
      //                 insert = `${spaceAt.start ? ' ' : ''}*${insert}*${
      //                   spaceAt.end ? ' ' : ''
      //                 }`;
      //               }
      //               if (op.attributes.underline === true) {
      //                 insert = `<u>${insert}</u>`;
      //               }
      //               if (op.attributes.strike === true) {
      //                 insert = `${spaceAt.start ? ' ' : ''}~~${insert}~~${
      //                   spaceAt.end ? ' ' : ''
      //                 }`;
      //               }
      //               if (typeof op.attributes.link !== 'undefined') {
      //                 insert = `${
      //                   spaceAt.start ? ' ' : ''
      //                 }[${insert}](${op.attributes.link.trim()})${
      //                   spaceAt.end ? ' ' : ''
      //                 }`;
      //               }
      //               listItem += this.formatMarkdownInsert(
      //                 insert.replace('@', op.insert),
      //               );
      //             }
      //           } else {
      //             listItem += this.formatMarkdownInsert(
      //               insert.replace('@', op.insert),
      //             );
      //           }
      //         }
      //         value += '\n';
      //       }
      //       break;
      //     case PropQuillContentType.WIDGET:
      //       {
      //         prop.value = prop.value as PropQuillContentValueWidget;
      //         name = prop.value.name;
      //         value = await PropUtil.propsToJSONObject(
      //           prop.value.props,
      //           undefined,
      //           lng,
      //         );
      //       }
      //       break;
      //     case PropQuillContentType.MEDIA:
      //       {
      //         value = prop.value;
      //       }
      //       break;
      //   }
      //   content.push({
      //     type: prop.type,
      //     name,
      //     value,
      //     // typeof value === 'string'
      //     //   ? Buffer.from(value, 'latin1').toString('utf8')
      //     //   : value,
      //   });
      // }
    }
    return {
      meta,
      content,
    };
  }

  public static formatMarkdownInsert(insert) {
    const checks = {
      end: [
        {
          from: ' **',
          to: '** ',
        },
        {
          from: ' *',
          to: '* ',
        },
        {
          from: ' ~~',
          to: '~~ ',
        },
        {
          from: ' **',
          to: '** ',
        },
        {
          from: ' *',
          to: '* ',
        },
        {
          from: ' ~~',
          to: '~~ ',
        },
      ],
      start: [
        {
          from: '** ',
          to: ' **',
        },
        {
          from: '* ',
          to: ' *',
        },
        {
          from: '~~ ',
          to: ' ~~',
        },
        {
          from: '** ',
          to: ' **',
        },
        {
          from: '* ',
          to: ' *',
        },
        {
          from: '~~ ',
          to: ' ~~',
        },
      ],
    };
    for (const k in checks.end) {
      if (insert.endsWith(checks.end[k].from) === true) {
        insert = insert.replace(checks.end[k].from, checks.end[k].to);
      }
    }
    for (const k in checks.start) {
      if (insert.startsWith(checks.start[k].from) === true) {
        insert = insert.replace(checks.start[k].from, checks.start[k].to);
      }
    }
    return insert;
  }

  public static async contentToMarkdown(
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
  ): Promise<any> {
    const data: any = {};
    for (const i in entryContent) {
      const lngData = await PropUtil.propsToMarkdown(
        entryContent[i].props,
        init,
        entryContent[i].lng,
      );
      data[entryContent[i].lng] = {
        meta: lngData.meta,
        content: lngData.content,
      };
    }
    return data;
  }

  public static async contentToPrettyJSON(
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
        JSON.stringify(
          await PropUtil.propsToMarkdown(
            entryContent[i].props,
            init,
            entryContent[i].lng,
          ),
        ),
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
      props.forEach((prop) => {
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
    entries.forEach((entry) => {
      entry.content.forEach((content) => {
        content.props = recursive(content.props, oldName, newName);
      });
    });
  }

  public static async contentCompiler(
    props: PropQuillContent[],
    lng: string,
    toMarkdown?: boolean,
  ): Promise<
    {
      type: string;
      name?: string;
      value: any;
    }[]
  > {
    const content: {
      type: string;
      name: string;
      value: any;
    }[] = [];
    for (const i in props) {
      const prop = props[i];
      let value: any = '';
      let name: string;
      switch (prop.type) {
        case PropQuillContentType.HEADING_1:
          {
            value += `<h2>${
              prop.valueAsText.endsWith('\n')
                ? prop.valueAsText.substring(0, prop.valueAsText.length - 1)
                : prop.valueAsText
            }</h2>`;
          }
          break;
        case PropQuillContentType.HEADING_2:
          {
            value += `<h3>${
              prop.valueAsText.endsWith('\n')
                ? prop.valueAsText.substring(0, prop.valueAsText.length - 1)
                : prop.valueAsText
            }</h3>`;
          }
          break;
        case PropQuillContentType.HEADING_3:
          {
            value += `<h4>${
              prop.valueAsText.endsWith('\n')
                ? prop.valueAsText.substring(0, prop.valueAsText.length - 1)
                : prop.valueAsText
            }</h4>`;
          }
          break;
        case PropQuillContentType.HEADING_4:
          {
            value += `<h5>${
              prop.valueAsText.endsWith('\n')
                ? prop.valueAsText.substring(0, prop.valueAsText.length - 1)
                : prop.valueAsText
            }</h5>`;
          }
          break;
        case PropQuillContentType.HEADING_5:
          {
            value += `<h6>${
              prop.valueAsText.endsWith('\n')
                ? prop.valueAsText.substring(0, prop.valueAsText.length - 1)
                : prop.valueAsText
            }</h6>`;
          }
          break;
        case PropQuillContentType.CODE:
          {
            value += `<pre><code>${
              prop.valueAsText.endsWith('\n')
                ? prop.valueAsText.substring(0, prop.valueAsText.length - 1)
                : prop.valueAsText
            }</code></pre>`;
          }
          break;
        case PropQuillContentType.PARAGRAPH:
          {
            value += `<p>${this.opsToValue(
              (prop.value as PropQuillContentValueGeneric).ops,
            )}</p>`;
          }
          break;
        case PropQuillContentType.LIST:
          {
            value += `<ul>${this.opsListToValue(
              (prop.value as PropQuillContentValueGeneric).ops,
              true,
            )}</ul>`;
          }
          break;
        case PropQuillContentType.WIDGET:
          {
            prop.value = prop.value as PropQuillContentValueWidget;
            name = prop.value.name;
            value = await PropUtil.propsToJSONObject(
              prop.value.props,
              undefined,
              lng,
            );
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
        value: toMarkdown === true ? this.td.turndown(value) : value,
      });
    }
    return content;
  }

  public static opsToValue(ops: OP[], isList?: boolean): string {
    const checker = {
      link: false,
      bold: false,
      italic: false,
      underline: false,
      list: {
        in: false,
        level: 0,
      },
    };
    let value = '';
    let opPointer = 0;
    while (opPointer < ops.length) {
      const op: {
        insert: string;
        attributes?: {
          italic?: boolean;
          bold?: boolean;
          underline?: boolean;
          link?: string;
          list?: string;
          indent?: number;
        };
      } = ops[opPointer];
      if (!op.attributes) {
        if (checker.link === true) {
          checker.link = false;
          value += '</a>';
        }
        if (checker.underline === true) {
          checker.underline = false;
          value += '</u>';
        }
        if (checker.italic === true) {
          checker.italic = false;
          value += '</i>';
        }
        if (checker.bold === true) {
          checker.bold = false;
          value += '</strong>';
        }
        if (checker.list.in === true) {
          checker.list.in = false;
          value += '</ul>';
          for (let k = 0; k < checker.list.level; k = k + 1) {
            value += '</ul>';
          }
          checker.list.level = 0;
        }
      } else {
        if (op.attributes.bold) {
          if (checker.bold === false) {
            checker.bold = true;
            value += '<strong>';
          }
        } else {
          if (checker.bold === true) {
            checker.bold = false;
            value += '</strong>';
          }
        }
        if (op.attributes.italic) {
          if (checker.italic === false) {
            checker.italic = true;
            value += '<i>';
          }
        } else {
          if (checker.italic === true) {
            checker.italic = false;
            value += '</i>';
          }
        }
        if (op.attributes.underline) {
          if (checker.underline === false) {
            checker.underline = true;
            value += '<u>';
          }
        } else {
          if (checker.underline === true) {
            checker.underline = false;
            value += '</u>';
          }
        }
        if (op.attributes.link) {
          if (checker.link === false) {
            checker.link = true;
            value += `<a href="${op.attributes.link}">`;
          }
        } else {
          if (checker.link === true) {
            checker.link = false;
            value += '</a>';
          }
        }
      }
      if (op.insert.endsWith('\n')) {
        value += op.insert.substring(0, op.insert.length - 1);
      } else {
        value += op.insert;
      }
      opPointer = opPointer + 1;
    }
    if (checker.bold === true) {
      checker.bold = false;
      value += '</strong>';
    }
    if (checker.italic === true) {
      checker.italic = false;
      value += '</i>';
    }
    if (checker.underline === true) {
      checker.underline = false;
      value += '</u>';
    }
    if (checker.link === true) {
      checker.link = false;
      value += '</a>';
    }
    return value;
  }

  public static opsListToValue(ops: OP[], unordered?: boolean): string {
    const topLevelTag = unordered === true ? 'ul' : 'ol';
    let value = '';
    let opPointer = 0;
    const checker = {
      atIndent: 0,
    };
    while (opPointer < ops.length) {
      const opsChunk: OP[] = [];
      while (true) {
        if (opPointer > ops.length - 1) {
          break;
        }
        const op = ops[opPointer];
        if (op.attributes && op.attributes.list) {
          if (op.attributes.indent) {
            if (op.attributes.indent > checker.atIndent) {
              checker.atIndent = op.attributes.indent;
              value += `<li><${topLevelTag}>`;
            }
          } else {
            if (checker.atIndent !== 0) {
              for (let i = 0; i < checker.atIndent; i = i + 1) {
                value += `</${topLevelTag}></li>`;
              }
              checker.atIndent = 0;
            }
          }
          value += '<li>' + this.opsToValue(opsChunk) + '</li>';
          if (op.attributes.indent) {
            if (op.attributes.indent - 1 === checker.atIndent) {
              checker.atIndent = op.attributes.indent;
              value += `</${topLevelTag}></li>`;
            } else {
              for (
                let i = op.attributes.indent;
                i < checker.atIndent;
                i = i + 1
              ) {
                value += `</${topLevelTag}></li>`;
              }
              checker.atIndent = op.attributes.indent;
            }
          } else {
            for (let i = 0; i < checker.atIndent; i = i + 1) {
              value += `</${topLevelTag}></li>`;
            }
            checker.atIndent = 0;
          }
          opPointer = opPointer + 1;
          break;
        } else {
          opsChunk.push(op);
          opPointer = opPointer + 1;
        }
      }
    }
    if (checker.atIndent !== 0) {
      for (let i = 0; i < checker.atIndent; i = i + 1) {
        value += `</${topLevelTag}></li>`;
      }
      checker.atIndent = 0;
    }
    return value.replace(/<\/li><li><ul>/g, '<ul>');
  }
}

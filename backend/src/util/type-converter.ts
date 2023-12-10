import {
  BCMSEntryContentNodeType,
  BCMSMediaType,
  BCMSProp,
  BCMSPropEntryPointerData,
  BCMSPropEnumData,
  BCMSPropGroupPointerData,
  BCMSPropType,
  BCMSTypeConverterResultItem,
  BCMSTypeConverterTarget,
} from '@backend/types';
import { BCMSRepo } from '@backend/repo';

interface BCMSTypeConverterPropsResult {
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    array: boolean;
  }>;
  additional: string[];
  imports: BCMSImports;
}

interface ImportMetadata {
  name: string;
  type: 'entry' | 'group' | 'widget' | 'enum';
  props?: BCMSProp[];
  enumItems?: string[];
}

class BCMSImports {
  state: {
    [path: string]: {
      [name: string]: {
        metadata?: ImportMetadata;
      };
    };
  } = {};
  set(name: string, path: string, metadata?: ImportMetadata) {
    if (!this.state[path]) {
      this.state[path] = {};
    }
    this.state[path][name] = {
      metadata,
    };
  }
  addMetadata(name: string, path: string, metadata: ImportMetadata) {
    this.state[path][name].metadata = metadata;
  }
  fromImports(imports: BCMSImports) {
    for (const path in imports.state) {
      for (const name in imports.state[path]) {
        this.set(name, path, imports.state[path][name].metadata);
      }
    }
  }
  flatten(): string[] {
    const output: string[] = [];
    for (const path in this.state) {
      const names = Object.keys(this.state[path]);
      output.push(
        `import type { ${
          names.length > 1
            ? '\n' + names.map((e) => '  ' + e).join(',\n') + '\n'
            : names[0]
        }} from '${path}';`,
      );
    }
    return output;
  }
  flattenForJSDoc(): string[] {
    const output: string[] = [];
    for (const path in this.state) {
      const names = Object.keys(this.state[path]);
      names.map((e) => {
        output.push(` *  @typedef { import('${path}').${e} } ${e}`);
      });
    }
    return output;
  }
  flattenRust(): string[] {
    const output: string[] = [];
    for (const path in this.state) {
      const names = Object.keys(this.state[path]);
      output.push(names.map((name) => `use crate::bcms::${name}`).join('\n'));
    }
    return output;
  }
}

export class BCMSTypeConverter {
  static async bcmsPropTypeToConvertType(
    prop: BCMSProp,
    conversionType?: 'js' | 'gql' | 'rust',
  ): Promise<{ type: string; imports: BCMSImports; additional: string[] }> {
    const cType = conversionType ? conversionType : 'js';
    let output = '';
    const imports = new BCMSImports();
    const additional: string[] = [];
    if (
      prop.type === BCMSPropType.BOOLEAN ||
      prop.type === BCMSPropType.STRING ||
      prop.type === BCMSPropType.NUMBER
    ) {
      if (cType === 'rust') {
        if (prop.type === BCMSPropType.BOOLEAN) {
          output = 'bool';
        } else if (prop.type === BCMSPropType.STRING) {
          output = 'String';
        } else if (prop.type === BCMSPropType.NUMBER) {
          output = 'f64';
        }
      } else {
        output =
          cType === 'js'
            ? prop.type.toLowerCase()
            : toCamelCase(prop.type.toLowerCase());
      }
    } else if (prop.type === BCMSPropType.COLOR_PICKER) {
      output =
        cType === 'rust' ? 'String' : cType === 'gql' ? 'String' : 'string';
    } else if (prop.type === BCMSPropType.DATE) {
      output = cType === 'rust' ? 'f64' : cType === 'gql' ? 'Float' : 'number';
    } else if (prop.type === BCMSPropType.ENUMERATION) {
      const data = prop.defaultData as BCMSPropEnumData;
      const key =
        cType === 'rust'
          ? `r#enum::${prop.name}::${toCamelCase(prop.name) + 'EnumType'};`
          : toCamelCase(prop.name) + 'EnumType';
      output = toCamelCase(prop.name) + 'EnumType';
      const path = `../enum/${prop.name}`;
      imports.set(key, path);
      imports.addMetadata(key, path, {
        name: prop.name,
        type: 'enum',
        enumItems: data.items,
      });
    } else if (prop.type === BCMSPropType.GROUP_POINTER) {
      const data = prop.defaultData as BCMSPropGroupPointerData;
      const group = await BCMSRepo.group.findById(data._id);
      if (group) {
        output = toCamelCase(group.name) + 'Group';
        const path = `../group/${group.name}`;
        const key =
          cType === 'rust' ? `group::${group.name}::${output};` : output;
        imports.set(key, path);
        imports.addMetadata(key, path, {
          name: group.name,
          type: 'group',
          props: group.props,
        });
      }
    } else if (prop.type === BCMSPropType.MEDIA) {
      output = 'BCMSMediaParsed';
      if (cType === 'rust') {
        imports.set(`media::${output};`, '@becomes/cms-client/types');
      } else {
        imports.set(output, '@becomes/cms-client/types');
      }
    } else if (prop.type === BCMSPropType.RICH_TEXT) {
      output =
        cType === 'gql'
          ? '[BCMSEntryContentParsedItem!]'
          : cType === 'rust'
          ? 'Vec<BCMSEntryContentParsedItem>'
          : 'BCMSPropRichTextDataParsed';
      imports.set(
        cType === 'rust' ? 'content::BCMSEntryContentParsedItem;' : output,
        '@becomes/cms-client/types',
      );
    } else if (prop.type === BCMSPropType.TAG) {
      output = cType === 'gql' ? 'String' : 'string';
    } else if (prop.type === BCMSPropType.ENTRY_POINTER) {
      const data = prop.defaultData as BCMSPropEntryPointerData[];
      const outputTypes: string[] = [];
      for (let j = 0; j < data.length; j++) {
        const info = data[j];
        const template = await BCMSRepo.template.findById(info.templateId);
        if (template) {
          outputTypes.push(toCamelCase(template.name) + 'Entry');
          const path = `../entry/${template.name}`;
          const key =
            cType === 'rust'
              ? `entry::${template.name}::${
                  outputTypes[outputTypes.length - 1]
                };`
              : outputTypes[outputTypes.length - 1];
          imports.set(key, path);
          imports.addMetadata(key, path, {
            name: template.name,
            type: 'entry',
            props: template.props,
          });
        }
      }
      if (outputTypes.length > 0) {
        if (cType === 'gql') {
          // if (outputTypes.length > 1) {
          output = `${toCamelCase(prop.name)}Union`;
          additional.push(
            [
              `type ${toCamelCase(prop.name)}Union {`,
              ...outputTypes.map((type) => {
                const name = type.replace('Entry', '');
                return `  ${
                  name.slice(0, 1).toLowerCase() + name.slice(1)
                }: ${type}`;
              }),
              '}',
            ].join('\n'),
          );
          // additional.push(
          //   `union ${toCamelCase(prop.name)}Union = ${outputTypes.join(
          //     ' | ',
          //   )}\n\n`,
          // );
          // } else {
          //   output = outputTypes[0];
          // }
        } else if (cType === 'rust') {
          if (outputTypes.length > 1) {
            additional.push(
              [
                '',
                '#[derive(Serialize, Deserialize, Debug)]',
                '#[allow(non_camel_case_types)]',
                `enum ${toCamelCase(prop.name)}Type {`,
                ...outputTypes.map((type) => {
                  return `    ${type}(${type}),`;
                }),
                '}',
              ].join('\n'),
            );
            output = `${toCamelCase(prop.name)}Type`;
          } else {
            output = outputTypes[0];
          }
        } else {
          output = outputTypes.join(' | ');
        }
      }
    }
    return {
      type: prop.array
        ? cType === 'gql'
          ? `[${output}]`
          : cType === 'rust'
          ? `Vec<${output}>`
          : `Array<${output}>`
        : output,
      additional,
      imports,
    };
  }

  static async toConvertProps({
    props,
    converterType,
  }: {
    props: BCMSProp[];
    converterType?: 'js' | 'gql' | 'rust';
  }): Promise<BCMSTypeConverterPropsResult> {
    const output: BCMSTypeConverterPropsResult = {
      imports: new BCMSImports(),
      additional: [],
      props: [],
    };
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const typeResult = await this.bcmsPropTypeToConvertType(
        prop,
        converterType,
      );
      output.imports.fromImports(typeResult.imports);
      output.props.push({
        name: prop.name,
        type: typeResult.type,
        required: prop.required,
        array: prop.array,
      });
      output.additional.push(...typeResult.additional);
    }
    return output;
  }

  static async typescript(
    data: BCMSTypeConverterTarget[],
  ): Promise<BCMSTypeConverterResultItem[]> {
    const output: {
      [outputFile: string]: string;
    } = {};
    let loop = true;
    const parsedItems: {
      [name: string]: boolean;
    } = {};
    while (loop) {
      const target = data.pop();
      if (!target) {
        loop = false;
      } else {
        if (!output[`${target.type}/${target.name}.d.ts`]) {
          if (target.type === 'enum' && target.enumItems) {
            const baseName = `${toCamelCase(target.name)}Enum`;
            output[`enum/${target.name}.d.ts`] = [
              `export type ${baseName} =`,
              ...target.enumItems.map((e) => `  | '${e}'`),
              ';',
            ].join('\n');
            output[`enum/${target.name}.d.ts`] += [
              `\n\nexport interface ${baseName}Type {`,
              `  items: ${baseName}[];`,
              `  selected: ${baseName};`,
              `}`,
            ].join('\n');
          } else if (target.props) {
            const props = target.props;
            const result = await this.toConvertProps({ props });
            const interfaceName = toCamelCase(target.name + '_' + target.type);
            let typescriptProps: string[] = [];
            let additional: string[] = [''];
            if (target.type === 'entry') {
              const languages = await BCMSRepo.language.findAll();
              typescriptProps = [
                '  _id: string;',
                '  createdAt: number;',
                '  updatedAt: number;',
                '  templateId: string;',
                '  templateName: string;',
                '  userId: string;',
                '  status?: string;',
                '  meta: {',
                ...languages.map(
                  (lng) => `    ${lng.code}?: ${interfaceName}Meta;`,
                ),
                '  }',
                '  content: {',
                ...languages.map(
                  (lng) => `    ${lng.code}?: BCMSEntryContentParsedItem[];`,
                ),
                '  }',
              ];
              result.imports.set(
                'BCMSEntryContentParsedItem',
                '@becomes/cms-client/types',
              );
              additional = [
                '',
                `export interface ${interfaceName}Meta {`,
                ...result.props.map(
                  (prop) =>
                    `  ${prop.name}${prop.required || prop.array ? '' : '?'}: ${
                      prop.type
                    };`,
                ),
                '}',
                '',
              ];
            } else {
              typescriptProps = result.props.map(
                (prop) =>
                  `  ${prop.name}${prop.required || prop.array ? '' : '?'}: ${
                    prop.type
                  };`,
              );
            }
            output[`${target.type}/${target.name}.d.ts`] = [
              ...result.imports.flatten(),
              ...result.additional,
              ...additional,
              `export ${
                target.type === 'enum' ? 'type' : 'interface'
              } ${toCamelCase(target.name + '_' + target.type)} {`,
              ...typescriptProps,
              '}',
            ].join('\n');

            const importsState = result.imports.state;
            for (const path in importsState) {
              if (!path.startsWith('@becomes')) {
                for (const name in importsState[path]) {
                  const metadata = importsState[path][name].metadata;
                  if (metadata && !parsedItems[name]) {
                    data.push(metadata);
                  }
                }
              }
            }
          }
        }
      }
    }
    return Object.keys(output).map((outputFile) => {
      return {
        outputFile,
        content: output[outputFile],
      };
    });
  }

  static async jsDoc(
    data: BCMSTypeConverterTarget[],
  ): Promise<BCMSTypeConverterResultItem[]> {
    const output: {
      [outputFile: string]: string;
    } = {};
    let loop = true;
    const parsedItems: {
      [name: string]: boolean;
    } = {};

    while (loop) {
      const target = data.pop();
      if (!target) {
        loop = false;
      } else {
        if (!output[`${target.type}/${target.name}.js`]) {
          if (target.type === 'enum' && target.enumItems) {
            output[`enum/${target.name}.js`] = [
              `/** `,
              ' *  @typedef {(',
              ...target.enumItems.map((e) => ` *              | '${e}'`),
              ` *           )} ${toCamelCase(target.name)}Enum `,
              ' */',
            ].join('\n');
          } else if (target.props) {
            const props = target.props;
            const result = await this.toConvertProps({ props });
            const interfaceName = toCamelCase(target.name + '_' + target.type);
            let jsDocProps: string[] = [];
            let additional: string[] = [''];
            if (target.type === 'entry') {
              const languages = await BCMSRepo.language.findAll();
              jsDocProps = [
                ' *  @property { string } id',
                ' *  @property { number } createdAt',
                ' *  @property { number } updatedAt',
                ' *  @property { string } cid',
                ' *  @property { string } templateId',
                ' *  @property { string } templateName',
                ' *  @property { string } userId',
                ' *  @property { string } status',
                ' *  @property {{  ',
                ...languages.map(
                  (lng) => ` *              ${lng.code}: ${interfaceName}Meta `,
                ),
                ' *            }} meta',
                ' *  @property {{  ',
                ...languages.map(
                  (lng) =>
                    ` *               ${lng.code}: BCMSEntryContentParsed `,
                ),
                ' *            }} content',
              ];

              result.imports.set(
                'BCMSEntryContentParsed',
                '@becomes/cms-client/types',
              );
              additional = [
                ' *',
                ` *  @typedef { Object } ${interfaceName}Meta`,
                ...result.props.map(
                  (prop) => ` *  @property { ${prop.type} } ${prop.name}`,
                ),
                ' *',
              ];
            } else {
              jsDocProps = result.props.map(
                (prop) => ` *  @property { ${prop.type} } ${prop.name}`,
              );
            }
            output[`${target.type}/${target.name}.js`] = [
              `/**`,
              ...result.imports.flattenForJSDoc(),
              ...additional,
              ` *  @typedef { Object } ${toCamelCase(
                target.name + '_' + target.type,
              )}`,
              ...jsDocProps,
              ` */`,
            ].join('\n');
            const importsState = result.imports.state;
            for (const path in importsState) {
              if (!path.startsWith('@becomes')) {
                for (const name in importsState[path]) {
                  const metadata = importsState[path][name].metadata;
                  if (metadata && !parsedItems[name]) {
                    data.push(metadata);
                  }
                }
              }
            }
          }
        }
      }
    }
    return Object.keys(output).map((outputFile) => {
      return {
        outputFile,
        content: output[outputFile],
      };
    });
  }

  static async gql(
    data: BCMSTypeConverterTarget[],
  ): Promise<BCMSTypeConverterResultItem[]> {
    const output: {
      [name: string]: string;
    } = {};
    let loop = true;
    const parsedItems: {
      [name: string]: boolean;
    } = {};
    while (loop) {
      const target = data.pop();
      if (target) {
        if (!output[`${target.type}/${target.name}.gql`]) {
          if (target.type === 'enum' && target.enumItems) {
            const baseName = `${toCamelCase(target.name)}Enum`;
            output[`enum/${target.name}.gql`] = [
              `enum ${baseName} {`,
              ...target.enumItems,
              `}`,
            ].join('\n');
            output[`enum/${target.name}.gql`] += [
              `\n\ntype ${baseName}Type {`,
              `  items: [${baseName}!]!`,
              `  selected: String`,
              `}`,
            ].join('\n');
          } else if (target.props) {
            const props = target.props;
            const result = await this.toConvertProps({
              props,
              converterType: 'gql',
            });
            const interfaceName = toCamelCase(target.name + '_' + target.type);
            let mainObjectProps: string[] = [];
            let metaObject = '';
            let metaItem = '';

            if (target.type === 'entry') {
              const languages = await BCMSRepo.language.findAll();
              metaItem = [
                `type ${interfaceName}Meta {`,
                ...result.props.map(
                  (prop) =>
                    `  ${prop.name}: ${prop.type}${
                      prop.required || prop.array ? '!' : ''
                    }`,
                ),
                '}',
                '',
              ].join('\n');
              metaObject = [
                `type ${interfaceName}MetaType {`,
                ...languages.map(
                  (lng) => `  ${lng.code}: ${interfaceName}Meta`,
                ),
                '}',
                '',
              ].join('\n');
              mainObjectProps = [
                '  _id: String!',
                '  createdAt: Float!',
                '  updatedAt: Float!',
                '  templateId: String!',
                '  templateName: String!',
                '  userId: String!',
                '  status: String',
                `  meta: ${interfaceName}MetaType!`,
                '  content: BCMSEntryContentType!',
              ];
            } else {
              mainObjectProps = result.props.map(
                (prop) =>
                  `  ${prop.name}: ${prop.type}${prop.required ? '!' : ''}`,
              );
            }
            output[`${target.type}/${target.name}.gql`] = [
              // ...result.imports.flatten(),
              ...result.additional,
              metaItem,
              metaObject,
              `type ${interfaceName} {`,
              ...mainObjectProps,
              '}',
            ].join('\n');

            const importsState = result.imports.state;
            for (const path in importsState) {
              if (!path.startsWith('@becomes')) {
                for (const name in importsState[path]) {
                  const metadata = importsState[path][name].metadata;
                  if (metadata && !parsedItems[name]) {
                    data.push(metadata);
                  }
                }
              }
            }
          }
        }
      } else {
        loop = false;
      }
    }
    output['media.gql'] = [
      `enum BCMSMediaType {`,
      ...Object.keys(BCMSMediaType).map((e) => '  ' + e),
      '}',
      '',
      `type BCMSMediaParsed {`,
      `_id: String!`,
      `src: String!`,
      `name: String`,
      `width: Float!`,
      `height: Float!`,
      `caption: String`,
      `alt_text: String`,
      'svg: String',
      '}',
      '',
      `type BCMSMediaExtended {`,
      `  _id: String!`,
      `  createdAt: Float!`,
      `  updatedAt: Float!`,
      `  userId: String!`,
      `  type: BCMSMediaType!`,
      `  mimetype: String`,
      `  size: Float!`,
      `  name: String!`,
      `  isInRoot: Boolean!`,
      `  hasChildren: Boolean!`,
      `  altText: String`,
      `  caption: String`,
      `  width: Float!`,
      `  height: Float!`,
      `  parentId: String!`,
      `  fullPath: String!`,
      '}',
    ].join('\n');
    output['content.gql'] = [
      'enum BCMSEntryContentNodeType {',
      ...Object.keys(BCMSEntryContentNodeType),
      '}',
      '',
      'type BCMSEntryContentParsedAttrs {',
      '  level: Float',
      '}',
      '',
      'type BCMSEntryContentParsedItem {',
      '  type: BCMSEntryContentNodeType!',
      '  attrs: BCMSEntryContentParsedAttrs',
      '  name: String',
      '  isValueObject: Boolean!',
      '  value: String!',
      '}',
      '',
      'type BCMSEntryContentType {',
      ...(await BCMSRepo.language.findAll()).map(
        (lng) => `  ${lng.code}: [BCMSEntryContentParsedItem]!`,
      ),
      '}',
    ].join('\n');
    return Object.keys(output).map((outputFile) => {
      return {
        outputFile,
        content: output[outputFile],
      };
    });
  }

  static async rust(
    data: BCMSTypeConverterTarget[],
  ): Promise<BCMSTypeConverterResultItem[]> {
    const output: {
      [outputFile: string]: string;
    } = {};
    let loop = true;
    const parsedItems: {
      [name: string]: boolean;
    } = {};
    const mods: {
      enum?: string[];
    } = {};
    function fixInvalidPropNames(name: string): string {
      if (['type', 'ref'].includes(name)) {
        return `_${name}`;
      }
      return name;
    }
    while (loop) {
      const target = data.pop();
      if (!target) {
        loop = false;
      } else {
        if (!output[`${target.type}/${target.name}.rs`]) {
          if (target.type === 'enum' && target.enumItems) {
            const baseName = `${toCamelCase(target.name)}Enum`;
            if (!mods.enum) {
              mods.enum = [];
            }
            mods.enum.push(`pub mod ${target.name};`);
            output[`enum/${target.name}.rs`] = [
              'use serde::{Deserialize, Serialize};',
              '',
              '#[derive(Serialize, Deserialize, Debug)]',
              '#[allow(non_camel_case_types)]',
              `pub enum ${baseName} {`,
              ...target.enumItems.map((e) => `    ${e}(String),`),
              '}',
            ].join('\n');
            output[`enum/${target.name}.rs`] += [
              '\n',
              '#[derive(Serialize, Deserialize, Debug)]',
              '#[allow(non_camel_case_types)]',
              `pub struct ${baseName}Type {`,
              `    pub items: Vec<${baseName}>,`,
              `    pub selected: ${baseName},`,
              `}`,
            ].join('\n');
          } else if (target.props) {
            const props = target.props;
            const result = await this.toConvertProps({
              props,
              converterType: 'rust',
            });
            const interfaceName = toCamelCase(target.name + '_' + target.type);
            let rustProps: string[] = [];
            let additional: string[] = [''];
            if (target.type === 'entry') {
              const languages = await BCMSRepo.language.findAll();
              rustProps = [
                '    pub _id: String,',
                '    pub createdAt: i64,',
                '    pub updatedAt: i64,',
                '    pub templateId: String,',
                '    pub templateName: String,',
                '    pub userId: String,',
                '    pub status: String,',
                `    pub meta: ${interfaceName}Meta,`,
              ];
              additional = [
                '',
                '#[derive(Serialize, Deserialize, Debug)]',
                '#[allow(non_snake_case)]',
                `pub struct ${interfaceName}MetaItem {`,
                ...result.props.map(
                  (prop) =>
                    `    pub ${fixInvalidPropNames(prop.name)}: ${prop.type},`,
                ),
                '}',
                '',
                '#[derive(Serialize, Deserialize, Debug)]',
                '#[allow(non_snake_case)]',
                `pub struct ${interfaceName}Meta {`,
                ...languages.map(
                  (lng) =>
                    `    pub ${lng.code}: Option<${interfaceName}MetaItem>,`,
                ),
                '}',
              ];
            } else {
              rustProps = result.props.map(
                (prop) =>
                  `    pub ${fixInvalidPropNames(prop.name)}: ${
                    prop.required ? prop.type : `Option<${prop.type}>`
                  },`,
              );
            }
            output[`${target.type}/${target.name}.rs`] = [
              'use serde::{Deserialize, Serialize};',
              '',
              ...result.imports.flattenRust(),
              ...result.additional,
              ...additional,
              '',
              '#[derive(Serialize, Deserialize, Debug)]',
              '#[allow(non_snake_case)]',
              `pub ${target.type === 'enum' ? 'enum' : 'struct'} ${toCamelCase(
                target.name + '_' + target.type,
              )} {`,
              ...rustProps,
              '}',
            ].join('\n');

            const importsState = result.imports.state;
            for (const path in importsState) {
              if (!path.startsWith('@becomes')) {
                for (const name in importsState[path]) {
                  const metadata = importsState[path][name].metadata;
                  if (metadata && !parsedItems[name]) {
                    data.push(metadata);
                  }
                }
              }
            }
          }
        }
      }
    }
    output['media.rs'] = [
      'use serde::{Deserialize, Serialize};',
      '',
      '#[derive(Serialize, Deserialize, Debug)]',
      '#[allow(non_snake_case)]',
      'pub struct BCMSMediaParsed {',
      '    pub src: String,',
      '    pub _id: String,',
      '    pub alt_text: String,',
      '    pub caption: String,',
      '    pub height: i32,',
      '    pub width: i32,',
      '    pub name: String,',
      '    pub _type: String,',
      '}',
    ].join('\n');
    output['content.rs'] = [
      'use serde::{Deserialize, Serialize};',
      '',
      '#[derive(Serialize, Deserialize, Debug)]',
      '#[allow(non_snake_case)]',
      'pub struct BCMSEntryContentParsedItemAttrs {',
      '    level: Option<i32>,',
      '}',
      '',
      '#[derive(Serialize, Deserialize, Debug)]',
      '#[allow(non_snake_case)]',
      'pub struct BCMSEntryContentParsedItem {',
      '    _type: String,',
      '    attrs: Option<BCMSEntryContentParsedItemAttrs>,',
      '    name: Option<String>,',
      '    value: String,',
      '}',
    ].join('\n');
    output['mod.rs'] = 'pub mod content;\npub mod media;\n\n';
    for (const outputFile in output) {
      const parts = outputFile.split('/');
      if (parts[1]) {
        const key = `${parts[0]}/mod.rs`;
        if (!output[key]) {
          output['mod.rs'] += `pub mod ${
            parts[0] === 'enum' ? 'r#enum' : parts[0]
          };\n`;
          output[key] = '';
        }
        output[key] += `pub mod ${parts[1].replace('.rs', '')};\n`;
      }
    }
    return Object.keys(output).map((outputFile) => {
      return {
        outputFile,
        content: output[outputFile],
      };
    });
  }
}

function toCamelCase(nameEncoded: string) {
  return nameEncoded
    .split('_')
    .map((e) => e.substring(0, 1).toUpperCase() + e.substring(1))
    .join('');
}

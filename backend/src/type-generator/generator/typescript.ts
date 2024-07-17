import {
    type Prop,
    PropType,
} from '@thebcms/selfhosted-backend/prop/models/main';
import {
    TypeGenerator,
    type TypeGeneratorEnumsMap,
    type TypeGeneratorGeneratedProp,
    type TypeGeneratorImportsMap,
} from '@thebcms/selfhosted-backend/type-generator/generator/main';
import type { Template } from '@thebcms/selfhosted-backend/template/models/main';
import type { Group } from '@thebcms/selfhosted-backend/group/models/main';
import type { PropEntryPointerData } from '@thebcms/selfhosted-backend/prop/models/entry-pointer';
import type { PropEnumData } from '@thebcms/selfhosted-backend/prop/models/enum';
import type { PropGroupPointerData } from '@thebcms/selfhosted-backend/prop/models/group-pointer';

export function generateTypescriptFileContent(
    props: Prop[],
    rootTypeName: string,
    enumsMap: TypeGeneratorEnumsMap,
    templates: Template[],
    groups: Group[],
): string {
    const typeProps: string[] = [];
    const importsMaps: TypeGeneratorImportsMap[] = [];
    for (let j = 0; j < props.length; j++) {
        const prop = props[j];
        const generatorResult = generateTypescriptProp(prop, templates, groups);
        if (generatorResult) {
            importsMaps.push(generatorResult.importsMap);
            if (generatorResult.enum) {
                if (!enumsMap[generatorResult.enum.path]) {
                    enumsMap[generatorResult.enum.path] = {};
                }
                enumsMap[generatorResult.enum.path][generatorResult.enum.name] =
                    generatorResult.enum.values;
            } else {
                typeProps.push(`    ${generatorResult.propString}`);
            }
        }
    }
    const importsMap: TypeGeneratorImportsMap = {};
    for (let j = 0; j < importsMaps.length; j++) {
        const impMap = importsMaps[j];
        for (const path in impMap) {
            if (!importsMap[path]) {
                importsMap[path] = {};
            }
            for (const typeName in impMap[path]) {
                importsMap[path][typeName] = true;
            }
        }
    }
    const fileContent: string[] = [];
    for (const path in importsMap) {
        const typeNames: string[] = [];
        for (const typeName in importsMap[path]) {
            typeNames.push(typeName);
        }
        fileContent.push(
            `import type { ${typeNames.join(', ')} } from '${path}';`,
        );
    }
    fileContent.push('');
    fileContent.push(
        `export interface ${rootTypeName} {`,
        ...typeProps,
        '}',
        '',
    );
    return fileContent.join('\n');
}

export function generateTypescriptProp(
    prop: Prop,
    templates: Template[],
    groups: Group[],
): TypeGeneratorGeneratedProp | null {
    const output: TypeGeneratorGeneratedProp = {
        propString: `${prop.name}${prop.required ? '' : '?'}:`,
        importsMap: {},
    };
    if (
        prop.type === PropType.STRING ||
        prop.type === PropType.NUMBER ||
        prop.type === PropType.BOOLEAN
    ) {
        if (prop.array) {
            output.propString += ` ${prop.type.toLowerCase()}[];`;
        } else {
            output.propString += ` ${prop.type.toLowerCase()};`;
        }
    } else if (prop.type === PropType.ENTRY_POINTER) {
        const data = prop.data.propEntryPointer as PropEntryPointerData[];
        const outputTypes = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const template = templates.find((e) => e._id === item.templateId);
            if (!template) {
                continue;
            }
            const typeName =
                TypeGenerator.snakeToCamelCase(template.name) + 'Entry';
            const typePath = `../entry/${template.name}`;
            outputTypes.push(typeName);
            if (!output.importsMap[typePath]) {
                output.importsMap[typePath] = {};
            }
            output.importsMap[typePath][typeName] = true;
        }
        if (prop.array) {
            output.propString += ` Array<${outputTypes.join(' | ')}>;`;
        } else {
            output.propString += ` ${outputTypes.join(' | ')};`;
        }
    } else if (prop.type === PropType.DATE) {
        if (prop.array) {
            output.propString += ` BCMSPropDate[];`;
        } else {
            output.propString += ` BCMSPropDate;`;
        }
        const datePath = '../prop';
        if (!output.importsMap[datePath]) {
            output.importsMap[datePath] = {};
        }
        output.importsMap[datePath].BCMSPropDate = true;
    } else if (prop.type === PropType.MEDIA) {
        if (prop.array) {
            output.propString += ` BCMSMedia[];`;
        } else {
            output.propString += ` BCMSMedia;`;
        }
        const mediaPath = '../prop';
        if (!output.importsMap[mediaPath]) {
            output.importsMap[mediaPath] = {};
        }
        output.importsMap[mediaPath].BCMSMedia = true;
    } else if (prop.type === PropType.ENUMERATION) {
        const data = prop.data.propEnum as PropEnumData;
        const typeName = TypeGenerator.snakeToCamelCase(prop.name);
        const typePath = `../enum/${typeName}`;
        output.enum = {
            path: `enum/${prop.name}.d.ts`,
            name: typeName,
            values: data.items,
        };
        if (!output.importsMap[typePath]) {
            output.importsMap[typePath] = {};
        }
        output.importsMap[typePath][typeName] = true;
    } else if (prop.type === PropType.GROUP_POINTER) {
        const data = prop.data.propGroupPointer as PropGroupPointerData;
        const group = groups.find((e) => e._id === data._id);
        if (!group) {
            return null;
        }
        const typeName = TypeGenerator.snakeToCamelCase(group.name) + 'Group';
        const typePath = `../group/${group.name}`;
        if (!output.importsMap[typePath]) {
            output.importsMap[typePath] = {};
        }
        output.importsMap[typePath][typeName] = true;
        if (prop.array) {
            output.propString += ` ${typeName}[];`;
        } else {
            output.propString += ` ${typeName};`;
        }
    } else if (prop.type === PropType.RICH_TEXT) {
        if (prop.type === PropType.RICH_TEXT) {
            if (prop.array) {
                output.propString += ` BCMSPropRichTextParsed[];`;
            } else {
                output.propString += ` BCMSPropRichTextParsed;`;
            }
            const richTextPath = '../prop';
            if (!output.importsMap[richTextPath]) {
                output.importsMap[richTextPath] = {};
            }
            output.importsMap[richTextPath]['BCMSPropRichTextParsed'] = true;
        }
    }
    return output;
}

export const typeGeneratorTypescriptStaticTypes = {
    status: `
export interface BCMSEntryStatuses {
@languages
}
`,
    content: `
export type BCMSEntryContentNodeType =
    | 'paragraph'
    | 'heading'
    | 'widget'
    | 'bulletList'
    | 'listItem'
    | 'orderedList'
    | 'text'
    | 'codeBlock'
    | 'hardBreak';

export interface BCMSEntryContentNodeHeadingAttr {
    level: number;
}

export interface BCMSEntryContentNodeLinkAttr {
    href: string;
    target: string;
}

export interface BCMSEntryContentNodeWidgetAttr {
    data: PropValueWidgetData;
    propPath: string;
}

export type BCMSContentNodeAttrs =
    | BCMSEntryContentNodeHeadingAttr
    | BCMSEntryContentNodeWidgetAttr
    | BCMSEntryContentNodeLinkAttr;
    
export interface BCMSEntryContentParsedItem {
    type: BCMSEntryContentNodeType;
    attrs?: BCMSContentNodeAttrs;
    name?: string;
    value: string@widgets;
}

export interface BCMSEntryContentParsed {
@languages
}
`,

    prop: `
import type { BCMSEntryContentNodeType, BCMSContentNodeAttrs } from './content';

export interface BCMSPropRichTextParsedItem {
    type: BCMSEntryContentNodeType;
    attrs?: BCMSContentNodeAttrs;
    name?: string;
    value: string | {
        [name: string]: any
    };
}

export type BCMSPropRichTextParsed = BCMSPropRichTextParsedItem[];

export interface BCMSPropDate {
    timestamp: number;
    timezoneOffset: number;
}

export type BCMSMediaType =
    | 'DIR'
    | 'IMG'
    | 'SVG'
    | 'VID'
    | 'TXT'
    | 'GIF'
    | 'OTH'
    | 'PDF'
    | 'JS'
    | 'HTML'
    | 'CSS'
    | 'JAVA';
                
export interface BCMSMedia {
    _id: string;
    src: string;
    name: string;
    width: number;
    height: number;
    caption: string;
    alt_text: string;
    svg?: string;
    type: BCMSMediaType;
    mimetype: string;
    size: number;
}
`,
};

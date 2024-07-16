import type { ObjectSchema } from '@thebcms/selfhosted-utils/object-utility';
import type { Template } from '@thebcms/selfhosted-backend/template/models/main';
import type { Group } from '@thebcms/selfhosted-backend/group/models/main';
import type { Widget } from '@thebcms/selfhosted-backend/widget/models/main';
import type { Language } from '@thebcms/selfhosted-backend/language/models/main';
import {
    generateTypescriptFileContent,
    typeGeneratorTypescriptStaticTypes,
} from '@thebcms/selfhosted-backend/type-generator/generator/typescript';

export type TypeGeneratorLanguage = 'ts' | 'rust' | 'golang' | 'gql';
export const TypeGeneratorAllowedLanguages: TypeGeneratorLanguage[] = [
    'ts',
    'rust',
    'golang',
    'gql',
];

export interface TypeGeneratorImportsMap {
    [path: string]: {
        [type: string]: boolean;
    };
}

export interface TypeGeneratorEnumsMap {
    [path: string]: {
        [type: string]: string[];
    };
}

export interface TypeGeneratorGeneratedProp {
    propString: string;
    enum?: {
        path: string;
        name: string;
        values: string[];
    };
    importsMap: TypeGeneratorImportsMap;
}

export interface TypeGeneratorFile {
    path: string;
    content: string;
}

export const TypeGeneratorFileSchema: ObjectSchema = {
    path: {
        __type: 'string',
        __required: true,
    },
    content: {
        __type: 'string',
        __required: true,
    },
};

export class TypeGenerator {
    filesMap: {
        [path: string]: string;
    } = {};

    constructor(
        templates: Template[],
        groups: Group[],
        widgets: Widget[],
        languages: Language[],
        public lang: TypeGeneratorLanguage,
    ) {
        switch (lang) {
            case 'ts':
                {
                    const enumsMap: TypeGeneratorEnumsMap = {};
                    const widgetsMeta: {
                        imports: string[];
                        types: string[];
                    } = {
                        imports: [],
                        types: [],
                    };
                    for (let i = 0; i < groups.length; i++) {
                        const group = groups[i];
                        const typePath = `group/${group.name}.d.ts`;
                        const typeName =
                            TypeGenerator.snakeToCamelCase(group.name) +
                            'Group';
                        this.filesMap[typePath] = generateTypescriptFileContent(
                            group.props,
                            `${typeName}`,
                            enumsMap,
                            templates,
                            groups,
                        );
                    }
                    for (let i = 0; i < widgets.length; i++) {
                        const widget = widgets[i];
                        const typePath = `widget/${widget.name}.d.ts`;
                        const typeName =
                            TypeGenerator.snakeToCamelCase(widget.name) +
                            'Widget';
                        this.filesMap[typePath] = generateTypescriptFileContent(
                            widget.props,
                            `${typeName}`,
                            enumsMap,
                            templates,
                            groups,
                        );
                        widgetsMeta.imports.push(
                            `import type { ${typeName} } from './widget/${widget.name}';`,
                        );
                        widgetsMeta.types.push(typeName);
                    }
                    for (let i = 0; i < templates.length; i++) {
                        const template = templates[i];
                        const typePath = `entry/${template.name}.d.ts`;
                        const typeName =
                            TypeGenerator.snakeToCamelCase(template.name) +
                            'Entry';
                        this.filesMap[typePath] =
                            [
                                `import type { BCMSEntryContentParsed } from '../content';`,
                                `import type { BCMSEntryStatuses } from '../status';`,
                                '',
                            ].join('\n') +
                            generateTypescriptFileContent(
                                template.props,
                                `${typeName}MetaItem`,
                                enumsMap,
                                templates,
                                groups,
                            ) +
                            [
                                '',
                                `export interface ${typeName}Meta {`,
                                ...languages.map(
                                    (lng) =>
                                        `    ${lng.code}?: ${typeName}MetaItem;`,
                                ),
                                '}',
                                '',
                                `export interface ${typeName} {`,
                                '    _id: string;',
                                '    createdAt: number;',
                                '    updatedAt: number;',
                                '    templateId: string;',
                                '    userId: string;',
                                '    statuses: BCMSEntryStatuses;',
                                `    meta: ${typeName}Meta;`,
                                '    content: BCMSEntryContentParsed;',
                                '}',
                            ].join('\n');
                    }
                    for (const typePath in enumsMap) {
                        for (const typeName in enumsMap[typePath]) {
                            this.filesMap[
                                typePath
                            ] = `export type ${typeName} = ${enumsMap[typePath][
                                typeName
                            ].join('\n  | ')};`;
                        }
                    }
                    this.filesMap['prop.d.ts'] =
                        typeGeneratorTypescriptStaticTypes.prop;
                    this.filesMap['content.d.ts'] =
                        widgetsMeta.imports.join('\n') +
                        '\n' +
                        typeGeneratorTypescriptStaticTypes.content
                            .replace(
                                '@widgets',
                                `${
                                    widgetsMeta.types.length ? `\n    | ` : ''
                                }` + widgetsMeta.types.join('\n    | '),
                            )
                            .replace(
                                '@languages',
                                languages
                                    .map(
                                        (lng) =>
                                            `    ${lng.code}?: BCMSEntryContentParsedItem[];`,
                                    )
                                    .join('\n'),
                            );
                    this.filesMap['status.d.ts'] =
                        typeGeneratorTypescriptStaticTypes.status.replace(
                            '@languages',
                            languages
                                .map((lng) => `    ${lng.code}?: string;`)
                                .join('\n'),
                        );
                    this.filesMap['index.d.ts'] = Object.keys(this.filesMap)
                        .map((path) => `export * from './${path}';`)
                        .join('\n');
                }
                break;
        }
    }

    static snakeToCamelCase(str: string): string {
        return str
            .split('_')
            .map((e) => e.substring(0, 1).toUpperCase() + e.substring(1))
            .join('');
    }

    filesArray() {
        const output: TypeGeneratorFile[] = [];
        for (const filesMapKey in this.filesMap) {
            output.push({
                path: filesMapKey,
                content: this.filesMap[filesMapKey],
            });
        }
        return output;
    }
}

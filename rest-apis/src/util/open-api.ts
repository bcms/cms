import {
  ObjectPropSchema,
  ObjectPropSchemaArrayChild,
  ObjectSchema,
} from '@banez/object-utility/types';
import { v4 as uuidv4 } from 'uuid';
import { OpenApiComponents, OpenApiSchema } from '../types';

export interface OpenApiUtilParseSchemaOutput {
  visualSchema: string;
  objectSchema: ObjectSchema | ObjectPropSchema;
  json: any;
}

export const VisualSchemaWrap = {
  key(value: string): string {
    return `<span class="symbol">${value.replace(/"/g, '')}</span>`;
  },
  type(value: string): string {
    return `<span class="primitiveType">${value}</span>`;
  },
  typeFormat(value: string): string {
    return `<span class="primitiveType--format">[${value}]</span>`;
  },
  collapse(id: string, value: string): string {
    // blockCollapseScript(id);
    return `<span class="colBtn" title="Collapse" onclick="bcmsRestApisToggleSection('${id}')">${value}</span>`;
  },
  colGroupStart(id: string): string {
    return `<span id="col${id}" class="colBlock">`;
  },
  colGroupEnd(): string {
    return `</span>`;
  },
  link(href: string, value: string): string {
    // let h = '';
    // if (href.startsWith('#')) {
    //   h = window.location.pathname + href;
    // } else {
    //   h = href;
    // }
    return `<a class="link" ref="prefetch" href="${href}" onclick="bcmsRestApisLinkClick(event, '${href}')" >( ${value} )</a>`;
  },
  or() {
    return `<span class="or">or</span>`;
  },
  and() {
    return `<span class="or">and</span>`;
  },
};

function schemaParserRecursion(
  output: OpenApiUtilParseSchemaOutput,
  visualSections: string[],
  indent: string,
  componentName: string
): void {
  output.json = {};
  output.objectSchema = {
    __type: 'object',
    __child: {},
  } as ObjectPropSchema;
  visualSections.push(
    indent +
      VisualSchemaWrap.link(`#model-${componentName}`, `${componentName}`)
  );
}

export class OpenApiUtil {
  static readonly indentSize = 2;

  static resolveComponentRef(
    components: OpenApiComponents,
    ref: string
  ): { schema: OpenApiSchema; name: string } {
    const name = ref.split('/').slice(3)[0];
    return { schema: components[name], name };
  }

  static parseSchema(
    schema: OpenApiSchema,
    components: OpenApiComponents,
    componentName?: string,
    level?: number,
    refTrace?: string[]
  ): OpenApiUtilParseSchemaOutput {
    try {
      if (!level) {
        level = 0;
      }
      if (!refTrace) {
        refTrace = [];
      }
      const indent = ' '.repeat(this.indentSize * level);
      const output: OpenApiUtilParseSchemaOutput = {
        visualSchema: '',
        objectSchema: {},
        json: {},
      };
      const visualSections: string[] = [];
      let isPrimitive = false;

      if (schema.$ref) {
        const component = this.resolveComponentRef(components, schema.$ref);
        if (refTrace.includes(schema.$ref)) {
          schemaParserRecursion(output, visualSections, indent, component.name);
        } else {
          refTrace.push(schema.$ref);
          const child = this.parseSchema(
            component.schema,
            components,
            component.name,
            level,
            [...refTrace]
          );
          output.json = child.json;
          output.objectSchema = child.objectSchema;
          visualSections.push(child.visualSchema);
        }
      } else if (schema.type === 'object') {
        const id = uuidv4().replace(/-/g, '_');
        visualSections.push(
          VisualSchemaWrap.collapse(id, '{') +
            VisualSchemaWrap.colGroupStart(id)
        );
        output.objectSchema = {
          __type: 'object',
          __required: false,
          __child: {},
        };
        const childIndent = ' '.repeat(this.indentSize * (level + 1));
        if (componentName) {
          visualSections.push(
            childIndent +
              VisualSchemaWrap.link(`#model-${componentName}`, componentName)
          );
        }
        if (schema.properties) {
          for (const propName in schema.properties) {
            const prop = schema.properties[propName];
            let compName = '';
            let sch: OpenApiSchema | null = null;
            if (prop.$ref) {
              const component = this.resolveComponentRef(components, prop.$ref);
              if (refTrace.includes(prop.$ref)) {
                schemaParserRecursion(
                  output,
                  visualSections,
                  childIndent,
                  component.name
                );
              } else {
                if (
                  component.schema.type !== 'string' &&
                  component.schema.type !== 'number' &&
                  component.schema.type !== 'boolean'
                ) {
                  refTrace.push(prop.$ref);
                }
                compName = component.name;
                sch = component.schema;
              }
            } else {
              sch = prop;
            }

            if (sch) {
              const child = this.parseSchema(
                sch,
                components,
                compName,
                level + 1,
                [...refTrace]
              );
              output.json[propName] = child.json;
              if (output.objectSchema.__child) {
                (output.objectSchema.__child as any)[propName] =
                  child.objectSchema;
              }
              visualSections.push(
                childIndent +
                  VisualSchemaWrap.key(propName) +
                  `${
                    schema.required && schema.required.includes(propName)
                      ? ''
                      : '?'
                  }: ${child.visualSchema}`
              );
            }
          }
        } else if (
          schema.additionalProperties &&
          schema.additionalProperties['x-name']
        ) {
          const propName = schema.additionalProperties['x-name'];
          const prop = schema.additionalProperties;
          const child = this.parseSchema(
            prop,
            components,
            undefined,
            level + 1,
            [...refTrace]
          );
          output.json[propName] = child.json;
          (output.objectSchema.__child as any)[propName] = child.objectSchema;
          visualSections.push(
            childIndent +
              VisualSchemaWrap.key(`&lt;${propName}&gt;`) +
              `: ${child.visualSchema}`
          );
        }
        visualSections.push(`${indent}${VisualSchemaWrap.colGroupEnd()}}`);
      } else if (schema.type === 'array') {
        output.json = [];
        output.objectSchema = {
          __type: 'array',
          __required: false,
          __child: {
            __type: 'string',
          },
        };
        const id = uuidv4().replace(/-/g, '_');
        visualSections.push(
          VisualSchemaWrap.collapse(id, '[') +
            VisualSchemaWrap.colGroupStart(id)
        );

        const childIndent = ' '.repeat(this.indentSize * (level + 1));
        if (componentName) {
          visualSections.push(
            childIndent +
              VisualSchemaWrap.link(`#model-${componentName}`, componentName)
          );
        }
        if (schema.items) {
          let compName: string = '';
          let sch: OpenApiSchema | null = null;

          if (schema.items.$ref) {
            const component = this.resolveComponentRef(
              components,
              schema.items.$ref
            );
            if (refTrace.includes(schema.items.$ref)) {
              schemaParserRecursion(
                output,
                visualSections,
                childIndent,
                component.name
              );
            } else {
              if (
                component.schema.type !== 'string' &&
                component.schema.type !== 'number' &&
                component.schema.type !== 'boolean'
              ) {
                refTrace.push(schema.items.$ref);
              }
              output.objectSchema = {
                __type: 'array',
                __required: false,
                __child: {
                  __type: 'object',
                  __content: {},
                },
              };
              sch = component.schema;
              compName = component.name;
            }
          } else {
            sch = schema.items;
          }

          if (sch) {
            if (sch.type === 'object') {
              (output.objectSchema.__child as ObjectPropSchema).__type =
                'object';
              (
                output.objectSchema.__child as ObjectPropSchemaArrayChild
              ).__content = {};
            } else if (sch.type === 'string') {
              (output.objectSchema.__child as ObjectPropSchema).__type =
                'string';
            } else if (sch.type === 'boolean') {
              (output.objectSchema.__child as ObjectPropSchema).__type =
                'boolean';
            } else if (
              sch.type === 'number' ||
              sch.type === 'integer' ||
              sch.type === 'float' ||
              sch.type === 'double'
            ) {
              (output.objectSchema.__child as ObjectPropSchema).__type =
                'number';
            }
            if (compName) {
              visualSections.push(
                childIndent +
                  VisualSchemaWrap.link(`#model-${compName}`, compName)
              );
            }
            const child = this.parseSchema(
              sch,
              components,
              undefined,
              level + 1,
              [...refTrace]
            );
            output.json = [child.json];
            if (sch.type === 'object') {
              (
                output.objectSchema.__child as ObjectPropSchemaArrayChild
              ).__content = child.objectSchema as ObjectSchema;
            }
            visualSections.push(`${childIndent}${child.visualSchema}`);
          }
        }

        visualSections.push(`${indent}${VisualSchemaWrap.colGroupEnd()}]`);
      } else if (schema.oneOf) {
        const id = uuidv4().replace(/-/g, '_');
        visualSections.push(
          VisualSchemaWrap.collapse(id, 'oneOf ((') +
            VisualSchemaWrap.colGroupStart(id)
        );
        const childIndent = '  '.repeat(level + 1);
        const childVisualSections: string[] = [];
        for (let i = 0; i < schema.oneOf.length; i++) {
          const oneOf = schema.oneOf[i];
          if (oneOf.$ref) {
            const component = this.resolveComponentRef(components, oneOf.$ref);
            if (refTrace.includes(oneOf.$ref)) {
              schemaParserRecursion(
                output,
                childVisualSections,
                childIndent,
                component.name
              );
            } else {
              if (
                component.schema.type !== 'string' &&
                component.schema.type !== 'number' &&
                component.schema.type !== 'boolean'
              ) {
              }
              refTrace.push(oneOf.$ref);
              childVisualSections.push(
                childIndent +
                  VisualSchemaWrap.link(
                    `#model-${component.name}`,
                    component.name
                  )
              );
            }
          } else {
            const child = this.parseSchema(
              oneOf,
              components,
              undefined,
              level + 1,
              refTrace
            );
            childVisualSections.push(childIndent + child.visualSchema);
          }
        }
        visualSections.push(
          childVisualSections.join(`\n${childIndent}${VisualSchemaWrap.or()}\n`)
        );

        visualSections.push(`${indent}${VisualSchemaWrap.colGroupEnd()}))`);
      } else if (schema.allOf) {
        const id = uuidv4().replace(/-/g, '_');
        visualSections.push(
          VisualSchemaWrap.collapse(id, 'allOf ((') +
            VisualSchemaWrap.colGroupStart(id)
        );
        const childIndent = '  '.repeat(level + 1);
        const childVisualSections: string[] = [];
        for (let i = 0; i < schema.allOf.length; i++) {
          const allOf = schema.allOf[i];
          if (allOf.$ref) {
            const component = this.resolveComponentRef(components, allOf.$ref);
            if (refTrace.includes(allOf.$ref)) {
              schemaParserRecursion(
                output,
                childVisualSections,
                childIndent,
                component.name
              );
            } else {
              if (
                component.schema.type !== 'string' &&
                component.schema.type !== 'number' &&
                component.schema.type !== 'boolean'
              ) {
              }
              refTrace.push(allOf.$ref);
              childVisualSections.push(
                childIndent +
                  VisualSchemaWrap.link(
                    `#model-${component.name}`,
                    component.name
                  )
              );
            }
          } else {
            const child = this.parseSchema(
              allOf,
              components,
              undefined,
              level + 1,
              refTrace
            );
            childVisualSections.push(childIndent + child.visualSchema);
          }
        }
        visualSections.push(
          childVisualSections.join(
            `\n${childIndent}${VisualSchemaWrap.and()}\n`
          )
        );

        visualSections.push(`${indent}${VisualSchemaWrap.colGroupEnd()}))`);
      } else {
        isPrimitive = true;
        if (schema.type === 'string') {
          output.json = '';
          output.objectSchema = {
            __type: 'string',
            __required: false,
          };
        } else if (schema.type === 'boolean') {
          output.json = false;
          output.objectSchema = {
            __type: 'boolean',
            __required: false,
          };
        } else if (
          schema.type === 'number' ||
          schema.type === 'integer' ||
          schema.type === 'float' ||
          schema.type === 'double'
        ) {
          output.json = 0;
          output.objectSchema = {
            __type: 'number',
            __required: false,
          };
        }
        let line = VisualSchemaWrap.type(schema.type + '');
        if (schema.enum) {
          line +=
            '&nbsp;' + VisualSchemaWrap.typeFormat(schema.enum.join(' | '));
        }
        if (schema.format) {
          line += '&nbsp;' + VisualSchemaWrap.typeFormat(schema.format);
        }
        visualSections.push(line);
      }

      if (isPrimitive) {
        output.visualSchema = visualSections.join('');
      } else {
        output.visualSchema = visualSections.join('</br>');
      }

      return output;
    } catch (error) {
      console.error(schema, componentName, level);
      throw error;
    }
  }
}

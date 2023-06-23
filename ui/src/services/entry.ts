import {
  type BCMSEntryContentNode,
  type BCMSMedia,
  BCMSPropType,
  type BCMSPropValueWidgetData,
  type BCMSTemplate,
} from '@becomes/cms-sdk/types';
import { BCMSEntryContentNodeType } from '@becomes/cms-sdk/types';
import type { JSONContent } from '@tiptap/core';
import type {
  BCMSEntryExtended,
  BCMSEntryExtendedContentAttrWidget,
  BCMSEntryService,
} from '../types';

let service: BCMSEntryService;

export function useBcmsEntryService(): BCMSEntryService {
  return service;
}

export function createBcmsEntryService(): void {
  service = {
    async toExtended({ template, entry }) {
      let temp: BCMSTemplate;
      if (typeof template === 'string') {
        try {
          temp = await window.bcms.sdk.template.get(template);
        } catch (_error) {
          return null;
        }
      } else {
        temp = JSON.parse(JSON.stringify(template));
      }

      let output: BCMSEntryExtended = {} as never;
      if (entry) {
        output = {
          _id: entry._id,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
          cid: entry.cid,
          userId: entry.userId,
          templateId: temp._id,
          status: entry.status,
          meta: [],
          content: [],
        };
      } else {
        output = {
          _id: '',
          createdAt: 0,
          updatedAt: 0,
          cid: '',
          userId: '',
          templateId: temp._id,
          status: '',
          meta: [],
          content: [],
        };
      }
      const languages = await window.bcms.sdk.language.getAll();
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i];
        const metaIndex =
          output.meta.push({
            lng: lang.code,
            props: [],
          }) - 1;
        const contentIndex =
          output.content.push({
            lng: lang.code,
            nodes: [],
          }) - 1;
        if (entry) {
          const entryContent = entry.content.find((e) => e.lng === lang.code);
          if (entryContent) {
            output.content[contentIndex].nodes =
              await service.content.toExtendedNodes({
                contentNodes: entryContent.nodes,
                lang: lang.code,
              });
          }
        }
        for (let j = 0; j < temp.props.length; j++) {
          const templateProp = temp.props[j];
          const propValue = await window.bcms.prop.toPropValueExtended({
            prop: templateProp,
            lang: lang.code,
            value: entry?.meta
              .find((e) => e.lng === lang.code)
              ?.props.find((e) => e.id === templateProp.id),
          });
          if (propValue) {
            output.meta[metaIndex].props.push(
              JSON.parse(JSON.stringify(propValue))
            );
          }
        }
      }
      return output;
    },
    fromExtended({ extended }) {
      return {
        _id: extended._id,
        cid: extended.cid,
        createdAt: extended.createdAt,
        updatedAt: extended.updatedAt,
        templateId: extended.templateId,
        userId: extended.userId,
        status: extended.status,
        meta: extended.meta.map((meta) => {
          return {
            lng: meta.lng,
            props: meta.props.map((prop) => {
              return window.bcms.prop.fromPropValueExtended({ extended: prop });
            }),
          };
        }),
        content: extended.content.map((content) => {
          return {
            lng: content.lng,
            nodes: service.content.fromExtendedNodes({
              tContent: content.nodes,
            }),
          };
        }),
      };
    },
    toMultiSelectOptions(entry, template) {
      let imageId: string | undefined;
      let subtitle: string | undefined;
      for (let i = 2; i < entry.meta[0].props.length; i++) {
        const prop = entry.meta[0].props[i];
        const tProp = template.props.find((e) => e.id === prop.id);
        if (tProp && prop.data) {
          if (
            tProp.type === BCMSPropType.MEDIA &&
            (prop.data as BCMSMedia[])[0]
          ) {
            imageId = (prop.data as BCMSMedia[])[0]._id;
          } else if (tProp.type === BCMSPropType.STRING) {
            subtitle = (prop.data as string[])[0];
          }
        }
      }
      return {
        id: `${entry.templateId}-${entry._id}`,
        title: (entry.meta[0].props[0].data as string[])[0],
        imageId,
        subtitle,
      };
    },
    content: {
      async toExtendedNodes({ contentNodes, lang }) {
        if (!contentNodes) {
          return [];
        }
        const output: JSONContent[] = [];
        for (let i = 0; i < contentNodes.length; i++) {
          const node = contentNodes[i];
          if (
            node.type === BCMSEntryContentNodeType.paragraph ||
            node.type === BCMSEntryContentNodeType.heading ||
            node.type === BCMSEntryContentNodeType.codeBlock
          ) {
            output.push(node);
          } else if (
            node.type === BCMSEntryContentNodeType.bulletList ||
            node.type === BCMSEntryContentNodeType.orderedList ||
            node.type === BCMSEntryContentNodeType.listItem
          ) {
            output.push({
              type: node.type,
              content: await service.content.toExtendedNodes({
                contentNodes: node.content as BCMSEntryContentNode[],
                lang,
              }),
            });
          } else if (node.type === BCMSEntryContentNodeType.widget) {
            const attrs = node.attrs as BCMSPropValueWidgetData;
            if (attrs._id) {
              try {
                const widget = await window.bcms.sdk.widget.get(attrs._id);
                if (widget) {
                  const outputIndex =
                    output.push({
                      type: BCMSEntryContentNodeType.widget,
                      attrs: {
                        widget,
                        lang,
                        content: [],
                        basePath: `c${lang}.${i}`,
                      },
                    }) - 1;
                  for (let j = 0; j < widget.props.length; j++) {
                    const prop = widget.props[j];
                    const value = attrs.props.find((e) => e.id === prop.id);
                    if (value) {
                      (
                        output[outputIndex].attrs as { content: unknown[] }
                      ).content.push(
                        await window.bcms.prop.toPropValueExtended({
                          prop,
                          value,
                          lang,
                        })
                      );
                    }
                  }
                }
              } catch (error) {
                console.warn(error);
              }
            }
          }
        }
        return output;
      },
      fromExtendedNodes({ tContent }) {
        if (!tContent) {
          return [];
        }
        const output: BCMSEntryContentNode[] = [];
        for (let i = 0; i < tContent.length; i++) {
          const tNode = tContent[i];
          if (
            tNode.type === BCMSEntryContentNodeType.paragraph ||
            tNode.type === BCMSEntryContentNodeType.heading ||
            tNode.type === BCMSEntryContentNodeType.codeBlock
          ) {
            if (tNode.content) {
              output.push(tNode as never);
            }
          } else if (
            tNode.type === BCMSEntryContentNodeType.bulletList ||
            tNode.type === BCMSEntryContentNodeType.orderedList ||
            tNode.type === BCMSEntryContentNodeType.listItem
          ) {
            if (tNode.content) {
              output.push({
                type: tNode.type,
                content: service.content.fromExtendedNodes({
                  tContent: tNode.content,
                }),
              });
            }
          } else if (tNode.type === BCMSEntryContentNodeType.widget) {
            const attrs = tNode.attrs as BCMSEntryExtendedContentAttrWidget;
            output.push({
              type: BCMSEntryContentNodeType.widget,
              attrs: {
                _id: attrs.widget?._id || '',
                props: attrs.content.map((prop) =>
                  window.bcms.prop.fromPropValueExtended({ extended: prop })
                ),
              },
            });
          }
        }
        return output;
      },
    },
  };
}

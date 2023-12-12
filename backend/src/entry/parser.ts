import { BCMSPropHandler } from '@backend/prop';
import { BCMSRepo } from '@backend/repo';
import { BCMSContentUtility } from '@backend/util';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSEntryParsed,
  BCMSEntryParser,
  BCMSStatus,
  BCMSEntryContentNodeType,
  BCMSEntryContentParsedItem,
  BCMSEntryContentNodeHeadingAttr,
  BCMSPropValueWidgetData,
  BCMSEntryContent,
} from '../types';

let parser: BCMSEntryParser;

export function useBcmsEntryParser(): BCMSEntryParser {
  return parser;
}

export function createBcmsEntryParser(): Module {
  return {
    name: 'Entry parser',
    initialize(moduleConfig) {
      parser = {
        async parse({ entry, maxDepth, depth, level, justLng, programLng }) {
          if (!level) {
            level = 'entry';
          }
          if (!depth) {
            depth = 0;
          }
          let status: BCMSStatus | null = null;
          if (entry.status) {
            status = await BCMSRepo.status.findById(entry.status);
          }
          const entryParsed: BCMSEntryParsed = {
            _id: entry._id,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            templateId: entry.templateId,
            templateName: '',
            userId: entry.userId,
            status: status ? status.name : '',
            meta: {},
            content: {},
          };
          const langs = await BCMSRepo.language.findAll();
          const temp = await BCMSRepo.template.findById(entry.templateId);
          if (!temp) {
            return null;
          }
          entryParsed.templateName = temp.name;
          for (let i = 0; i < langs.length; i++) {
            const lang = langs[i];
            if (!justLng || lang.code === justLng) {
              const meta = entry.meta.find((e) => e.lng === lang.code);
              if (meta) {
                entryParsed.meta[lang.code] = await BCMSPropHandler.parse({
                  programLng,
                  meta: temp.props,
                  values: meta.props,
                  maxDepth,
                  depth: 0,
                  level: entry._id,
                  onlyLng: lang.code,
                });
              } else {
                entryParsed.meta[lang.code] = await BCMSPropHandler.parse({
                  programLng,
                  meta: temp.props,
                  values: [],
                  maxDepth,
                  depth: 0,
                  level: entry._id,
                  onlyLng: lang.code,
                });
              }

              const content = entry.content.find((e) => e.lng === lang.code);
              if (content) {
                entryParsed.content[lang.code] = await parser.parseContent({
                  programLng,
                  nodes: content.nodes,
                  maxDepth,
                  depth,
                  justLng,
                  level,
                });
              } else {
                entryParsed.content[lang.code] = [];
              }
            }
          }
          return entryParsed;
        },
        async parseContent({ nodes, maxDepth, justLng, depth, level, programLng }) {
          const output: BCMSEntryContentParsedItem[] = [];
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.type === BCMSEntryContentNodeType.widget) {
              const attrs = node.attrs as BCMSPropValueWidgetData;
              const widget = await BCMSRepo.widget.findById(attrs._id);
              if (widget) {
                output.push({
                  type: node.type,
                  name: widget.name,
                  value: await BCMSPropHandler.parse({
                    programLng,
                    meta: widget.props,
                    values: attrs.props,
                    maxDepth,
                    depth: depth ? depth + 1 : undefined,
                    level,
                    onlyLng: justLng,
                  }),
                });
              }
            } else {
              output.push({
                type: node.type,
                attrs:
                  node.type === BCMSEntryContentNodeType.heading
                    ? {
                        level: (node.attrs as BCMSEntryContentNodeHeadingAttr)
                          .level,
                      }
                    : undefined,
                value: BCMSContentUtility.nodeToHtml({ node }),
              });
            }
          }
          return output;
        },
        async injectPlaneText({ content }) {
          const contentsNew: BCMSEntryContent[] = [];
          for (let i = 0; i < content.length; i++) {
            const item = content[i];
            let output = '';
            for (let j = 0; j < item.nodes.length; j++) {
              const node = item.nodes[j];
              output += BCMSContentUtility.nodeToText({ node }) + '\n';
            }
            contentsNew.push({
              lng: item.lng,
              nodes: item.nodes,
              plainText: output.toLowerCase(),
            });
          }
          return contentsNew;
        },
      };
      moduleConfig.next();
    },
  };
}

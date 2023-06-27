import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { BCMSPropEditor } from '../props';
import type {
  BCMSArrayPropMoveEventData,
  BCMSEntryExtendedContentAttrWidget,
  BCMSEntrySync,
  BCMSPropValueExtended,
} from '../../types';
import { BCMSStoreMutationTypes } from '../../types';
import { BCMSIcon, BCMSImage } from '../index';
import {
  type BCMSMedia,
  BCMSPropType,
  type BCMSSocketSyncChangeDataProp,
  type BCMSSocketSyncChangeEvent,
  BCMSSocketSyncChangeType,
  type BCMSWidget,
} from '@becomes/cms-sdk/types';
import { BCMSEntrySyncService } from '../../services';
import { patienceDiff, patienceDiffToSocket } from '../../util';

const component = defineComponent({
  props: nodeViewProps,
  setup(props) {
    const store = window.bcms.vue.store;
    const rootClass = 'bcmsWidget';
    const attrs = ref<BCMSEntryExtendedContentAttrWidget>(
      JSON.parse(
        JSON.stringify(props.node?.attrs as BCMSEntryExtendedContentAttrWidget),
      ),
    );
    if (typeof attrs.value.widget === 'string') {
      attrs.value.widget = JSON.parse(attrs.value.widget as never);
    }
    if (typeof attrs.value.content === 'string') {
      attrs.value.content = JSON.parse(attrs.value.content as never);
    }
    const image = ref<BCMSMedia | null>(null);
    const showImage = ref(true);
    const handleRef = ref<HTMLElement | null>(null);
    const entrySync = BCMSEntrySyncService.instance as BCMSEntrySync;
    const language = BCMSEntrySyncService.language;

    const storeUnsub = store.subscribe(async (mutation) => {
      if (mutation.type === BCMSStoreMutationTypes.widget_set) {
        if (mutation.payload._id === attrs.value.widget?._id) {
          attrs.value.widget = mutation.payload;
          await parseWidget();
        }
      }
    });

    async function parseWidget() {
      const contentItems: BCMSPropValueExtended[] = [];
      if (attrs.value.widget && attrs.value.widget.props) {
        for (let i = 0; i < attrs.value.widget.props.length; i++) {
          const prop = attrs.value.widget.props[i];
          const targetValue = attrs.value.content.find((e) => e.id === prop.id);
          const result = await window.bcms.prop.toPropValueExtended({
            prop,
            value: targetValue,
            lang: attrs.value.lang,
          });
          if (result) {
            // TODO: Improve implementation @Branislav
            if (prop.type === BCMSPropType.COLOR_PICKER) {
              (result.data as any).value = (result.data as any).value.value;
            }
            contentItems.push(result);
          }
        }
        attrs.value.content = contentItems;
        if (attrs.value.widget.previewImage) {
          await window.bcms.util.throwable(
            async () => {
              return await window.bcms.sdk.media.getById(
                (attrs.value.widget as BCMSWidget).previewImage,
              );
            },
            async (result) => {
              image.value = result;
            },
          );
        }
      }
    }

    function onResize() {
      if (window.innerWidth > 1300) {
        showImage.value = true;
      } else {
        showImage.value = false;
      }
    }

    function resolvePath(path: string): Array<string | number> {
      let p = window.bcms.prop.pathStrToArr(path);
      if (typeof p[1] === 'number' && typeof p[2] === 'number') {
        p = p.slice(2);
      } else {
        p = p.slice(1);
      }
      return p;
    }

    async function onSyncChangeSignal(event: BCMSSocketSyncChangeEvent) {
      if (event.sct === BCMSSocketSyncChangeType.PROP) {
        const data = event.data as BCMSSocketSyncChangeDataProp;
        if (attrs.value.content && data.p.startsWith(attrs.value.basePath)) {
          const content = attrs.value.content;
          if (
            data.sd ||
            typeof data.rep !== 'undefined' ||
            data.addI ||
            data.remI ||
            data.movI
          ) {
            const path = window.bcms.prop.pathStrToArr(data.p).slice(2);
            if (data.sd) {
              window.bcms.prop.mutateValue.string(content, path, data.sd);
            } else if (typeof data.rep !== 'undefined') {
              window.bcms.prop.mutateValue.any(content, path, data.rep);
            } else if (data.movI) {
              window.bcms.prop.mutateValue.reorderArrayItems(
                content,
                path,
                data.movI as BCMSArrayPropMoveEventData,
              );
            } else if (data.remI) {
              window.bcms.prop.mutateValue.removeArrayItem(content, path);
            } else if (data.addI) {
              const widget = attrs.value.widget;
              if (widget) {
                window.bcms.prop.mutateValue.addArrayItem(
                  content,
                  widget.props,
                  window.bcms.prop.pathStrToArr(data.p),
                  data.l,
                );
              }
            } else {
              return;
            }
            if (props.updateAttributes) {
              props.updateAttributes({
                content: JSON.stringify(content),
                widget: JSON.stringify(attrs.value.widget),
              });
            }
          }
        }
      }
    }

    onMounted(async () => {
      await parseWidget();
      onResize();
      window.addEventListener('resize', onResize);
      if (handleRef.value) {
        const parent = handleRef.value.parentElement as HTMLElement;
        if (parent) {
          parent.setAttribute('id', 'widget_wrapper');
        }
      }
      if (store.getters.feature_available('content_sync')) {
        entrySync.onChange((event) => {
          onSyncChangeSignal(event).catch((err) => {
            console.error(err);
          });
        });
      }
    });
    onUnmounted(() => {
      window.removeEventListener('resize', onResize);
      storeUnsub();
    });

    return () => (
      <NodeViewWrapper class="group-scope relative">
        <div
          ref={handleRef}
          class="absolute z-10 top-0 left-0 w-10 -translate-x-full -translate-y-2 h-full group-scope-hover:block"
        >
          <div data-drag-handle class="cursor-move p-2">
            <BCMSIcon
              src="/editor/drag"
              class="text-grey fill-current w-6 h-6"
            />
          </div>
        </div>
        <div
          class={`${rootClass} relative border border-t-0 border-green rounded-2.5 rounded-t-none mt-12 mb-10 pt-6 px-2.5 pb-6 select-none sm:px-5 dark:border-yellow`}
          data-bcms-wid={JSON.stringify(attrs.value.content || {})}
        >
          <div
            class={`${rootClass}_top absolute top-0 -left-px w-[calc(100%+2px)] -translate-y-1/2 before:absolute before:top-0 before:left-0 before:rounded-tl-2.5 before:border-t before:border-l before:w-2.5 before:h-2.5 before:border-solid before:border-green after:absolute after:top-0 after:right-0 after:rounded-tr-2.5 after:border-t after:border-r after:w-2.5 after:h-2.5 after:border-solid after:border-green dark:after:border-yellow dark:before:border-yellow`}
          >
            <div class="flex items-center pl-5 pr-3 -translate-y-2 after:top-1/2 after:w-full after:relative after:h-px after:flex-grow after:bg-green after:translate-x-1 after:-translate-y-px dark:after:bg-yellow">
              <BCMSIcon
                class="flex-shrink-0 w-3 h-3 mr-2 text-green fill-current dark:text-yellow"
                src="/administration/widget"
              />
              <span class="truncate max-w-[calc(100%-24px)] flex-shrink-0 text-green text-xs leading-normal tracking-0.06 uppercase mr-1.5 dark:text-yellow">
                Widget | {attrs.value?.widget?.label}
              </span>
              <button
                class="absolute right-5 p-1.25 dark:bg-dark bg-white z-10"
                onClick={() => {
                  if (props.deleteNode) {
                    props.deleteNode();
                  }
                }}
              >
                <BCMSIcon
                  src="/trash"
                  class="w-6 h-6 block text-green dark:text-yellow fill-current"
                />
              </button>
            </div>
          </div>
          <div>
            <BCMSPropEditor
              basePropPath={attrs.value.basePath + '.'}
              props={attrs.value.content}
              lng={attrs.value.lang}
              onUpdate={(value, propPath) => {
                if (!language) {
                  return;
                }
                const path = resolvePath(propPath);
                const content = attrs.value.content as BCMSPropValueExtended[];
                if (typeof value === 'string') {
                  const curr: string = window.bcms.prop.getValueFromPath(
                    content,
                    path,
                  );
                  if (typeof curr === 'string') {
                    entrySync.emit.propValueChange({
                      propPath,
                      languageCode: language.value.target.code,
                      languageIndex: language.value.targetIndex,
                      sd: patienceDiffToSocket(
                        patienceDiff(curr.split(''), value.split('')).lines,
                      ),
                    });
                  }
                } else if (!propPath.endsWith('nodes')) {
                  entrySync.emit.propValueChange({
                    propPath,
                    languageCode: language.value.target.code,
                    languageIndex: language.value.targetIndex,
                    replaceValue: value,
                  });
                }
                window.bcms.prop.mutateValue.any(content, path, value);
                if (props.updateAttributes) {
                  props.updateAttributes({
                    content: JSON.stringify(content),
                    widget: JSON.stringify(attrs.value.widget),
                  });
                }
              }}
              onAdd={async (propPath) => {
                if (!language) {
                  return;
                }
                const content = attrs.value.content as BCMSPropValueExtended[];
                const widget = attrs.value.widget as BCMSWidget;
                await window.bcms.prop.mutateValue.addArrayItem(
                  content,
                  widget.props,
                  resolvePath(propPath),
                  language.value.target.code,
                );
                entrySync.emit.propAddArrayItem({
                  propPath,
                  languageCode: language.value.target.code,
                  languageIndex: language.value.targetIndex,
                });
                if (props.updateAttributes) {
                  props.updateAttributes({
                    content: JSON.stringify(content),
                    widget: JSON.stringify(attrs.value.widget),
                  });
                }
              }}
              onRemove={(propPath) => {
                if (!language) {
                  return;
                }
                const content = attrs.value.content as BCMSPropValueExtended[];
                window.bcms.prop.mutateValue.removeArrayItem(
                  content,
                  resolvePath(propPath),
                );
                entrySync.emit.propRemoveArrayItem({
                  propPath,
                  languageCode: language.value.target.code,
                  languageIndex: language.value.targetIndex,
                });
                if (props.updateAttributes) {
                  props.updateAttributes({
                    content: JSON.stringify(content),
                    widget: JSON.stringify(attrs.value.widget),
                  });
                }
              }}
              onMove={(propPath, data) => {
                if (!language) {
                  return;
                }
                const content = attrs.value.content as BCMSPropValueExtended[];
                window.bcms.prop.mutateValue.reorderArrayItems(
                  content,
                  resolvePath(propPath),
                  data,
                );
                entrySync.emit.propMoveArrayItem({
                  propPath,
                  languageCode: language.value.target.code,
                  languageIndex: language.value.targetIndex,
                  data,
                });
                if (props.updateAttributes) {
                  props.updateAttributes({
                    content: JSON.stringify(content),
                    widget: JSON.stringify(attrs.value.widget),
                  });
                }
              }}
              onUpdateContent={(propPath, updates) => {
                if (!language) {
                  return;
                }
                entrySync.emit.contentUpdate({
                  propPath: propPath,
                  languageCode: language.value.target.code,
                  languageIndex: language.value.targetIndex,
                  data: {
                    updates,
                  },
                });
              }}
            />
          </div>
        </div>
        {image.value ? (
          <div
            style={`position: absolute; top: 0; right: -320px; transition: all 0.2s; opacity: ${
              showImage.value ? '1' : '0'
            }`}
          >
            <BCMSImage
              media={image.value}
              alt={attrs.value.widget?.label || ''}
            />
          </div>
        ) : (
          ''
        )}
      </NodeViewWrapper>
    );
  },
});
export default component;

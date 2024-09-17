import {
    computed,
    defineComponent,
    onBeforeUpdate,
    onMounted,
    onUnmounted,
    ref,
} from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import type { EntryContentNodeWidgetAttr } from '@bcms/selfhosted-backend/entry/models/content';
import type { Media } from '@bcms/selfhosted-backend/media/models/main';
import { Icon } from '@bcms/selfhosted-ui/components/icon';
import { EntryMetaEditor } from '@bcms/selfhosted-ui/components/entry/meta';
import type { PropValueWidgetData } from '@bcms/selfhosted-backend/prop/models/widget';
import {
    propApplyValueChangeFromPath,
    propPathToArray,
    propValueMoveArrayItem,
    propValueRemoveArrayItem,
} from '@bcms/selfhosted-ui/util/prop';
import { entryEditorMetaOnAddPropValue } from '@bcms/selfhosted-ui/components/entry/editor';
import { MediaPreview } from '@bcms/selfhosted-ui/components/media-preview';

const SLICE_PROP_PATH_INDEX = 8;

export const EntryContentNodeWidgetComponent = defineComponent({
    props: nodeViewProps,
    setup(props) {
        const sdk = window.bcms.sdk;
        const [language] = window.bcms.useLanguage();

        const wrapperRef = ref<HTMLElement | null>(null);
        const extended = ref(true);
        const attrs = ref<EntryContentNodeWidgetAttr>(
            JSON.parse(JSON.stringify(props.node?.attrs)),
        );
        const widget = computed(() =>
            sdk.store.widget.findById(
                typeof attrs.value.data === 'string'
                    ? ''
                    : attrs.value.data._id,
            ),
        );
        if (typeof attrs.value.data === 'string') {
            attrs.value.data = JSON.parse(attrs.value.data);
        }
        const image = ref<Media | null>(null);
        const showImage = ref(true);

        function onResize() {
            showImage.value = window.innerWidth > 1300;
        }

        onMounted(async () => {
            onResize();
            window.addEventListener('resize', onResize);
            (wrapperRef.value as any).$el.setAttribute('draggable', 'false');
        });
        onUnmounted(() => {
            window.removeEventListener('resize', onResize);
        });
        onBeforeUpdate(() => {
            if (props.node) {
                if (attrs.value.propPath !== props.node.attrs.propPath) {
                    attrs.value.propPath = props.node.attrs.propPath;
                }
                if (
                    JSON.stringify(attrs.value.data) !== props.node.attrs.data
                ) {
                    attrs.value.data = JSON.parse(props.node.attrs.data);
                }
            }
        });

        return () => (
            <NodeViewWrapper class="relative" ref={wrapperRef}>
                <div class="absolute z-10 top-0 left-0 w-10 -translate-x-full -translate-y-2 h-full ">
                    <div data-drag-handle class="cursor-move p-2">
                        <Icon
                            src="/editor/drag"
                            class="text-grey fill-current w-6 h-6"
                        />
                    </div>
                </div>
                <div
                    class={`relative border border-green dark:border-yellow border-t-0 rounded-b-2.5 px-4 pt-4 pb-8 mb-10`}
                    data-bcms-wid={JSON.stringify(attrs.value.data || {})}
                >
                    <div
                        class={`absolute flex items-center`}
                        style={`width: calc(100% + 2px); top: -17px; left: -1px;`}
                    >
                        <div
                            class={`relative top-[4px] w-2.5 h-2.5 rounded-tl-2.5 border-l border-t border-green dark:border-yellow`}
                        ></div>
                        <Icon
                            class="mx-2 flex-shrink-0 w-3 h-3 text-dark dark:text-white"
                            src="/feather"
                        />
                        <div
                            class={`appearance-none relative mr-2 text-green dark:text-yellow whitespace-nowrap text-xs uppercase`}
                        >
                            Widget | {widget.value?.label}
                        </div>
                        <div
                            class={`h-[1px] bg-green dark:bg-yellow w-full mr-2`}
                        />
                        <button
                            class={`mr-4`}
                            onClick={() => {
                                if (props.deleteNode) {
                                    props.deleteNode();
                                }
                            }}
                        >
                            <Icon
                                src="/trash"
                                class="w-4 h-4 block text-red fill-current"
                            />
                        </button>
                        <button
                            class={`mr-2 text-dark dark:text-white hover:text-green dark:hover:text-yellow fill-current`}
                            onClick={() => {
                                extended.value = !extended.value;
                            }}
                        >
                            {extended.value ? (
                                <Icon class={`w-4 h-4 `} src={'/minimize'} />
                            ) : (
                                <Icon class={`w-4 h-4 `} src={`/maximize`} />
                            )}
                        </button>
                        <div
                            class={`relative top-[4px] w-2.5 h-2.5 border-t border-r border-green dark:border-yellow rounded-tr-2.5`}
                        ></div>
                    </div>
                    <div>
                        {widget.value && extended.value && (
                            <div>
                                <EntryMetaEditor
                                    propPath={attrs.value.propPath + '.props'}
                                    props={widget.value.props}
                                    values={
                                        (
                                            attrs.value
                                                .data as PropValueWidgetData
                                        ).props
                                    }
                                    lngCode={language.value}
                                    lngIdx={0}
                                    entryId={props.node.attrs.entryId}
                                    propValidator={
                                        window.bcms.entryPropValidator
                                    }
                                    onEditProp={(propPath, value) => {
                                        const pathParts = propPathToArray(
                                            propPath,
                                        ).slice(SLICE_PROP_PATH_INDEX);
                                        propApplyValueChangeFromPath(
                                            pathParts,
                                            attrs.value.data.props,
                                            value,
                                        );
                                        props.updateAttributes({
                                            data: JSON.stringify(
                                                attrs.value.data,
                                            ),
                                            propPath: attrs.value.propPath,
                                        });
                                    }}
                                    onAddValue={async (propPath, prop) => {
                                        const pathParts = propPathToArray(
                                            propPath,
                                        ).slice(SLICE_PROP_PATH_INDEX);
                                        await entryEditorMetaOnAddPropValue(
                                            attrs.value.data.props,
                                            pathParts,
                                            prop,
                                        );
                                    }}
                                    onRemoveArrayItem={(propPath) => {
                                        const pathParts = propPathToArray(
                                            propPath,
                                        ).slice(SLICE_PROP_PATH_INDEX);
                                        propValueRemoveArrayItem(
                                            pathParts,
                                            attrs.value.data.props,
                                        );
                                    }}
                                    onMoveArrayItem={(propPath, direction) => {
                                        const pathParts = propPathToArray(
                                            propPath,
                                        ).slice(SLICE_PROP_PATH_INDEX);
                                        propValueMoveArrayItem(
                                            pathParts,
                                            attrs.value.data.props,
                                            direction,
                                        );
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                {image.value ? (
                    <div
                        style={`position: absolute; top: 0; right: -320px; transition: all 0.2s; opacity: ${
                            showImage.value ? '1' : '0'
                        }`}
                    >
                        <MediaPreview media={image.value} thumbnail />
                    </div>
                ) : (
                    ''
                )}
            </NodeViewWrapper>
        );
    },
});

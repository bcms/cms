import {
    computed,
    defineComponent,
    onBeforeUpdate,
    onMounted,
    onUnmounted,
    ref,
} from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import type { EntryContentNodeWidgetAttr } from '@thebcms/selfhosted-backend/entry/models/content';
import type { Media } from '@thebcms/selfhosted-backend/media/models/main';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';
import { EntryMetaEditor } from '@thebcms/selfhosted-ui/components/entry/meta';
import type { PropValueWidgetData } from '@thebcms/selfhosted-backend/prop/models/widget';
import {
    propApplyValueChangeFromPath,
    propPathToArray,
    propValueMoveArrayItem,
    propValueRemoveArrayItem,
} from '@thebcms/selfhosted-ui/util/prop';
import { entryEditorMetaOnAddPropValue } from '@thebcms/selfhosted-ui/components/entry/editor';
import { MediaPreview } from '@thebcms/selfhosted-ui/components/media-preview';

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
            <NodeViewWrapper class="group-scope relative" ref={wrapperRef}>
                <div class="absolute z-10 top-0 left-0 w-10 -translate-x-full -translate-y-2 h-full group-scope-hover:block">
                    <div data-drag-handle class="cursor-move p-2">
                        <Icon
                            src="/editor/drag"
                            class="text-grey fill-current w-6 h-6"
                        />
                    </div>
                </div>
                <div data-bcms-wid={JSON.stringify(attrs.value.data || {})}>
                    <div class={`flex gap-2 items-center`}>
                        <Icon
                            class="flex-shrink-0 w-3 h-3 stroke-brand-700"
                            src="/feather"
                        />
                        <div class={`whitespace-nowrap text-xs uppercase`}>
                            Widget | {widget.value?.label}
                        </div>
                        <div
                            class={`h-[1px] bg-gray-300 dark:bg-gray-800 w-full`}
                        />
                        <button
                            onClick={() => {
                                if (props.deleteNode) {
                                    props.deleteNode();
                                }
                            }}
                        >
                            <Icon
                                src="/trash-01"
                                class="w-6 h-6 block stroke-error-700"
                            />
                        </button>
                        <button
                            class={`stroke-black dark:stroke-white hover:stroke-brand-700`}
                            onClick={() => {
                                extended.value = !extended.value;
                            }}
                        >
                            {extended.value ? (
                                <Icon src={'/minimize-01'} />
                            ) : (
                                <Icon src={`maximize-01`} />
                            )}
                        </button>
                    </div>
                    <div
                        class={`pl-2 ml-2 border-l border-l-gray-300 dark:border-l-gray-800`}
                    >
                        {widget.value && (
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

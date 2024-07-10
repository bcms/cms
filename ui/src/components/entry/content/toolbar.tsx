import {
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
    ref,
    Teleport,
} from 'vue';
import { type Editor, posToDOMRect } from '@tiptap/vue-3';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import { findParent } from '@thebcms/selfhosted-ui/util/dom';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';

export interface EntryContentEditorToolbarItem {
    id: string;
    text: string;
    icon: string;
    visible(): boolean;
    active?(): boolean;
    onClick?(): void;
    children?: {
        title: string;
        show: boolean;
        items: EntryContentEditorToolbarItem[];
    };
}

export const EntryContentEditorToolbar = defineComponent({
    props: {
        ...DefaultComponentProps,
        propPath: { type: String, required: true },
        editor: { type: Object as PropType<Editor>, required: true },
        allowedWidgets: Array as PropType<string[]>,
    },
    setup(props) {
        const modal = window.bcms.modalService;

        const toolbarPosition = ref<{ top: number; left: number }>();
        const navItems = ref(getNavItems());
        const container = ref<HTMLDivElement>();
        let selectDebounce: NodeJS.Timeout | undefined = undefined;

        function getNavItems() {
            const items: EntryContentEditorToolbarItem[] = [
                {
                    id: 'paragraph_type',
                    text: 'Paragraph type',
                    icon: '/editor/text',
                    visible: () =>
                        !(
                            props.editor.isActive('bulletList') ||
                            props.editor.isActive('orderedList') ||
                            props.editor.isActive('codeBlock')
                        ),
                    // visible: () => true,
                    active: () => props.editor.isActive('heading'),
                    children: {
                        title: 'Convert to',
                        show: false,
                        items: [
                            {
                                id: 'heading_1',
                                text: 'Heading 1',
                                visible: () =>
                                    !props.editor.isActive('heading', {
                                        level: 1,
                                    }),
                                icon: '/editor/heading/h1',
                                onClick() {
                                    props.editor
                                        .chain()
                                        .focus()
                                        .toggleHeading({
                                            level: 1,
                                        })
                                        .run();
                                },
                            },
                            {
                                id: 'heading_2',
                                text: 'Heading 2',
                                visible: () =>
                                    !props.editor.isActive('heading', {
                                        level: 2,
                                    }),
                                icon: '/editor/heading/h2',
                                onClick() {
                                    props.editor
                                        .chain()
                                        .focus()
                                        .toggleHeading({
                                            level: 2,
                                        })
                                        .run();
                                },
                            },
                            {
                                id: 'heading_3',
                                text: 'Heading 3',
                                visible: () =>
                                    !props.editor.isActive('heading', {
                                        level: 3,
                                    }),
                                icon: '/editor/heading/h3',
                                onClick() {
                                    props.editor
                                        .chain()
                                        .focus()
                                        .toggleHeading({
                                            level: 3,
                                        })
                                        .run();
                                },
                            },
                            {
                                id: 'heading_4',
                                text: 'Heading 4',
                                visible: () =>
                                    !props.editor.isActive('heading', {
                                        level: 4,
                                    }),
                                icon: '/editor/heading/h4',
                                onClick() {
                                    props.editor
                                        .chain()
                                        .focus()
                                        .toggleHeading({
                                            level: 4,
                                        })
                                        .run();
                                },
                            },
                            {
                                id: 'heading_5',
                                text: 'Heading 5',
                                visible: () =>
                                    !props.editor.isActive('heading', {
                                        level: 5,
                                    }),
                                icon: '/editor/heading/h5',
                                onClick() {
                                    props.editor
                                        .chain()
                                        .focus()
                                        .toggleHeading({
                                            level: 5,
                                        })
                                        .run();
                                },
                            },
                            {
                                id: 'heading_6',
                                text: 'Heading 6',
                                visible: () =>
                                    !props.editor.isActive('heading', {
                                        level: 6,
                                    }),
                                icon: '/editor/heading/h6',
                                onClick() {
                                    props.editor
                                        .chain()
                                        .focus()
                                        .toggleHeading({
                                            level: 6,
                                        })
                                        .run();
                                },
                            },
                            {
                                id: 'paragraph',
                                text: 'Paragraph',
                                visible: () =>
                                    !props.editor.isActive('paragraph'),
                                icon: '/editor/text',
                                onClick() {
                                    props.editor
                                        .chain()
                                        .focus()
                                        .clearNodes()
                                        .run();
                                },
                            },
                        ],
                    },
                },
                {
                    id: 'bold',
                    text: 'Bold',
                    icon: '/editor/bold',
                    visible: () => !props.editor.isActive('codeBlock'),
                    active: () => props.editor.isActive('bold'),
                    onClick() {
                        props.editor.chain().focus().toggleBold().run();
                    },
                },
                {
                    id: 'italic',
                    text: 'Italic',
                    icon: '/editor/italic',
                    visible: () => !props.editor.isActive('codeBlock'),
                    active: () => props.editor.isActive('italic'),
                    onClick() {
                        props.editor.chain().focus().toggleItalic().run();
                    },
                },
                {
                    id: 'underline',
                    text: 'Underline',
                    icon: '/editor/underline',
                    visible: () => !props.editor.isActive('codeBlock'),
                    active: () => props.editor.isActive('underline'),
                    onClick() {
                        props.editor.chain().focus().toggleUnderline().run();
                    },
                },
                {
                    id: 'strike',
                    text: 'Strike',
                    icon: '/editor/strike',
                    visible: () => !props.editor.isActive('codeBlock'),
                    active: () => props.editor.isActive('strike'),
                    onClick() {
                        props.editor.chain().focus().toggleStrike().run();
                    },
                },
                {
                    id: 'link',
                    text: 'Link',
                    icon: '/editor/link',
                    visible: () => !props.editor.isActive('codeBlock'),
                    active: () => props.editor.isActive('link'),
                    onClick() {
                        let href = '';
                        if (props.editor.isActive('link')) {
                            href = props.editor.getAttributes('link').href;
                        }
                        modal.handlers.entryContentLinkEdit.open({
                            data: {
                                href,
                            },
                            onDone(data) {
                                if (data.href) {
                                    props.editor
                                        .chain()
                                        .focus()
                                        .extendMarkRange('link')
                                        .setLink({ href: data.href })
                                        .run();
                                } else {
                                    props.editor
                                        .chain()
                                        .focus()
                                        .extendMarkRange('link')
                                        .unsetLink()
                                        .run();
                                }
                            },
                        });
                    },
                },
                {
                    id: 'inline-code',
                    text: 'Inline code',
                    icon: '/editor/terminal',
                    visible: () => !props.editor.isActive('codeBlock'),
                    active: () => props.editor.isActive('inlineCode'),
                    onClick() {
                        props.editor.chain().focus().toggleInlineCode().run();
                    },
                },
                {
                    id: 'bullet_list',
                    text: 'Unordered list',
                    icon: '/editor/list-ul',
                    visible: () => !props.editor.isActive('codeBlock'),
                    active: () => props.editor.isActive('bulletList'),
                    onClick() {
                        props.editor.chain().focus().toggleBulletList().run();
                    },
                },
                {
                    id: 'ordered_list',
                    text: 'Ordered list',
                    icon: '/editor/list-ol',
                    visible: () => !props.editor.isActive('codeBlock'),
                    active: () => props.editor.isActive('orderedList'),
                    onClick() {
                        props.editor.chain().focus().toggleOrderedList().run();
                    },
                },
                {
                    id: 'code-block',
                    text: 'Code block',
                    icon: '/editor/code',
                    visible: () => true,
                    active: () => props.editor.isActive('codeBlock'),
                    onClick() {
                        props.editor.chain().focus().toggleCodeBlock().run();
                    },
                },
            ];
            return items;
        }

        function onClick(event: MouseEvent) {
            const element = event.target as HTMLElement;
            if (element) {
                const parent = findParent(element, (el) => {
                    return el.id === props.propPath;
                });
                if (!parent) {
                    toolbarPosition.value = undefined;
                }
            }
        }

        function navItemComponent(navItem: EntryContentEditorToolbarItem) {
            return (
                <div class={`relative`}>
                    <button
                        id={navItem.id}
                        title={navItem.text}
                        class={`fill-current ${
                            navItem.active && navItem.active()
                                ? 'text-green dark:text-yellow'
                                : 'text-dark dark:text-white'
                        } hover:text-green dark:hover:text-yellow`}
                        onClick={(event) => {
                            if (navItem.children) {
                                event.stopPropagation();
                                event.preventDefault();
                                navItem.children.show = !navItem.children.show;
                            } else if (navItem.onClick) {
                                navItem.onClick();
                            }
                        }}
                    >
                        <Icon
                            class={`w-4 h-4 fill-current`}
                            src={navItem.icon}
                        />
                    </button>
                    {navItem.children && navItem.children.show ? (
                        <div
                            class={`absolute flex flex-col gap-2 top-8 left-0 bg-white dark:bg-darkGray py-2 px-4 shadow-xl rounded-bl-xl rounded-br-xl`}
                        >
                            {navItem.children.items
                                .filter((childItem) => childItem.visible())
                                .map((childItem) => {
                                    return (
                                        <button
                                            id={childItem.id}
                                            title={childItem.text}
                                            class={`flex gap-4 items-center fill-current ${
                                                childItem.active &&
                                                childItem.active()
                                                    ? 'text-green dark:text-yellow'
                                                    : 'text-dark dark:text-white'
                                            } hover:text-green dark:hover:text-yellow`}
                                            onClick={() => {
                                                if (childItem.onClick) {
                                                    childItem.onClick();
                                                }
                                            }}
                                        >
                                            <div>
                                                <Icon
                                                    class={`w-3 h-3 fill-current`}
                                                    src={childItem.icon}
                                                />
                                            </div>
                                            <div class={`whitespace-nowrap`}>
                                                {childItem.text}
                                            </div>
                                        </button>
                                    );
                                })}
                        </div>
                    ) : (
                        ''
                    )}
                </div>
            );
        }

        onMounted(() => {
            window.addEventListener('click', onClick);
            props.editor.on('selectionUpdate', (event) => {
                clearTimeout(selectDebounce);
                selectDebounce = setTimeout(() => {
                    const from = Math.min(
                        ...event.transaction.selection.ranges.map(
                            (range) => range.$from.pos,
                        ),
                    );
                    const to = Math.max(
                        ...event.transaction.selection.ranges.map(
                            (range) => range.$to.pos,
                        ),
                    );
                    if (from !== to) {
                        const bBox = posToDOMRect(event.editor.view, from, to);
                        toolbarPosition.value = {
                            top: bBox.top + document.body.scrollTop - 50,
                            left:
                                bBox.left +
                                document.body.scrollLeft +
                                (bBox.right - bBox.left) / 2,
                        };
                        if (container.value && toolbarPosition.value) {
                            const containerBBox =
                                container.value?.getBoundingClientRect();
                            toolbarPosition.value.left -=
                                containerBBox.width / 2;
                        }
                        if (
                            toolbarPosition.value &&
                            toolbarPosition.value.left < 0
                        ) {
                            toolbarPosition.value.left = 0;
                        }
                    } else {
                        toolbarPosition.value = undefined;
                    }
                }, 100);
            });
        });

        onBeforeUnmount(() => {
            window.removeEventListener('click', onClick);
        });

        return () => (
            <Teleport to={`body`}>
                <div
                    ref={container}
                    class={`max-w-full`}
                    style={
                        toolbarPosition.value
                            ? {
                                  display: 'block',
                                  position: 'absolute',
                                  transition: 'all 0.3s',
                                  opacity: '1',
                                  top: toolbarPosition.value.top + 'px',
                                  left: toolbarPosition.value.left + 'px',
                                  zIndex: 100000000,
                              }
                            : {
                                  position: 'absolute',
                                  display: 'block',
                                  height: '0px',
                                  overflow: 'hidden',
                                  transition: 'all 0.3s',
                                  opacity: '0',
                              }
                    }
                >
                    <div
                        class={`relative flex items-center gap-4 px-4 py-2 rounded-2.5 shadow-xl bg-light dark:bg-darkGray`}
                    >
                        {navItems.value
                            .filter((e) => e.visible())
                            .map((navItem) => {
                                return navItemComponent(navItem);
                            })}
                    </div>
                </div>
            </Teleport>
        );
    },
});

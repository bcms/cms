import { Editor, BubbleMenu } from '@tiptap/vue-3';
import { computed, defineComponent, onBeforeUpdate, ref } from 'vue';
import { DefaultComponentProps } from '../_default';
import { BCMSIcon } from '../index';
import { useTranslation } from '../../translations';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    editor: Editor,
  },
  setup(props) {
    const headings: [1, 2, 3, 4, 5, 6] = [1, 2, 3, 4, 5, 6];
    const isTextDropdownActive = ref(false);
    const inList = ref(false);
    let mounted = false;

    const translations = computed(() => {
      return useTranslation();
    });

    const filteredHeadings = computed(() => {
      return headings.filter((e) => {
        return !props.editor?.isActive('heading', {
          level: e,
        });
      });
    });

    onBeforeUpdate(() => {
      if (props.editor && !mounted) {
        mounted = true;
        const editor = props.editor;
        props.editor.on('selectionUpdate', () => {
          const olAttrs = editor.getAttributes('orderedList');
          const ulAttrs = editor.getAttributes('bulletList');
          const liAttrs = editor.getAttributes('listItem');

          if (
            typeof olAttrs.start !== 'undefined' ||
            typeof ulAttrs.list !== 'undefined' ||
            typeof liAttrs.list !== 'undefined'
          ) {
            inList.value = true;
          } else {
            inList.value = false;
          }
        });
      }
    });

    return () => (
      <>
        {props.editor ? (
          <BubbleMenu
            class={props.class}
            editor={props.editor}
            shouldShow={(data) => {
              if (data.from === data.to) {
                return false;
              }
              const widgetAttrs = props.editor?.getAttributes('widget');
              if (widgetAttrs?.widget) {
                return false;
              } else {
                return true;
              }
            }}
          >
            {!inList.value ? (
              <button
                class={[
                  'w-8 h-8 flex justify-center items-center rounded transition-colors duration-200 hover:bg-grey hover:bg-opacity-10 hover:text-green focus:bg-grey focus:bg-opacity-10 focus:text-green xs:w-12 xs:h-12',
                  props.editor.isActive('heading') ? 'text-green' : undefined,
                ]}
                onClick={() => {
                  isTextDropdownActive.value = true;
                }}
              >
                <BCMSIcon
                  class="w-5 h-5 fill-current xs:w-6 xs:h-6"
                  src="/editor/text"
                />
              </button>
            ) : (
              ''
            )}
            <button
              class={[
                'w-8 h-8 flex justify-center items-center rounded transition-colors duration-200 hover:bg-grey hover:bg-opacity-10 hover:text-green focus:bg-grey focus:bg-opacity-10 focus:text-green xs:w-12 xs:h-12',
                props.editor.isActive('bold') ? 'text-green' : undefined,
              ]}
              onClick={() => {
                (props.editor as Editor).chain().focus().toggleBold().run();
              }}
            >
              <BCMSIcon
                class="w-5 h-5 fill-current xs:w-6 xs:h-6"
                src="/editor/bold"
              />
            </button>
            <button
              class={[
                'w-8 h-8 flex justify-center items-center rounded transition-colors duration-200 hover:bg-grey hover:bg-opacity-10 hover:text-green focus:bg-grey focus:bg-opacity-10 focus:text-green xs:w-12 xs:h-12',
                props.editor.isActive('inlineCode') ? 'text-green' : undefined,
              ]}
              onClick={() => {
                (props.editor as Editor)
                  .chain()
                  .focus()
                  .toggleInlineCode()
                  .run();
              }}
            >
              <BCMSIcon class="w-5 h-5 xs:w-6 xs:h-6" src="/editor/terminal" />
            </button>
            <button
              class={[
                'w-8 h-8 flex justify-center items-center rounded transition-colors duration-200 hover:bg-grey hover:bg-opacity-10 hover:text-green focus:bg-grey focus:bg-opacity-10 focus:text-green xs:w-12 xs:h-12',
                props.editor.isActive('italic') ? 'text-green' : undefined,
              ]}
              onClick={() => {
                (props.editor as Editor).chain().focus().toggleItalic().run();
              }}
            >
              <BCMSIcon
                class="w-5 h-5 fill-current xs:w-6 xs:h-6"
                src="/editor/italic"
              />
            </button>
            <button
              class={[
                'w-8 h-8 flex justify-center items-center rounded transition-colors duration-200 hover:bg-grey hover:bg-opacity-10 hover:text-green focus:bg-grey focus:bg-opacity-10 focus:text-green xs:w-12 xs:h-12',
                props.editor.isActive('underline') ? 'text-green' : undefined,
              ]}
              onClick={() => {
                (props.editor as Editor)
                  .chain()
                  .focus()
                  .toggleUnderline()
                  .run();
              }}
            >
              <BCMSIcon
                class="w-5 h-5 fill-current xs:w-6 xs:h-6"
                src="/editor/underline"
              />
            </button>
            <button
              class={[
                'w-8 h-8 flex justify-center items-center rounded transition-colors duration-200 hover:bg-grey hover:bg-opacity-10 hover:text-green focus:bg-grey focus:bg-opacity-10 focus:text-green xs:w-12 xs:h-12',
                props.editor.isActive('strike') ? 'text-green' : undefined,
              ]}
              onClick={() => {
                (props.editor as Editor).chain().focus().toggleStrike().run();
              }}
            >
              <BCMSIcon
                class="w-5 h-5 fill-current stroke-current xs:w-6 xs:h-6"
                src="/editor/strike"
              />
            </button>
            <button
              class={[
                'w-8 h-8 flex justify-center items-center rounded transition-colors duration-200 hover:bg-grey hover:bg-opacity-10 hover:text-green focus:bg-grey focus:bg-opacity-10 focus:text-green xs:w-12 xs:h-12',
                props.editor.isActive('link') ? 'text-green' : undefined,
              ]}
              onClick={() => {
                const editor = props.editor as Editor;
                let href = '';
                if (editor.isActive('link')) {
                  href = editor.getAttributes('link').href;
                  // editor.chain().focus().unsetLink().run();
                }
                window.bcms.modal.content.link.show({
                  href,
                  onDone(data) {
                    if (data.href) {
                      editor
                        .chain()
                        .focus()
                        .extendMarkRange('link')
                        .setLink({ href: data.href })
                        .run();
                    } else {
                      editor
                        .chain()
                        .focus()
                        .extendMarkRange('link')
                        .unsetLink()
                        .run();
                    }
                  },
                });
              }}
            >
              <BCMSIcon
                class="w-5 h-5 fill-current xs:w-6 xs:h-6"
                src="/editor/link"
              />
            </button>
            {!inList.value ? (
              <>
                <button
                  class={[
                    'w-8 h-8 flex justify-center items-center rounded transition-colors duration-200 hover:bg-grey hover:bg-opacity-10 hover:text-green focus:bg-grey focus:bg-opacity-10 focus:text-green xs:w-12 xs:h-12',
                    props.editor.isActive('codeBlock')
                      ? 'text-green'
                      : undefined,
                  ]}
                  onClick={() => {
                    (props.editor as Editor)
                      .chain()
                      .focus()
                      .toggleCodeBlock()
                      .run();
                  }}
                >
                  <BCMSIcon
                    class="w-5 h-5 fill-current xs:w-6 xs:h-6"
                    src="/editor/code"
                  />
                </button>
                <button
                  class={[
                    'w-8 h-8 flex justify-center items-center rounded transition-colors duration-200 hover:bg-grey hover:bg-opacity-10 hover:text-green focus:bg-grey focus:bg-opacity-10 focus:text-green xs:w-12 xs:h-12',
                    props.editor.isActive('bulletList')
                      ? 'text-green'
                      : undefined,
                  ]}
                  onClick={() => {
                    (props.editor as Editor)
                      .chain()
                      .focus()
                      .toggleBulletList()
                      .run();
                  }}
                >
                  <BCMSIcon
                    class="w-5 h-5 fill-current xs:w-6 xs:h-6"
                    src="/editor/list-ul"
                  />
                </button>
                <button
                  class={[
                    'w-8 h-8 flex justify-center items-center rounded transition-colors duration-200 hover:bg-grey hover:bg-opacity-10 hover:text-green focus:bg-grey focus:bg-opacity-10 focus:text-green xs:w-12 xs:h-12',
                    props.editor.isActive('orderedList')
                      ? 'text-green'
                      : undefined,
                  ]}
                  onClick={() => {
                    (props.editor as Editor)
                      .chain()
                      .focus()
                      .toggleOrderedList()
                      .run();
                  }}
                >
                  <BCMSIcon
                    class="w-5 h-5 fill-current xs:w-6 xs:h-6"
                    src="/editor/list-ol"
                  />
                </button>
              </>
            ) : (
              ''
            )}
            {isTextDropdownActive.value && (
              <div
                class="textDropdown absolute top-12 left-0 pt-4 w-80 max-w-full"
                v-clickOutside={() => (isTextDropdownActive.value = false)}
              >
                <div class="textDropdown--inner relative bg-white rounded-2.5 pt-5 pb-1 shadow-cardLg">
                  <div class="text-dark leading-normal uppercase tracking-0.06 text-xs px-5 mb-2.5">
                    {translations.value.page.entry.convertTo}
                  </div>
                  <div class="flex flex-col">
                    {!props.editor?.isActive('paragraph') && (
                      <button
                        class={[
                          `group flex items-center px-5 py-3.5 transition-colors duration-200 hover:text-green hover:bg-grey hover:bg-opacity-10 focus:text-green focus:bg-grey focus:bg-opacity-10`,
                          props.editor?.isActive('paragraph')
                            ? 'text-green'
                            : undefined,
                        ]}
                        onClick={() => {
                          (props.editor as Editor)
                            .chain()
                            .focus()
                            .clearNodes()
                            .run();
                          isTextDropdownActive.value = false;
                        }}
                      >
                        <BCMSIcon
                          class="w-5 h-5 fill-current mr-5"
                          src="/editor/text"
                        />
                        <span
                          class={[
                            '-tracking-0.01 leading-tight mt-1 transition-colors duration-200 group-hover:text-green group-focus:text-green',
                            props.editor?.isActive('paragraph')
                              ? 'text-green font-semibold'
                              : 'text-dark',
                          ]}
                        >
                          Paragraph
                        </span>
                      </button>
                    )}
                    {filteredHeadings.value.map((headingLvl) => {
                      return (
                        <button
                          key={headingLvl}
                          class={[
                            `group flex items-center px-5 py-3.5 transition-colors duration-200 hover:text-green hover:bg-grey hover:bg-opacity-10 focus:text-green focus:bg-grey focus:bg-opacity-10`,
                            props.editor?.isActive('heading', {
                              level: headingLvl,
                            })
                              ? 'text-green'
                              : undefined,
                          ]}
                          onClick={() => {
                            (props.editor as Editor)
                              .chain()
                              .focus()
                              .toggleHeading({
                                level: headingLvl,
                              })
                              .run();
                            isTextDropdownActive.value = false;
                          }}
                        >
                          <BCMSIcon
                            class="w-5 h-5 fill-current mr-4 xs:w-6 xs:h-6"
                            src={`/editor/heading/h${headingLvl}`}
                          />
                          <span
                            class={[
                              '-tracking-0.01 leading-tight mt-1 transition-colors duration-200 group-hover:text-green group-focus:text-green',
                              props.editor?.isActive('heading', {
                                level: headingLvl,
                              })
                                ? 'text-green font-semibold'
                                : 'text-dark',
                            ]}
                          >
                            {translations.value.page.entry.heading} {headingLvl}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </BubbleMenu>
        ) : (
          ''
        )}
      </>
    );
  },
});
export default component;

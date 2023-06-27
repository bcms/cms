import {
  computed,
  defineComponent,
  onBeforeUpdate,
  onMounted,
  type PropType,
} from 'vue';
import { DefaultComponentProps } from '../_default';
import BCMSImage from '../image';
import BCMSIcon from '../icon';
import BCMSLink from '../link';
import BCMSTextArea from './text-area';
import {
  type BCMSMedia,
  type BCMSPropValueMediaData,
  BCMSMediaType,
} from '@becomes/cms-sdk/types';
import { useTranslation } from '../../translations';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    value: {
      type: Object as PropType<BCMSPropValueMediaData>,
      default: () => {
        return {
          _id: '',
        };
      },
    },
    label: {
      type: String,
      default: '',
    },
    showLink: {
      type: Boolean,
      default: true,
    },
    invalidText: {
      type: String,
      default: '',
    },
    showAlt: {
      type: Boolean,
      default: true,
    },
    showCaption: {
      type: Boolean,
      default: true,
    },
    propPath: String,
  },
  emits: {
    clear: () => {
      return true;
    },
    click: () => {
      return true;
    },
    altTextChange: (_value: string) => {
      return true;
    },
    captionChange: (_value: string) => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });
    const throwable = window.bcms.util.throwable;
    const store = window.bcms.vue.store;
    const broken = computed(() => {
      if (props.value._id) {
        const m = store.getters.media_findOne((e) => e._id === props.value._id);
        if (!m) {
          return true;
        }
      }
      return false;
    });
    const media = computed<
      { data: BCMSMedia; src: string; type: BCMSMediaType } | undefined
    >(() => {
      const m = store.getters.media_findOne((e) => e._id === props.value._id);
      if (!m) {
        return undefined;
      }
      return {
        data: m,
        src: m.name,
        type: m.type,
      };
    });
    let idBuffer = '' + props.value._id;

    async function getMedia() {
      await throwable(
        async () => {
          await window.bcms.sdk.media.getById(idBuffer);
        },
        undefined,
        async () => {
          // Do nothing
        }
      );
    }

    onMounted(async () => {
      if (!media.value && idBuffer) {
        getMedia();
      }
    });
    onBeforeUpdate(async () => {
      if (idBuffer !== props.value._id) {
        idBuffer = props.value._id;
        if (!media.value && idBuffer.length === 24) {
          await getMedia();
        }
      }
    });

    return () => (
      <div class="bcmsMedia">
        <div
          class="flex flex-col"
          data-bcms-prop-path={props.propPath + '._id'}
        >
          {props.label && (
            <span class="font-normal not-italic text-xs leading-normal tracking-0.06 uppercase select-none mb-1.25 block dark:text-light">
              {props.label}
            </span>
          )}
          <div
            class={`group flex p-2.5 rounded-3.5 border border-dotted  bg-light ${
              (props.invalidText && !props.value._id) || broken.value
                ? ' border-red'
                : 'border-green dark:border-yellow'
            } ${props.class} dark:bg-darkGrey`}
          >
            {props.value ? (
              <>
                <button
                  onClick={() => {
                    ctx.emit('click');
                  }}
                  class={`group flex items-center ${
                    !media.value ? (broken.value ? '' : 'justify-center') : ''
                  } text-dark text-sm leading-tight flex-grow text-left h-20`}
                >
                  {(media.value || broken.value) && (
                    <div
                      class={`flex mr-5 flex-shrink-0 w-14 h-14 rounded-2.5 overflow-hidden ${
                        broken.value
                          ? 'border border-red bg-red bg-opacity-10 items-center justify-center'
                          : ''
                      } md:w-20 md:h-20`}
                    >
                      {media.value ? (
                        <>
                          {media.value.data.type === BCMSMediaType.IMG ||
                          media.value.data.type === BCMSMediaType.VID ||
                          media.value.data.type === BCMSMediaType.GIF ? (
                            <BCMSImage
                              media={media.value.data}
                              alt=""
                              class={`w-full h-full object-cover object-center fill-current rounded-2.5 ${
                                media.value ? 'text-grey' : 'text-red'
                              }`}
                            />
                          ) : (
                            <BCMSIcon
                              src="/file"
                              class={`w-15 h-15 text-grey fill-current mt-2`}
                            />
                          )}
                          {/* <BCMSImage
                            class={`w-full h-full object-cover object-center fill-current rounded-2.5 ${
                              media.value ? 'text-grey' : 'text-red'
                            }`}
                            media={media.value.data}
                            alt=""
                          /> */}
                        </>
                      ) : (
                        broken.value && (
                          <BCMSIcon
                            src="/close"
                            class="w-6 h-6 text-red fill-current"
                          />
                        )
                      )}
                    </div>
                  )}
                  <div class="flex flex-col items-start justify-center">
                    {props.invalidText && !media.value?.data._id && (
                      <div
                        class={`font-medium text-base leading-normal text-center -tracking-0.01 w-full self-center group-hover:underline ${
                          props.invalidText
                            ? 'text-red'
                            : 'text-green dark:text-yellow'
                        }`}
                      >
                        {props.invalidText}
                      </div>
                    )}
                    {broken.value ||
                      (media.value && (
                        <div
                          class={`line-clamp-1 break-all ${
                            media.value ? '' : 'text-red'
                          } dark:text-light`}
                        >
                          {media.value
                            ? media.value.src
                            : broken.value
                            ? 'Broken file - file does not exist any more.'
                            : 'No media selected.'}
                        </div>
                      ))}
                    {!props.invalidText && (
                      <div
                        class={`font-medium text-base leading-normal text-left line-clamp-2 -tracking-0.01 ${
                          media.value ? 'mt-2.5' : ''
                        } ${
                          broken.value
                            ? 'text-red'
                            : 'text-green dark:text-yellow'
                        } group-hover:underline`}
                      >
                        {media.value
                          ? translations.value.input.media.selectAnotherMedia
                          : broken.value
                          ? translations.value.input.media.error.brokenMedia
                          : translations.value.input.media.selectMedia}
                      </div>
                    )}
                  </div>
                </button>
                {media.value && props.showLink && (
                  <BCMSLink
                    href={`/dashboard/media?search=${encodeURIComponent(
                      media.value.data._id
                    )}`}
                    class="group-scope flex items-center justify-center w-15 h-20 text-grey hover:text-dark focus-visible:text-dark dark:text-light dark:hover:text-yellow dark:focus-visible:text-yellow"
                  >
                    <BCMSIcon
                      src="/link"
                      class="w-5.5 h-5.5 relative fill-current transition-all duration-300 translate-x-1.5 md:opacity-0 md:group-hover:opacity-100 md:group-hover:translate-x-0 md:group-hover:translate-y-0"
                    />
                  </BCMSLink>
                )}
                {(media.value || broken.value) && (
                  <button
                    aria-label="clear"
                    class="group-scope flex items-center justify-center w-15 h-20 text-grey hover:text-dark focus-visible:text-dark dark:text-light dark:hover:text-yellow dark:focus-visible:text-yellow"
                    onClick={() => {
                      ctx.emit('clear');
                    }}
                  >
                    <BCMSIcon
                      src="/trash"
                      class="w-6 h-6 relative fill-current transition-all duration-300 translate-x-1.5 md:opacity-0 md:group-hover:opacity-100 md:group-hover:translate-x-0 md:group-hover:translate-y-0"
                    />
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  ctx.emit('click');
                }}
                class="group flex text-dark text-sm leading-tight flex-grow text-left h-20"
              >
                <div
                  class={`font-medium text-base leading-normal text-center -tracking-0.01 w-full self-center group-hover:underline ${
                    props.invalidText
                      ? 'text-red'
                      : 'text-green dark:text-yellow'
                  }`}
                >
                  {' '}
                  {props.invalidText
                    ? translations.value.input.media.error.emptyMedia
                    : translations.value.input.media.selectMedia}
                </div>
              </button>
            )}
          </div>
        </div>
        {props.showAlt && (
          <BCMSTextArea
            data-bcms-prop-path={props.propPath + '.alt_text'}
            class="mt-5"
            label="Alt text"
            placeholder="Alt text"
            value={props.value.alt_text}
            onInput={(value) => {
              ctx.emit('altTextChange', value);
            }}
          />
        )}
        {props.showCaption && (
          <BCMSTextArea
            data-bcms-prop-path={props.propPath + '.caption'}
            class="mt-5"
            label="Caption"
            placeholder="Caption"
            value={props.value.caption}
            onInput={(value) => {
              ctx.emit('captionChange', value);
            }}
          />
        )}
      </div>
    );
  },
});
export default component;

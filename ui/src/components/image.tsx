import { defineComponent, onBeforeUpdate, onMounted, type PropType, ref } from 'vue';
import type { BCMSMedia } from '@becomes/cms-sdk/types';
import { BCMSMediaType } from '@becomes/cms-sdk/types';
import { DefaultComponentProps } from './_default';
import BCMSIcon from './icon';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    alt: {
      type: String,
      required: true,
    },
    media: Object as PropType<BCMSMedia>,
    fullQuality: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const throwable = window.bcms.util.throwable;
    const src = ref(`${window.bcms.origin}/assets/file.svg`);
    const exist = ref(true);
    let lastMedia: BCMSMedia | null = null;

    async function setSrc(media: BCMSMedia) {
      await throwable(
        async () => {
          await window.bcms.sdk.isLoggedIn();
        },
        async () => {
          if (
            media.type === BCMSMediaType.VID ||
            media.type === BCMSMediaType.GIF
          ) {
            src.value = `${window.bcms.origin}/api/media/${
              media._id
            }/vid/bin/thumbnail?act=${window.bcms.sdk.storage.get('at')}`;
          } else {
            src.value = `${window.bcms.origin}/api/media/${
              media._id
            }/bin/small/act?act=${window.bcms.sdk.storage.get('at')}`;
          }
        }
      );
    }

    onMounted(async () => {
      if (props.media) {
        lastMedia = props.media;
        await setSrc(props.media);
      }
    });
    onBeforeUpdate(async () => {
      if (!lastMedia && props.media) {
        lastMedia = props.media;
        await setSrc(props.media);
      } else if (
        props.media &&
        lastMedia &&
        lastMedia._id !== props.media._id
      ) {
        lastMedia = props.media;
        await setSrc(props.media);
      }
    });

    return () => (
      <>
        {props.media ? (
          <>
            {props.media.type === BCMSMediaType.IMG ||
            props.media.type === BCMSMediaType.GIF ||
            props.media.type === BCMSMediaType.VID ? (
              <img
                id={props.id}
                src={src.value}
                alt={props.alt}
                class={props.class}
                style={`${exist.value ? '' : 'background-color: red;'}${
                  props.style
                }`}
                title={
                  props.media
                    ? `${props.media.name}\n\nWidth: ${props.media.width}px\nHeight: ${props.media.height}px`
                    : ''
                }
                draggable="false"
              />
            ) : (
              <BCMSIcon
                class={`fill-current text-grey ${props.class}`}
                src="/file"
              />
            )}
          </>
        ) : (
          <BCMSIcon id={props.id} class={props.class} src="/broken-file" />
        )}
      </>
    );
  },
});
export default component;

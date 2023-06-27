import { computed, defineComponent, ref } from 'vue';
import Modal from '../_modal';
import {
  BCMSMediaInput,
  BCMSMultiSelect,
  BCMSSelect,
  BCMSTextInput,
} from '../../input';
import type {
  BCMSContentEditorLinkModalInputData,
  BCMSContentEditorLinkModalOutputData,
  BCMSModalInputDefaults,
  BCMSMultiSelectItemExtended,
} from '../../../types';
import { useTranslation } from '../../../translations';
import {
  type BCMSEntryLite,
  BCMSJwtRoleName,
  BCMSPropType,
  type BCMSPropValueMediaData,
} from '@becomes/cms-sdk/types';
import { BCMSPropWrapper } from '../../props/_wrapper';
import { BCMSSpinner } from '../../spinner';

interface Data
  extends BCMSModalInputDefaults<BCMSContentEditorLinkModalOutputData> {
  href: {
    value: string;
    error: string;
  };
}

const component = defineComponent({
  setup() {
    const store = window.bcms.vue.store;
    const translations = computed(() => {
      return useTranslation();
    });
    const type = ref<'url' | 'media' | 'entry'>('url');
    const mediaData = ref<BCMSPropValueMediaData>({
      _id: '',
      alt_text: '',
      caption: '',
    });
    const entryData = ref<BCMSEntryLite>({
      cid: '',
      templateId: '',
      userId: '',
      meta: [],
      _id: '',
      createdAt: 0,
      updatedAt: 0,
    });
    const entryDataLoading = ref(false);
    let entriesInitialized = false;
    const entriesLite = computed<BCMSMultiSelectItemExtended[]>(() => {
      const output: BCMSMultiSelectItemExtended[] = [];
      const items = store.getters.entryLite_items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const template = store.getters.template_findOne(
          (e) => e._id === item.templateId,
        );
        if (template) {
          output.push({
            ...window.bcms.entry.toMultiSelectOptions(item, template),
            selected: entryData.value._id === item._id,
          });
        }
      }
      return output.sort((a, b) => (b.title > a.title ? -1 : 1));
    });
    const show = ref(false);
    const modalData = ref<Data>(getData());

    window.bcms.modal.content.link = {
      hide() {
        show.value = false;
      },
      show(data) {
        modalData.value = getData(data);
        show.value = true;
      },
    };

    function getData(inputData?: BCMSContentEditorLinkModalInputData): Data {
      type.value = 'url';
      mediaData.value = {
        _id: '',
        alt_text: '',
        caption: '',
      };
      entryData.value = {
        cid: '',
        templateId: '',
        userId: '',
        meta: [],
        _id: '',
        createdAt: 0,
        updatedAt: 0,
      };
      const d: Data = {
        title: translations.value.modal.contentLink.title,
        href: {
          value: '',
          error: '',
        },
        onCancel() {
          // ...
        },
        onDone() {
          // ...
        },
      };
      if (inputData) {
        if (inputData.title) {
          d.title = inputData.title;
        }
        if (inputData.onDone) {
          d.onDone = inputData.onDone;
        }
        if (inputData.onCancel) {
          d.onCancel = inputData.onCancel;
        }
        if (inputData.href) {
          const href = inputData.href;
          if (href.startsWith('entry:')) {
            type.value = 'entry';
            const [eid, tid] = href.replace('entry:', '').split('@*_');
            initializeEntries(eid, tid);
          } else if (href.startsWith('media:')) {
            type.value = 'media';
            const [_id, alt_text, caption] = href
              .replace('media:', '')
              .split('@*_');
            mediaData.value = {
              _id,
              alt_text,
              caption,
            };
          }
          d.href.value = href;
        }
      }
      return d;
    }
    function cancel() {
      if (modalData.value.onCancel) {
        const result = modalData.value.onCancel();
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(error);
          });
        }
      }
      window.bcms.modal.content.link.hide();
    }
    function done() {
      if (modalData.value.onDone) {
        if (type.value === 'media') {
          mediaBuildHref();
        } else if (type.value === 'entry') {
          entryBuildHref();
        }
        const result = modalData.value.onDone({
          href: modalData.value.href.value,
        });
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(error);
          });
        }
      }
      window.bcms.modal.content.link.hide();
    }

    function mediaBuildHref() {
      if (mediaData.value._id) {
        modalData.value.href.value = `media:${mediaData.value._id}@*_${mediaData.value.alt_text}@*_${mediaData.value.caption}@*_:media`;
      } else {
        modalData.value.href.value = '';
      }
    }

    function entryBuildHref() {
      if (entryData.value._id && entryData.value.templateId) {
        modalData.value.href.value = `entry:${entryData.value._id}@*_${entryData.value.templateId}@*_:entry`;
      } else {
        modalData.value.href.value = '';
      }
    }

    async function initializeEntries(eid?: string, tid?: string) {
      await window.bcms.util.throwable(async () => {
        if (eid && tid) {
          const user = await window.bcms.sdk.user.get();
          const policy = user.customPool.policy;
          if (
            user.roles[0].name === BCMSJwtRoleName.ADMIN ||
            policy.templates.find((e) => e._id === tid)
          ) {
            const entry = await window.bcms.sdk.entry.getLite({
              templateId: tid,
              entryId: eid,
            });
            entryData.value = entry;
          }
        }
        if (!entriesInitialized) {
          entryDataLoading.value = true;
          const templates = await window.bcms.sdk.template.getAll();
          for (let i = 0; i < templates.length; i++) {
            const template = templates[i];
            await window.bcms.sdk.entry.getAllLite({
              templateId: template._id,
            });
          }
          entriesInitialized = true;
        }
      });
      entryDataLoading.value = false;
    }

    return () => {
      return (
        <Modal
          title={modalData.value.title}
          show={show.value}
          actionName="Set"
          onDone={done}
          onCancel={cancel}
        >
          <div>
            <BCMSSelect
              label={translations.value.modal.contentLink.input.type.label}
              selected={type.value}
              options={translations.value.modal.contentLink.input.type.options.map(
                (e) => {
                  return {
                    label: e.label,
                    value: e.value,
                  };
                },
              )}
              onChange={(event) => {
                if (type.value !== 'url' && event.value === 'url') {
                  modalData.value.href.value = '';
                } else if (event.value === 'entry') {
                  initializeEntries();
                }
                type.value = event.value as never;
              }}
            />
            {type.value === 'entry' ? (
              <BCMSMultiSelect
                class="mt-10"
                label="entry"
                title="entry"
                onlyOne
                items={entriesLite.value}
                onChange={(items) => {
                  if (items[0]) {
                    const [tid, eid] = items[0].id.split('-');
                    entryData.value._id = eid;
                    entryData.value.templateId = tid;
                  } else {
                    entryData.value._id = '';
                    entryData.value.templateId = '';
                  }
                  entryBuildHref();
                }}
              />
            ) : type.value === 'media' ? (
              <BCMSPropWrapper
                class="mt-10"
                id="link-media"
                prop={{
                  id: 'link-media',
                  data: [],
                  label: 'Select media',
                  required: true,
                  array: false,
                  type: BCMSPropType.MEDIA,
                }}
              >
                <BCMSMediaInput
                  value={mediaData.value}
                  onClick={() => {
                    window.bcms.modal.media.picker.show({
                      title: 'Select media',
                      media: window.bcms.vue.store.getters.media_findOne(
                        (parent) =>
                          parent._id ===
                          window.bcms.vue.store.getters.media_findOne(
                            (e) => e._id === mediaData.value._id,
                          )?.parentId,
                      ),
                      onDone: (data) => {
                        mediaData.value._id = data.media._id;
                        mediaBuildHref();
                      },
                    });
                  }}
                  onAltTextChange={(value) => {
                    mediaData.value.alt_text = value;
                    mediaBuildHref();
                  }}
                  onCaptionChange={(value) => {
                    mediaData.value.caption = value;
                    mediaBuildHref();
                  }}
                />
              </BCMSPropWrapper>
            ) : (
              <>
                <BCMSTextInput
                  class="mt-5"
                  label={translations.value.modal.contentLink.input.url.label}
                  invalidText={modalData.value.href.error}
                  focusOnLoad
                  value={modalData.value.href.value}
                  onInput={(value) => {
                    modalData.value.href.value = value;
                  }}
                />
              </>
            )}
          </div>
          <BCMSSpinner show={entryDataLoading.value} class="rounded-2.5" />
        </Modal>
      );
    };
  },
});
export default component;

import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  type PropType,
  ref,
  Transition,
} from 'vue';
import type { BCMSMedia, BCMSUserPolicyCRUD } from '@becomes/cms-sdk/types';
import { BCMSJwtRoleName, BCMSMediaType } from '@becomes/cms-sdk/types';
import BCMSMediaControls from './controls';
import BCMSMediaItem from './item';
import BCMSMediaBreadcrumb from './breadcrumb';
import type { BCMSMediaControlFilters } from '../../types';
import BCMSIcon from '../icon';
import type { UppyFile } from '@uppy/core';
import { BCMSSpinner } from '../spinner';
import { useRoute, useRouter } from 'vue-router';
import { BCMSButton, BCMSEmptyState } from '..';
import { useTranslation } from '../../translations';
import { setCookie } from '../../services';

interface MediaInView {
  dirs: BCMSMedia[];
  files: BCMSMedia[];
}

const CHUNK_SIZE = 18;
const lastState = {
  mediaId: '',
};
async function getMedia(
  targetMediaId?: string,
  media?: BCMSMedia[],
  filters?: BCMSMediaControlFilters,
  sortDirection?: -1 | 1,
): Promise<MediaInView> {
  const output: MediaInView = {
    dirs: [],
    files: [],
  };
  let m: BCMSMedia[] = [];
  if (media) {
    if (filters && filters.search.name) {
      if (filters.search.name) {
        for (let i = 0; i < media.length; i++) {
          const item = media[i];
          if (
            item.name
              .toLowerCase()
              .includes(filters.search.name.trim().toLowerCase()) ||
            item._id === filters.search.name
          ) {
            m.push(item);
          }
        }
      } else {
        m = media;
      }
    } else {
      if (targetMediaId) {
        m = media.filter((e) => e.parentId === targetMediaId);
      } else {
        m = media.filter((e) => e.isInRoot);
      }
    }
    if (filters && filters.options) {
      filters.options.forEach((option) => {
        if (option.dropdown?.selected.value) {
          m = m.filter((e) => e.type === option.dropdown?.selected.value);
        } else if (option.date && option.date.year !== -1) {
          m = m.filter((e) => {
            const date = new Date(e.updatedAt);
            return (
              date.getFullYear() === option.date?.year &&
              date.getMonth() + 1 === option.date.month &&
              date.getDate() === option.date.day
            );
          });
        }
      });
    }
  }

  m.forEach((item) => {
    if (item.type === BCMSMediaType.DIR) {
      output.dirs.push(item);
    } else {
      output.files.push(item);
    }
  });
  return sortMedia(output, sortDirection ? sortDirection : 1);
}
function sortMedia(media: MediaInView, direction: -1 | 1): MediaInView {
  return {
    dirs: media.dirs.sort((a, b) => (a.name > b.name ? direction : -direction)),
    files: media.files.sort((a, b) =>
      a.name > b.name ? direction : -direction,
    ),
  };
}

const component = defineComponent({
  props: {
    mode: {
      type: String as PropType<'view' | 'select'>,
      default: 'view',
    },
    media: Object as PropType<BCMSMedia>,
  },
  emits: {
    select: (_value: BCMSMedia) => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });
    const throwable = window.bcms.util.throwable;
    const router = useRouter();
    const route = useRoute();
    const store = window.bcms.vue.store;
    const media = computed(() => {
      return store.getters.media_items;
    });
    const mediaId = ref(props.media ? props.media._id : lastState.mediaId);
    const mediaInView = ref<MediaInView>({
      dirs: [],
      files: [],
    });
    const filters = ref<BCMSMediaControlFilters | undefined>(undefined);
    const selectedMedia = ref<BCMSMedia | null>(null);
    const atChunk = ref(0);
    const showToIndex = computed(() => {
      return CHUNK_SIZE + atChunk.value * CHUNK_SIZE;
    });
    const sortDirection = ref<1 | -1>(1);
    const isDropzoneDragOver = ref(false);
    const uploadSpinnerData = ref({
      active: false,
      fileName: '',
      progress: 0,
    });
    const handleDropzoneDrop = async (e: DragEvent) => {
      e.preventDefault();
      isDropzoneDragOver.value = false;
      const files = (e.dataTransfer as DataTransfer).files;
      createFiles([...files]);
    };
    const policy = computed<BCMSUserPolicyCRUD>(() => {
      const user = store.getters.user_me;
      if (user) {
        if (user.roles[0].name === BCMSJwtRoleName.ADMIN) {
          return {
            get: true,
            post: true,
            put: true,
            delete: true,
          };
        }
        return user.customPool.policy.media;
      } else {
        return {
          get: false,
          post: false,
          put: false,
          delete: false,
        };
      }
    });

    async function handleMediaClick(item: BCMSMedia) {
      if (props.mode === 'select') {
        if (item.type === BCMSMediaType.DIR) {
          mediaId.value = item._id;
          lastState.mediaId = mediaId.value;
          mediaInView.value = await getMedia(
            mediaId.value,
            media.value,
            filters.value,
            sortDirection.value,
          );
        } else {
          selectedMedia.value = item;
          ctx.emit('select', item);
        }
      } else if (props.mode === 'view') {
        if (item.type === BCMSMediaType.DIR) {
          if (item._id) {
            lastState.mediaId = item._id;
            mediaId.value = item._id;
            await router.push({
              path: `/dashboard/media/${item._id}`,
              replace: true,
            });
          } else {
            lastState.mediaId = '';
            mediaId.value = '';
            await router.push({
              path: '/dashboard/media',
              replace: true,
            });
          }
          if (filters.value) {
            filters.value = filters.value.clear();
          }
          mediaInView.value = await getMedia(
            mediaId.value,
            media.value,
            filters.value,
            sortDirection.value,
          );
        } else {
          if (await window.bcms.sdk.isLoggedIn()) {
            setCookie('bcmsat', window.bcms.sdk.storage.get('at') || '', 60);
            window.open(
              window.location.href.split('/').slice(0, 3).join('/') +
                `/api/media/${item._id}/bin/act`,
              '_blank',
            );
          }
        }
      }
    }
    async function createDir(name: string) {
      const parentId = mediaId.value ? mediaId.value : undefined;
      await throwable(
        async () => {
          await window.bcms.sdk.media.createDir({
            name,
            parentId,
          });
        },
        async () => {
          mediaInView.value = await getMedia(
            mediaId.value,
            media.value,
            filters.value,
            sortDirection.value,
          );
        },
      );
    }
    async function removeMedia(target: BCMSMedia) {
      if (
        await window.bcms.confirm(
          translations.value.page.media.confirm.delete.title({
            label: target.name,
          }),
          `${translations.value.page.media.confirm.delete.description({
            label: target.name,
          })} ${
            target.type === BCMSMediaType.DIR
              ? translations.value.page.media.confirm.delete.dirDescription
              : ''
          }`,
        )
      ) {
        await throwable(
          async () => {
            await window.bcms.sdk.media.deleteById(target._id);
          },
          async () => {
            mediaInView.value = await getMedia(
              mediaId.value,
              media.value,
              filters.value,
              sortDirection.value,
            );
            window.bcms.notification.success(
              translations.value.page.media.notification.mediaDeleteSuccess,
            );
          },
        );
      }
    }
    async function preProcessFiles(files: UppyFile[]) {
      await createFiles(
        files.map((e) => {
          if (e.data instanceof Blob) {
            return new File([e.data as Blob], e.name, {
              type: e.type,
            });
          }
          return e.data as File;
        }),
      );
    }
    async function createFiles(files: File[]) {
      uploadSpinnerData.value.active = true;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await throwable(async () => {
          await window.bcms.sdk.media.createFile({
            file,
            parentId: mediaId.value,
            onProgress(event: {
              fileName: string;
              loaded: number;
              total: number;
            }) {
              uploadSpinnerData.value.fileName = file.name;
              uploadSpinnerData.value.progress =
                (event.loaded * 100) / event.total;
            },
          });
        });
      }
      mediaInView.value = await getMedia(
        mediaId.value,
        media.value,
        filters.value,
        sortDirection.value,
      );
      uploadSpinnerData.value.active = false;
    }
    function onScroll(event: Event) {
      const el = event.target as HTMLBodyElement;
      if (
        showToIndex.value < media.value.length &&
        el.scrollTop + el.offsetHeight === el.scrollHeight
      ) {
        atChunk.value++;
      }
    }

    document.body.addEventListener('scroll', onScroll);
    const scrollModalUnsub = window.bcms.modal.media.picker.subscribe
      ? window.bcms.modal.media.picker.subscribe('scroll', onScroll)
      : undefined;

    const handleDragover = (event: MouseEvent) => {
      event.preventDefault();
      isDropzoneDragOver.value = true;
    };
    const handleDragleave = (event: MouseEvent) => {
      event.preventDefault();
      isDropzoneDragOver.value = false;
    };

    onMounted(async () => {
      document.addEventListener('dragover', handleDragover);
      document.addEventListener('dragleave', handleDragleave);
      await throwable(async () => {
        await window.bcms.sdk.media.getAll();
      });
      if (route.path.startsWith('/dashboard/media')) {
        if (
          !lastState.mediaId &&
          route.params.id &&
          route.params.id !== lastState.mediaId
        ) {
          lastState.mediaId = route.params.id as string;
          mediaId.value = lastState.mediaId;
          await router.push({
            path: `/dashboard/media/${lastState.mediaId}`,
            replace: true,
          });
        } else if (
          !route.params.id &&
          lastState.mediaId &&
          route.params.id !== lastState.mediaId
        ) {
          mediaId.value = lastState.mediaId;
          await router.push({
            path: `/dashboard/media/${lastState.mediaId}`,
            replace: true,
          });
        }
      }
      mediaInView.value = await getMedia(
        mediaId.value,
        media.value,
        filters.value,
        sortDirection.value,
      );
    });

    onUnmounted(() => {
      document.body.removeEventListener('scroll', onScroll);
      document.removeEventListener('dragover', handleDragover);
      document.removeEventListener('dragleave', handleDragleave);
      if (scrollModalUnsub) {
        scrollModalUnsub();
      }
    });

    return () => (
      <>
        <Transition name="fade">
          {isDropzoneDragOver.value && (
            <label
              class="fixed z-[999999] top-0 left-0 w-full h-full flex items-center justify-center p-4 border-4 border-green transition-opacity duration-300 backdrop-blur-sm dark:border-yellow"
              onDragenter={(event) => event.preventDefault()}
              onDrop={handleDropzoneDrop}
            >
              <input type="file" multiple class="sr-only" />
              <div class="text-3xl text-dark pointer-events-none dark:text-light">
                {translations.value.page.media.dropzone.title}
              </div>
            </label>
          )}
        </Transition>
        <BCMSMediaControls
          disableUploadFile={!policy.value.post}
          onUploadFile={() => {
            window.bcms.modal.media.upload.show({
              title: translations.value.modal.uploadMedia.title,
              onDone: async (data) => {
                await preProcessFiles(data.files);
              },
            });
          }}
          disableCreateFolder={!policy.value.post}
          onCreateFolder={() => {
            window.bcms.modal.media.addUpdateDir.show({
              title: translations.value.modal.addUpdateDirectory.title,
              mode: 'add',
              takenNames: mediaInView.value.dirs.map((e) => e.name),
              onDone: async (data) => {
                await createDir(data.name);
              },
            });
          }}
          onFilter={async (_filters) => {
            filters.value = _filters;
            mediaInView.value = await getMedia(
              mediaId.value,
              media.value,
              filters.value,
              sortDirection.value,
            );
          }}
        />
        <div class="mt-15 pb-7.5">
          <div
            class={`flex items-center justify-between ${
              props.mode === 'select' ? '' : 'mb-10'
            }`}
          >
            {mediaId.value ? (
              <BCMSMediaBreadcrumb
                targetMediaId={mediaId.value}
                onClick={async (data) => {
                  await handleMediaClick(data);
                }}
                class={`${props.mode === 'select' ? 'mb-5' : ''}`}
              />
            ) : (
              props.mode !== 'select' && (
                <div class="flex flex-col space-y-5">
                  <h1 class="text-9.5 -tracking-0.03 leading-none dark:text-light">
                    {translations.value.page.media.title}
                  </h1>
                  {mediaInView.value.dirs.length === 0 &&
                  mediaInView.value.files.length === 0 ? (
                    <div class="leading-tight -tracking-0.01 dark:text-grey">
                      {translations.value.page.media.emptyState.subtitle}
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              )
            )}
            {mediaInView.value.dirs.length > 0 ||
            mediaInView.value.files.length > 0 ? (
              <button
                onClick={() => {
                  sortDirection.value = sortDirection.value === 1 ? -1 : 1;
                  mediaInView.value = sortMedia(
                    mediaInView.value,
                    sortDirection.value,
                  );
                }}
                class="flex items-center transition-colors duration-300 group text-dark hover:text-opacity-60 focus-visible:text-opacity-60 dark:text-light"
              >
                <span class="text-xs leading-normal uppercase mr-1.5">
                  {translations.value.page.media.orderLabel}
                </span>
                <div class={sortDirection.value === 1 ? 'rotate-180' : ''}>
                  <BCMSIcon
                    src="/arrow/up"
                    class="w-3 h-3 transition-colors duration-300 fill-current"
                  />
                </div>
              </button>
            ) : (
              ''
            )}
          </div>
          {mediaInView.value.dirs.length > 0 ||
          mediaInView.value.files.length > 0 ? (
            <ul
              class={`list-none grid  ${
                props.mode === 'select'
                  ? 'grid-cols-[repeat(auto-fill,minmax(80px,1fr))] mt-7.5 gap-2.5 p-[5px]'
                  : 'grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[15px] desktop:gap-x-5 desktop:gap-y-7.5'
              }`}
            >
              {mediaInView.value.dirs.map((item) => {
                return (
                  <BCMSMediaItem
                    item={item}
                    onRemove={async () => {
                      await removeMedia(item);
                    }}
                    onOpen={async () => {
                      if (filters.value) {
                        filters.value.search.name = '';
                      }
                      await handleMediaClick(item);
                    }}
                    mode={props.mode}
                  />
                );
              })}
              {mediaInView.value.files.map((item, itemIndex) => {
                if (itemIndex < showToIndex.value) {
                  return (
                    <BCMSMediaItem
                      item={item}
                      selected={
                        !!selectedMedia.value &&
                        selectedMedia.value._id === item._id
                      }
                      disableRemove={!policy.value.delete}
                      onRemove={async () => {
                        await removeMedia(item);
                      }}
                      onOpen={async () => {
                        await handleMediaClick(item);
                      }}
                      mode={props.mode}
                      class={`${itemIndex === 0 ? 'col-start-1' : ''}`}
                    />
                  );
                } else {
                  return <li style="display: none;" />;
                }
              })}
              {showToIndex.value < mediaInView.value.files.length ? (
                <BCMSButton
                  kind="ghost"
                  onClick={() => {
                    atChunk.value++;
                  }}
                >
                  {translations.value.page.media.showMore}
                </BCMSButton>
              ) : (
                ''
              )}
            </ul>
          ) : (
            <>
              {props.mode === 'view' ? (
                <BCMSEmptyState
                  src="/media.png"
                  maxWidth="350px"
                  maxHeight="315px"
                  class="mt-20 md:absolute md:bottom-32 md:right-32"
                />
              ) : (
                <div class="mt-3 text-lg text-grey">
                  {translations.value.page.media.emptyFolder}
                </div>
              )}
            </>
          )}
        </div>
        <BCMSSpinner show={uploadSpinnerData.value.active}>
          <div class="text-light text-[22px]">
            {translations.value.page.media.spinnerTitle({
              label: uploadSpinnerData.value.fileName,
            })}
          </div>
          <div class="border border-light rounded-[5px] p-px flex max-w-[350px] w-full mt-2.5 mx-auto">
            <div
              class="bg-light h-[5px] rounded-[5px]"
              style={`width: ${uploadSpinnerData.value.progress}%;`}
            />
          </div>
        </BCMSSpinner>
      </>
    );
  },
});
export default component;

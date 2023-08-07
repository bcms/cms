import { defineComponent, computed, onMounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import {
  BCMSNotification,
  BCMSTooltip,
  BCMSHelp,
  BCMSNav,
  BCMSConfirmModal,
  BCMSPropAddModal,
  BCMSAddUpdateTemplateModal,
  BCMSPropEditModal,
  BCMSAddUpdateGroupModal,
  BCMSAddUpdateWidgetModal,
  BCMSMediaPickerModal,
  BCMSViewEntryModelModal,
  BCMSUploadMediaModal,
  BCMSAddUpdateMediaModal,
  BCMSEntryStatusModal,
  BCMSShowDescriptionExampleModal,
  BCMSWhereIsItUsedModal,
  BCMSContentEditorLinkModal,
  BCMSContentEditorAddWidgetModal,
  BCMSTemplateOrganizerCreateModal,
  BCMSEditorNodeNav,
  BCMSApiKeyAddUpdateModal,
  BCMSViewUserModal,
  BCMSGlobalSearch,
  BCMSMultiSelectModal,
  BCMSBackupModal,
  BCMSViewEntryPointerModal,
} from './components';
import { useBcmsStore } from './store';
import { bcmsFeatureLoader } from './util';

export const App = defineComponent({
  setup() {
    const store = useBcmsStore();
    const route = useRoute();
    const routeMeta = computed(
      () =>
        route.meta as {
          noLayout: boolean;
        },
    );

    const isLoggedIn = computed(() => {
      return !!store.getters.user_me;
    });

    onMounted(async () => {
      const theme = window.bcms.sdk.storage.get('theme');
      if (theme) {
        if (window.bcms.sdk.storage.get('theme') === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        if (
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
          window.bcms.sdk.storage.set('theme', 'dark');
          document.documentElement.classList.add('dark');
        } else {
          window.bcms.sdk.storage.set('theme', 'light');
          document.documentElement.classList.remove('dark');
        }
      }
      await window.bcms.util.throwable(async () => {
        await bcmsFeatureLoader();
      });
    });
    return () => (
      <>
        <div class={`bcmsLayout grid `}>
          {routeMeta.value.noLayout ? (
            <RouterView ref={route.fullPath} />
          ) : (
            <>
              <aside class="relative w-screen h-auto z-[999999] desktop:fixed desktop:h-screen desktop:top-0 desktop:left-0 desktop:w-[250px] lg:w-[300px]">
                <BCMSNav />
              </aside>
              <div id="managerNav" />
              <div class="bcmsLayout--body px-5 pb-10 max-w-[100vw] desktop:px-15 desktop:py-15 relative min-h-screen">
                {/* TODO: Transition must be used in v-slot */}
                {/* <Transition name="fade" mode="out-in" appear={true}> */}
                <RouterView ref={route.fullPath} />
                {/* </Transition> */}
              </div>
              <footer class="fixed bottom-0 right-0 flex items-center px-5 py-4 z-1000">
                <BCMSHelp cyTag="help" />
              </footer>
            </>
          )}

          <BCMSViewEntryModelModal />
          <BCMSAddUpdateGroupModal />
          <BCMSAddUpdateTemplateModal />
          <BCMSAddUpdateWidgetModal />
          <BCMSPropAddModal />
          <BCMSPropEditModal />
          <BCMSEntryStatusModal />
          <BCMSContentEditorLinkModal />
          <BCMSMediaPickerModal />
          <BCMSAddUpdateMediaModal />
          <BCMSUploadMediaModal />
          <BCMSViewEntryPointerModal />
          <BCMSConfirmModal />
          <BCMSShowDescriptionExampleModal />
          <BCMSWhereIsItUsedModal />
          <BCMSContentEditorAddWidgetModal />
          <BCMSTemplateOrganizerCreateModal />
          <BCMSApiKeyAddUpdateModal />
          <BCMSViewUserModal />
          <BCMSBackupModal />
          <BCMSMultiSelectModal />
          <BCMSNotification />
          <BCMSEditorNodeNav />
          <BCMSTooltip />
          <div id="bcmsSelectList" />
          <div id="bcmsOverflowList" />
          {isLoggedIn.value && <BCMSGlobalSearch />}
        </div>
      </>
    );
  },
});

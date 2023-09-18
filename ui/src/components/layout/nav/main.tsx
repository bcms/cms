import { computed, defineComponent, onMounted, ref, type Ref } from 'vue';
import {
  BCMSJwtRoleName,
  type BCMSTemplate,
  type BCMSTemplateOrganizer,
  type BCMSUserPolicyCRUD,
  type BCMSUserPolicyTemplate,
} from '@becomes/cms-sdk/types';
import type { BCMSNavItemMergeEvent, BCMSNavItemType } from '../../../types';
import BCMSIcon from '../../icon';
import BCMSNavItem from './item';
import { useRoute, useRouter } from 'vue-router';
import BCMSLogo from './logo';
import { useTranslation } from '../../../translations';
import { BCMSLastRoute } from '@ui/util';

interface OrganizerExtended extends BCMSTemplateOrganizer {
  templates: BCMSTemplate[];
}

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const throwable = window.bcms.util.throwable;
    const store = window.bcms.vue.store;
    const stringUtil = window.bcms.util.string;
    const router = useRouter();
    const route = useRoute();
    const isMobileNavOpen = ref(false);
    const user = computed(() => store.getters.user_me);
    const administration: Ref<{
      data: BCMSNavItemType[];
      show: boolean;
      extended: boolean;
    }> = computed(() => {
      if (user.value) {
        const path = route.path;
        let templatePath = `/dashboard/t${
          BCMSLastRoute.templates ? '/' + BCMSLastRoute.templates : ''
        }`;
        if (path.startsWith('/dashboard/t') && route.name === 'TemplateId') {
          templatePath = path;
        }
        let groupPath = `/dashboard/g${
          BCMSLastRoute.groups ? '/' + BCMSLastRoute.groups : ''
        }`;
        if (path.startsWith('/dashboard/g')) {
          groupPath = path;
        }
        let widgetPath = `/dashboard/w${
          BCMSLastRoute.widgets ? '/' + BCMSLastRoute.widgets : ''
        }`;
        if (path.startsWith('/dashboard/w')) {
          // const parts = path.split('/');
          // if (parts.length === 4) {
          //   widgetPath =
          //     widgetPath.split('/').slice(0, 3).join('/') + `/${parts[3]}`;
          // }
          widgetPath = path;
        }
        let mediaPath = '/dashboard/media';
        if (path.startsWith('/dashboard/media')) {
          mediaPath = path;
        }
        const settingsPath = '/dashboard/settings';
        let keyManagerPath = `/dashboard/key-manager${
          BCMSLastRoute.keyManager ? '/' + BCMSLastRoute.keyManager : ''
        }`;
        if (path.startsWith(keyManagerPath)) {
          keyManagerPath = path;
        }
        const isAdmin = user.value.roles[0].name === BCMSJwtRoleName.ADMIN;
        const data: BCMSNavItemType[] = [
          {
            type: 'child',
            name: translations.value.layout.nav.administration.template.label,
            onClick: (event) => {
              logic.onNavItemClick(templatePath, event);
            },
            href: templatePath,
            icon: '/administration/template',
            visible: isAdmin,
            selected: logic.isSelected('template', path),
          },
          {
            type: 'child',
            name: translations.value.layout.nav.administration.group.label,
            href: groupPath,
            onClick: (event) => {
              logic.onNavItemClick(groupPath, event);
            },
            icon: '/administration/group',
            visible: isAdmin,
            selected: logic.isSelected('group', path),
          },
          {
            type: 'child',
            name: translations.value.layout.nav.administration.widget.label,
            href: widgetPath,
            onClick: (event) => {
              logic.onNavItemClick(widgetPath, event);
            },
            icon: '/administration/widget',
            visible: isAdmin,
            selected: logic.isSelected('widget', path),
          },
          {
            type: 'child',
            name: translations.value.layout.nav.administration.media.label,
            href: mediaPath,
            onClick: (event) => {
              logic.onNavItemClick(mediaPath, event);
            },
            icon: '/administration/media',
            visible: isAdmin || user.value.customPool.policy.media.get,
            selected: logic.isSelected('media', path),
          },
          {
            type: 'child',
            name: translations.value.layout.nav.administration.settings.label,
            href: settingsPath,
            onClick: (event) => {
              logic.onNavItemClick(settingsPath, event);
            },
            icon: '/cog',
            visible: true,
            selected: logic.isSelected('settings', path),
          },
          {
            type: 'child',
            name: translations.value.layout.nav.administration.keyManager.label,
            href: keyManagerPath,
            onClick: (event) => {
              logic.onNavItemClick(keyManagerPath, event);
            },
            icon: '/administration/key',
            visible: isAdmin,
            selected: logic.isSelected('keyManager', path),
          },
        ];
        return {
          show: true,
          extended:
            !!data.find((e) => e.selected) ||
            store.getters.entryLite_items.length === 0,
          data,
        };
      }
      return {
        data: [],
        show: false,
        extended: false,
      };
    });
    const templates: Ref<{
      root?: BCMSNavItemType;
      show: boolean;
      extended: boolean;
    }> = computed(() => {
      if (user.value) {
        const organizers = store.getters.templateOrganizer_items;
        const tmps = store.getters.template_items;
        const isAdmin = user.value.roles[0].name === BCMSJwtRoleName.ADMIN;
        const policy = user.value.customPool.policy.templates;
        const items: BCMSNavItemType[] = logic.aggregateOrganizersAndTemplates({
          organizers,
          templates: tmps,
          isAdmin,
          policy,
        });

        return {
          show: tmps.length > 0,
          extended: templates.value
            ? templates.value.extended
            : tmps.length > 0,
          root: {
            id: 'root',
            draggableType: 'organizer',
            type: 'parent',
            name: translations.value.layout.nav.entry.label,
            visible: true,
            selected: templates.value
              ? templates.value.extended
              : tmps.length > 0,
            children: items,
          },
        };
      }
      return {
        root: undefined,
        show: false,
        extended: true,
      };
    });
    const pluginsList = ref<string[]>([]);
    const plugins: Ref<{
      data: BCMSNavItemType[];
      show: boolean;
      extended: boolean;
    }> = computed(() => {
      if (user.value) {
        const isAdmin = user.value.roles[0].name === BCMSJwtRoleName.ADMIN;
        const policy = user.value.customPool.policy.plugins;
        const data: BCMSNavItemType[] = pluginsList.value
          .filter(
            (e) =>
              isAdmin ||
              (policy && !!policy.find((p) => p.allowed && p.name === e)),
          )
          .map((e) => {
            const path = `/dashboard/plugin/${e}`;
            const navItem: BCMSNavItemType = {
              type: 'child',
              name: stringUtil.toPretty(e),
              href: path,
              onClick: (event) => {
                if (event) {
                  event.preventDefault();
                }
                isMobileNavOpen.value = false;
                router.push(path);
              },
              icon: '/wind',
              visible: true,
              selected: route.path.startsWith(path),
              ignoreSelected: true,
            };
            return navItem;
          })
          .sort((a, b) => (b.name < a.name ? 1 : -1));
        return {
          show: pluginsList.value.length > 0,
          extended: !!data.find((e) => e.selected),
          data,
        };
      }
      return {
        data: [],
        show: false,
        extended: true,
      };
    });

    const logic = {
      isSelected(
        target:
          | 'template'
          | 'group'
          | 'widget'
          | 'media'
          | 'entry'
          | 'settings'
          | 'keyManager',
        path: string,
      ): boolean {
        switch (target) {
          case 'template':
            {
              if (path === '/dashboard/t') {
                return true;
              } else {
                const parts = path.split('/');
                if (parts.length === 4 && parts[2] === 't') {
                  return true;
                }
              }
            }
            break;
          case 'group':
            {
              if (path === '/dashboard/g') {
                return true;
              } else {
                const parts = path.split('/');
                if (parts.length === 4 && parts[2] === 'g') {
                  return true;
                }
              }
            }
            break;
          case 'widget':
            {
              if (path === '/dashboard/w') {
                return true;
              } else {
                const parts = path.split('/');
                if (parts.length === 4 && parts[2] === 'w') {
                  return true;
                }
              }
            }
            break;
          case 'media':
            {
              if (path === '/dashboard/media') {
                return true;
              } else {
                const parts = path.split('/');
                if (parts.length === 4 && parts[2] === 'media') {
                  return true;
                }
              }
            }
            break;
          case 'settings':
            {
              if (path === '/dashboard/settings') {
                return true;
              }
            }
            break;
          case 'keyManager':
            {
              if (path === '/dashboard/key-manager') {
                return true;
              } else {
                const parts = path.split('/');
                if (parts.length === 4 && parts[2] === 'key-manager') {
                  return true;
                }
              }
            }
            break;
          case 'entry':
            {
              // TODO
            }
            break;
        }
        return false;
      },
      toggleMobileNav() {
        isMobileNavOpen.value = !isMobileNavOpen.value;
        if (isMobileNavOpen.value) {
          document.body.style.overflowY = 'hidden';
        } else {
          document.body.style.overflowY = 'auto';
        }
      },
      onNavItemClick(path: string, event?: Event) {
        if (event) {
          event.preventDefault();
          isMobileNavOpen.value = false;
          document.body.style.overflowY = 'auto';
          if (
            (event as MouseEventInit).metaKey ||
            (event as MouseEventInit).ctrlKey
          ) {
            const routeData = router.resolve({ path: path });
            window.open(routeData.href, '_blank');
          } else {
            router.push(path);
          }
        }
      },
      handleMerge(event: BCMSNavItemMergeEvent): void {
        const rootItem = templates.value.root as BCMSNavItemType;
        const result = logic.findNavItem([rootItem], event.targetId);
        if (result) {
          const targetItem = result.item;
          const srcItem = event.src;
          if (
            targetItem.parentId !== 'root' &&
            srcItem.parentId !== 'root' &&
            targetItem.parentId === srcItem.parentId
          ) {
            return;
          }
          if (
            targetItem.draggableType === 'template' &&
            srcItem.draggableType === 'template'
          ) {
            if (targetItem.parentId !== 'root') {
              throwable(async () => {
                const organizer = store.getters.templateOrganizer_findOne(
                  (e) => e._id === targetItem.parentId,
                );
                if (organizer) {
                  organizer.templateIds.push(srcItem.id as string);
                  await window.bcms.sdk.templateOrganizer.update({
                    _id: organizer._id,
                    templateIds: organizer.templateIds,
                  });
                }
              });
            } else {
              window.bcms.modal.templateOrganizer.create.show({
                async onDone(data) {
                  await throwable(async () => {
                    await window.bcms.sdk.templateOrganizer.create({
                      label: data.name,
                      templateIds: [
                        srcItem.id as string,
                        targetItem.id as string,
                      ],
                    });
                  });
                },
              });
            }
          } else if (targetItem.id === 'root' && srcItem.parentId !== 'root') {
            const organizer = store.getters.templateOrganizer_findOne(
              (e) => e._id === srcItem.parentId,
            );
            if (organizer) {
              throwable(async () => {
                organizer.templateIds = organizer.templateIds.filter(
                  (e) => e !== srcItem.id,
                );
                if (organizer.templateIds.length === 0) {
                  await window.bcms.sdk.templateOrganizer.deleteById(
                    organizer._id,
                  );
                } else {
                  await window.bcms.sdk.templateOrganizer.update({
                    _id: organizer._id,
                    templateIds: organizer.templateIds.filter(
                      (e) => e !== srcItem.id,
                    ),
                  });
                }
              });
            }
          } else if (
            targetItem.draggableType === 'organizer' &&
            srcItem.draggableType === 'template'
          ) {
            const organizer = store.getters.templateOrganizer_findOne(
              (e) => e._id === targetItem.id,
            );
            if (organizer) {
              throwable(async () => {
                if (srcItem.parentId !== 'root') {
                  const srcOrganizer = store.getters.templateOrganizer_findOne(
                    (e) => e._id === srcItem.parentId,
                  );
                  if (srcOrganizer) {
                    srcOrganizer.templateIds = srcOrganizer.templateIds.filter(
                      (e) => e !== srcItem.id,
                    );
                    if (srcOrganizer.templateIds.length === 0) {
                      await window.bcms.sdk.templateOrganizer.deleteById(
                        srcOrganizer._id,
                      );
                    } else {
                      await window.bcms.sdk.templateOrganizer.update({
                        _id: srcOrganizer._id,
                        templateIds: srcOrganizer.templateIds,
                      });
                    }
                  }
                }
                organizer.templateIds.push(srcItem.id as string);
                await window.bcms.sdk.templateOrganizer.update({
                  _id: organizer._id,
                  templateIds: organizer.templateIds,
                });
              });
            }
          }
        }
      },
      findNavItem(
        items: BCMSNavItemType[],
        id: string,
        index?: string[],
      ): { item: BCMSNavItemType; index: string[] } | null {
        if (!index) {
          index = [];
        }
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.id === id) {
            index.push(`${i}`);
            return {
              index,
              item,
            };
          } else if (item.children) {
            index.push('children');
            const result = logic.findNavItem(item.children, id, index);
            if (result) {
              return result;
            }
            index.pop();
          }
        }
        return null;
      },
      aggregateOrganizersAndTemplates(data: {
        organizers: BCMSTemplateOrganizer[];
        templates: BCMSTemplate[];
        isAdmin: boolean;
        policy: BCMSUserPolicyTemplate[];
      }): BCMSNavItemType[] {
        const items: BCMSNavItemType[] = [];
        const extendedOrgs: OrganizerExtended[] = [];
        const foundTemplateIds: string[] = [];
        for (let i = 0; i < data.organizers.length; i++) {
          const organizer = data.organizers[i];
          if (organizer.templateIds.length > 0) {
            const extendedOrg: OrganizerExtended = {
              ...organizer,
              templates: [],
            };
            for (let j = 0; j < organizer.templateIds.length; j++) {
              const templateId = organizer.templateIds[j];
              const template = data.templates.find((e) => e._id === templateId);
              if (template) {
                foundTemplateIds.push(template._id);
                extendedOrg.templates.push(template);
              }
            }
            extendedOrg.templates.sort((a, b) => (a.name < b.name ? -1 : 1));
            extendedOrgs.push(extendedOrg);
          }
        }
        if (foundTemplateIds.length !== data.templates.length) {
          for (let i = 0; i < data.templates.length; i++) {
            const template = data.templates[i];
            let path: string;
            if (template.singleEntry) {
              path = `/dashboard/t/${template.cid}/e/single`;
            } else {
              path = `/dashboard/t/${template.cid}/e`;
            }
            const tPolicy = data.policy.find((p) => p._id === template._id);
            if (
              !foundTemplateIds.includes(template._id) &&
              (data.isAdmin || (tPolicy && tPolicy.get))
            ) {
              items.push({
                id: template._id,
                parentId: 'root',
                type: 'child',
                draggableType: 'template',
                name: template.label,
                href: path,
                onClick: (event) => {
                  logic.onNavItemClick(path, event);
                },
                visible: true,
                selected: route.path.startsWith(path),
                ignoreSelected: true,
              });
            }
          }
        }
        items.sort((a, b) => (a.name < b.name ? -1 : 1));
        const organizeredItems = logic.aggregateExtendedOrganizers({
          organizers: extendedOrgs,
          forParent: '',
          isAdmin: data.isAdmin,
          policy: data.policy,
        });
        return [...organizeredItems, ...items];
      },
      aggregateExtendedOrganizers(data: {
        organizers: OrganizerExtended[];
        forParent: string;
        isAdmin: boolean;
        policy: Array<BCMSUserPolicyCRUD & { _id: string }>;
      }): BCMSNavItemType[] {
        const items: BCMSNavItemType[] = [];
        for (let i = 0; i < data.organizers.length; i++) {
          const organizer = data.organizers[i];
          if (
            organizer.parentId === data.forParent ||
            (!organizer.parentId && !data.forParent)
          ) {
            const item: BCMSNavItemType = {
              id: organizer._id,
              draggableType: 'organizer',
              parentId: organizer.parentId ? organizer.parentId : 'root',
              type: 'parent',
              name: organizer.label,
              visible: true,
              selected: false,
              children: organizer.templates
                .filter((template) => {
                  const tPolicy = data.policy.find(
                    (e) => e._id === template._id,
                  );
                  return data.isAdmin || (tPolicy && tPolicy.get);
                })
                .map((template) => {
                  let path: string;
                  if (template.singleEntry) {
                    path = `/dashboard/t/${template.cid}/e/single`;
                  } else {
                    path = `/dashboard/t/${template.cid}/e`;
                  }
                  return {
                    id: template._id,
                    parentId: organizer._id,
                    type: 'child',
                    draggableType: 'template',
                    name: template.label,
                    href: path,
                    onClick: (event) => {
                      logic.onNavItemClick(path, event);
                    },
                    visible: true,
                    selected: route.path.startsWith(path),
                    ignoreSelected: true,
                  };
                }),
            };
            (item.children as BCMSNavItemType[]).sort((a, b) =>
              b.name < a.name ? 1 : -1,
            );
            const children = logic.aggregateExtendedOrganizers({
              organizers: data.organizers,
              forParent: organizer._id,
              isAdmin: data.isAdmin,
              policy: data.policy,
            });
            if (children.length > 0) {
              (item.children as BCMSNavItemType[]) = [
                ...children,
                ...(item.children as BCMSNavItemType[]),
              ];
            }
            items.push(item);
          }
        }
        return items;
      },
    };

    async function signOut() {
      await window.bcms.util.throwable(
        async () => {
          await window.bcms.sdk.user.logout();
        },
        async () => {
          window.location.href = 'https://cloud.thebcms.com/dashboard';
        },
      );
    }

    onMounted(async () => {
      if (await window.bcms.sdk.isLoggedIn()) {
        await throwable(
          async () => {
            await window.bcms.sdk.templateOrganizer.getAll();
            await window.bcms.sdk.template.getAll();
            await window.bcms.sdk.user.getAll();
            await window.bcms.sdk.template.getAll();
            return await window.bcms.sdk.plugin.getAll();
          },
          async (result) => {
            pluginsList.value = result.map((e) => e.name);
          },
        );
      }
    });

    return () => (
      <nav
        v-cy={'side-nav'}
        class={`bcmsScrollbar max-w-full w-full text-dark flex-shrink-0 z-[999999] flex flex-col select-none ${
          isMobileNavOpen.value
            ? 'bg-white overflow-visible h-screen dark:bg-dark'
            : 'h-auto overflow-hidden'
        } desktop:bg-transparent desktop:h-screen desktop:border-r desktop:border-grey desktop:border-opacity-50 desktop:pt-15 desktop:pb-5 desktop:overflow-y-auto desktop:overflow-x-hidden`}
      >
        <div class="mb-0 flex flex-row-reverse items-center justify-between pt-5 pb-5 border-b border-grey border-opacity-50 h-[66px] text-dark px-5 desktop:mb-[100px] desktop:h-auto desktop:border-b-0 desktop:flex-row desktop:pt-0 desktop:pr-[25px] desktop:pb-0 desktop:pl-10 dark:border-light">
          <BCMSLogo showOnMobile={isMobileNavOpen.value} />
          <button
            v-cy={'open-nav-mob'}
            aria-label="Toggle navigation"
            onClick={logic.toggleMobileNav}
            class="mr-auto flex desktop:hidden"
          >
            <BCMSIcon
              src="/nav"
              class="text-dark fill-current w-6 dark:text-light"
            />
          </button>
        </div>
        <div
          class={`${
            isMobileNavOpen.value
              ? 'absolute top-[66px] left-0 w-full h-full'
              : 'relative h-[unset]'
          } z-100 desktop:top-0 desktop:relative desktop:flex-1`}
        >
          <ul
            class={`flex flex-col pt-7.5 pb-5 pl-8 pr-[15px] h-[calc(100%-66px)] ${
              isMobileNavOpen.value
                ? 'border-b border-grey border-opacity-50 pb-5 relative h-full overflow-y-auto'
                : 'pt-7.5 absolute top-0 left-0 w-full h-auto bg-white translate-x-[calc(100%+40px)]'
            } desktop:h-full desktop:relative desktop:translate-x-0 desktop:bg-transparent desktop:border-b-0 desktop:pt-0 desktop:pb-0 desktop:pr-[25px] desktop:pl-10`}
          >
            {administration.value.show ? (
              <BCMSNavItem
                item={{
                  type: 'parent',
                  name: translations.value.layout.nav.administration.label,
                  visible: true,
                  selected: administration.value.extended,
                  children: administration.value.data,
                }}
              />
            ) : (
              ''
            )}
            {plugins.value.show ? (
              <BCMSNavItem
                item={{
                  type: 'parent',
                  name: translations.value.layout.nav.plugin.label,
                  visible: true,
                  selected: plugins.value.extended,
                  children: plugins.value.data,
                }}
              />
            ) : (
              ''
            )}
            {templates.value.show && templates.value.root ? (
              <BCMSNavItem
                item={templates.value.root}
                cyTag="entries"
                draggable={true}
                onMerge={logic.handleMerge}
              />
            ) : (
              ''
            )}
            <li class="mt-auto">
              <button
                class="group py-2.5 w-full flex items-center justify-between dark:text-light"
                onClick={signOut}
              >
                <span class="text-base leading-tight font-semibold -tracking-0.01">
                  {translations.value.layout.nav.signOutCta}
                </span>
                <BCMSIcon
                  src="/sign-out"
                  class="w-6 h-6 text-dark fill-current transition-colors duration-300 group-hover:text-red group-focus-visible:text-red dark:text-light"
                />
              </button>
            </li>
          </ul>
        </div>
      </nav>
    );
  },
});

export default component;

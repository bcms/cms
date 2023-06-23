import type { BCMSUser } from '@becomes/cms-sdk/types';
import { BCMSJwtRoleName } from '@becomes/cms-sdk/types';
import { computed, defineComponent, type PropType } from 'vue';
import BCMSIcon from '../icon';
import { useTranslation } from '../../translations';
import { DefaultComponentProps } from '../_default';
import { BCMSOverflowMenu, BCMSOverflowMenuItem } from '../overflow';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    item: {
      type: Object as PropType<BCMSUser>,
      required: true,
    },
    invitation: {
      type: Boolean,
      default: false,
    },
    dashboard: {
      type: Boolean,
      default: false,
    },
    isAdmin: Boolean,
  },
  setup(props) {
    const translations = computed(() => {
      return useTranslation();
    });
    const throwable = window.bcms.util.throwable;

    const overflowMenuItems = computed(() => {
      return [
        {
          cyTag: 'make-admin',
          title:
            translations.value.page.home.members.overflowMenu.options.admin
              .title,
          description:
            translations.value.page.home.members.overflowMenu.options.admin
              .description,
          icon: 'administration/users',
          theme: 'default',
          onClick() {
            window.open('https://cloud.thebcms.com/', '_blank');
          },
        },
        {
          cyTag: 'edit-permissions',
          title:
            translations.value.page.home.members.overflowMenu.options
              .permissions.title,
          description:
            translations.value.page.home.members.overflowMenu.options
              .permissions.description,
          icon: 'edit',
          theme: 'default',
          onClick() {
            handleViewClick();
          },
        },
        {
          cyTag: 'remove-user',
          title:
            translations.value.page.home.members.overflowMenu.options.remove
              .title,
          description:
            translations.value.page.home.members.overflowMenu.options.remove
              .description,
          icon: 'user-remove',
          theme: 'danger',
          onClick() {
            window.open('https://cloud.thebcms.com/', '_blank');
          },
        },
      ];
    });

    function handleViewClick() {
      window.bcms.modal.settings.view.show({
        user: props.item,
        async onDone(data) {
          await throwable(
            async () => {
              await window.bcms.sdk.user.update({
                _id: props.item._id,
                customPool: {
                  policy: data.policy,
                },
              });
            },
            async () => {
              window.bcms.notification.success(
                translations.value.modal.viewUser.notification
                  .userPolicySuccess,
              );
            },
          );
        },
      });
    }

    return () => (
      <div
        class={`flex ${
          props.dashboard
            ? 'border border-grey/50 rounded-lg px-3.5 py-4 dark:bg-darkGrey'
            : 'flex-col'
        } justify-between gap-4 sm:flex-row sm:items-center sm:gap-0`}
      >
        <div class="flex items-center">
          <div class="relative flex">
            {props.invitation ? (
              <div class="flex items-center justify-center bg-pink w-10 h-10 rounded-full mr-2.5">
                <BCMSIcon
                  src="/administration/users"
                  class="w-6 h-6 text-white fill-current"
                />
              </div>
            ) : props.item.customPool.personal.avatarUri ? (
              <img
                src={props.item.customPool.personal.avatarUri}
                alt={props.item.username}
                class="w-10 h-10 rounded-full object-cover mr-2.5"
              />
            ) : (
              <div class="w-10 h-10 rounded-full bg-grey bg-opacity-70 border-2 border-green mr-2.5 flex justify-center items-center select-none dark:border-yellow">
                <span class="text-white font-semibold relative top-0.5">
                  {props.item.username
                    .split(' ')
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join('')}
                </span>
              </div>
            )}
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2.5 dark:text-light">
            <span class="leading-tight -tracking-0.01">
              {props.item.username}
            </span>
            {!props.dashboard && (
              <span class="font-semibold leading-tight -tracking-0.01 truncate">
                {props.item.email}
              </span>
            )}
          </div>
        </div>
        <div class="flex items-center space-x-4">
          {props.item.roles[0].name === BCMSJwtRoleName.ADMIN && (
            <span class="text-xs bg-green rounded-full px-2 py-0.5 font-medium text-white">
              Admin
            </span>
          )}
          {props.invitation ? (
            <span class="font-medium leading-tight -tracking-0.01 text-grey mr-1.5">
              {translations.value.page.settings.team.pendingCta}
            </span>
          ) : (
            props.item.roles[0].name !== BCMSJwtRoleName.ADMIN &&
            props.isAdmin && (
              <BCMSOverflowMenu optionsWidth={296}>
                {overflowMenuItems.value.map((item, index) => {
                  return (
                    <BCMSOverflowMenuItem
                      key={index}
                      cyTag={item.cyTag}
                      text={item.title}
                      description={item.description}
                      icon={item.icon}
                      theme={item.theme as 'default' | 'danger'}
                      onClick={item.onClick}
                    />
                  );
                })}
              </BCMSOverflowMenu>
            )
          )}
        </div>
      </div>
    );
  },
});

export default component;

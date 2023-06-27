export const keyManagerTranslationsEn = {
  meta: {
    title: 'Key Manager',
    dynamicTitle(data: { label: string }): string {
      return `${data.label} key`;
    },
  },
  nav: {
    label: 'Keys',
    actionText: 'Add new key',
  },
  input: {
    secret: {
      label: 'Key secret',
    },
    block: {
      label: 'Blocked',
      helperText: 'If checked, key will not be able to access any resources.',
    },
  },
  emptyState: {
    title: 'Keys',
    subtitle: 'No keys found.',
    actionText: 'Add new key',
  },
  templatePermission: {
    title: 'Template Permissions',
    emptyTitle: 'There are no templates',
    values: [
      {
        description: 'Can get resources',
      },
      {
        description: 'Can add resources',
      },
      {
        description: 'Can update resources',
      },
      {
        description: 'Can delete resources',
      },
    ],
  },
  pluginPermission: {
    title: 'Plugin Permissions',
    checkboxText: 'Allow access',
  },
  functionPermission: {
    title: 'Function Permissions',
    public: 'Public (Anyone can call)',
    emptyDescription: 'Can call the function',
    values: [
      {
        description: 'Can call a function',
      },
    ],
  },
  actions: {
    delete: 'Delete',
    update: 'Update',
  },
  confirm: {
    pageLeave: {
      title: 'Leaving the page',
      description:
        'Are you sure you want to leave this page? You have unsaved progress which will be lost.',
    },
    remove: {
      title: 'Delete Key',
      description(data: { label?: string }): string {
        return `Are you sure you want to delete <strong>${data.label}</strong>?`;
      },
    },
  },
  notification: {
    keyDeleteSuccess: 'Key successfully deleted.',
    keyUpdateSuccess: 'Key successfully updated.',
  },
};

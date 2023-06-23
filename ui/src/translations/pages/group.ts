export const groupTranslationsEn = {
  meta: {
    dynamicTitle(data: { label: string }): string {
      return `${data.label} group`;
    },
  },
  emptyState: {
    title: 'Groups',
    subtitle: 'There are no groups.',
    actionText: 'Add new group',
  },
  nav: {
    label: 'Groups',
    actionText: 'Add new group',
  },
  confirm: {
    remove: {
      title(data: { label: string }): string {
        return `Delete "${data.label}" Group`;
      },
      description(data: { label: string }): string {
        return `Are you sure you want to delete <strong>${data.label}</strong> group? This action is irreversible and the group will be removed from all entries.`;
      },
    },
    removeProperty: {
      title(data: { label: string }): string {
        return `Remove property ${data.label}`;
      },
      description(data: { label: string }): string {
        return `Are you sure you want to delete property <strong>${data.label}</strong>?`;
      },
    },
  },
};

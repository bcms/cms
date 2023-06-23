export const templateTranslationsEn = {
  meta: {
    dynamicTitle(data: { label: string }): string {
      return `${data.label} template`;
    },
  },
  emptyState: {
    title: 'Template',
    subtitle: 'There are no templates.',
    actionText: 'Add new template',
  },
  nav: {
    label: 'Templates',
    actionText: 'Add new template',
  },
  confirm: {
    remove: {
      title(data: { label: string }): string {
        return `Delete "${data.label}" Template`;
      },
      description(data: { label: string }): string {
        return `Are you sure you want to delete <strong>${data.label}</strong> template? This action is irreversible and all entries from this template will be deleted.`;
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

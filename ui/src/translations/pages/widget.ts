export const widgetTranslationsEn = {
  meta: {
    dynamicTitle(data: { label: string }): string {
      return `${data.label} widget`;
    },
  },
  emptyState: {
    title: 'Widgets',
    subtitle: 'There are no widgets.',
    actionText: 'Add new widget',
  },
  nav: {
    label: 'Widgets',
    actionText: 'Add new widget',
  },
  confirm: {
    remove: {
      title(data: { label: string }): string {
        return `Delete "${data.label}" Widget`;
      },
      description(data: { label: string }): string {
        return `Are you sure you want to delete <strong>${data.label}</strong> widget? This action is irreversible and the widget will be removed from all entities.`;
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

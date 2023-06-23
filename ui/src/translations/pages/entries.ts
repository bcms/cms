export const entriesTranslationsEn = {
  meta: {
    title: 'Entries',
    dynamicTitle(data: { label: string }): string {
      return `${data.label} entries`;
    },
  },
  filters: {
    entriesCount(data: { count: number; pluralEntry: string }): string {
      return `${data.count} ${data.pluralEntry} found`;
    },
    emptyState: {
      subtitle: 'No entries found.',
      actionText(data: { label: string }): string {
        return `Add new ${data.label}`;
      },
    },
    input: {
      search: {
        placeholder: 'Search entries by Title or ID',
      },
      dateCreated: {
        label: 'Date Created',
      },
      dateUpdated: {
        label: 'Date Updated',
      },
    },
  },
  table: {
    emptyTitle: 'No given title',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    title: 'Title',
    edit: 'Edit',
    view: 'View',
    status: 'Status',
    overflowItems: {
      duplicate: 'Duplicate',
      viewModel: 'View Model',
      whereIsUsed: 'Where is used',
      remove: 'Remove',
    },
  },
  confirm: {
    remove: {
      title: 'Remove entry',
      description(data: { label: string }): string {
        return `Are you sure you want to delete <strong>${data.label}</strong> entry? This action is permanent and irreversible!`;
      },
    },
    duplicate: {
      title: 'Duplicate',
      description(data: { label: string }): string {
        return `Are you sure you want to duplicate <strong>${data.label}</strong>?`;
      },
    },
  },
  notification: {
    entryDeleteSuccess(data: { label: string }): string {
      return `Entry ${data.label} successfully removed.`;
    },
    entryDuplicateSuccess: 'Entry successfully duplicated.',
    emptyTemplate: 'Selected template does not exist.',
  },
  spinner: {
    message: 'Loading content...',
  },
};

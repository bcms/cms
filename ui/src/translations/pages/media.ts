export const mediaTranslationsEn = {
  meta: {
    title: 'Media',
    dynamicTitle(data: { label: string }): string {
      return `Media: ${data.label}`;
    },
  },
  title: 'Media manager',
  emptyState: {
    subtitle: 'There are no files yet. Upload the first one.',
  },
  dropzone: {
    title: 'Drop files here',
  },
  orderLabel: 'Name',
  showMore: 'Show more',
  emptyFolder: 'There is no media in this folder',
  spinnerTitle(data: { label: string }): string {
    return `Uploading: ${data.label}`;
  },
  search: {
    placeholder: 'Search',
  },
  filters: {
    type: {
      label: 'Type',
      placeholder: 'No filters',
      image: 'Image',
      video: 'Video',
      directory: 'Directory',
    },
    dateModified: {
      label: 'Date Modified',
    },
  },
  actions: {
    upload: 'Upload file',
    createFolder: 'Create new folder',
  },
  confirm: {
    delete: {
      title(data: { label: string }): string {
        return `Delete "${data.label}"`;
      },
      description(data: { label: string }): string {
        return `Are you sure you want to delete <strong>${data.label}</strong>? This action is irreversible`;
      },
      dirDescription: 'and all child media will also be deleted',
    },
  },
  notification: {
    mediaDeleteSuccess: 'Media successfully removed.',
  },
};

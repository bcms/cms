export const entryTranslationsEn = {
  meta: {
    createTitle: 'Create Entry',
    updateTitle: 'Update Entry',
  },
  actions: {
    save: 'Save',
    update: 'Update',
  },
  instructions: 'Instructions',
  primary: 'Primary',
  widgets: 'Widgets',
  convertTo: 'Convert to',
  heading: 'Heading',
  editor: {
    placeholder: {
      placeholder: 'Click and start typing here',
    },
    entryDoesNotExist: "Entry doesn't exist",
    mediaDoesNotExist: "Media doesn't exist",
  },
  input: {
    title: {
      label: 'Title',
      placeholder(data: { label: string }): string {
        return `Title for ${data.label} entry`;
      },
    },
    slug: {
      placeholder: 'slug',
    },
  },
  confirm: {
    pageLeave: {
      title: 'Leaving the page',
      description:
        'Are you sure you want to leave this page? You have unsaved progress which will be lost.',
    },
  },
  notification: {
    entrySaveSuccess: 'Entry saved successfully.',
    emptyTemplate: 'Template does not exist.',
    entryErrors:
      'Entry contains one or more errors. Please fix them and try again.',
  },
  spinner: {
    message: 'Loading entry...',
    savingMessage: 'We are saving your entry, please wait...',
  },
  didYouSave: 'Did you save your stuff?',
};

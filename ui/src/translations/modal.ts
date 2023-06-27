export const modalTranslationsEn = {
  actions: {
    done: 'Done',
    cancel: 'Cancel',
  },
  viewModel: {
    title: 'View entry model',
    empty: '// No entry is selected',
    original: 'Original',
    parsed: 'Parsed',
  },
  addUpdateGroup: {
    title: 'Add/Update group',
    newTitle: 'Create new group',
    editTitle(data: { label: string }): string {
      return `Edit ${data.label} Group`;
    },
    input: {
      label: {
        label: 'Label',
        placeholder: "Group's label",
      },
      description: {
        label: 'Description',
        placeholder: "Group's description",
        helperText: 'Supports markdown',
      },
    },
    error: {
      emptyLabel: 'Label cannot be empty.',
      duplicateLabel(data: { label: string }): string {
        return `Group with label "${data.label}" already exists.`;
      },
    },
  },
  addUpdateTemplate: {
    title: 'Add/Update template',
    newTitle: 'Create new template',
    editTitle(data: { label: string }): string {
      return `Edit ${data.label} Template`;
    },
    input: {
      label: {
        label: 'Label',
        placeholder: "Template's label",
      },
      description: {
        label: 'Description',
        placeholder: "Template's description",
        helperText: 'Supports markdown',
      },
      singleEntry: {
        label: 'Single entry',
        helperText: 'This template will be able to have only 1 entry.',
      },
    },
    error: {
      emptyLabel: 'Label cannot be empty.',
      duplicateLabel(data: { label: string }): string {
        return `Template with label "${data.label}" already exists.`;
      },
    },
  },
  addUpdateWidget: {
    title: 'Add/Update widget',
    newTitle: 'Create new widget',
    editTitle(data: { label: string }): string {
      return `Edit ${data.label} Widget`;
    },
    input: {
      label: {
        label: 'Label',
        placeholder: "Widget's label",
      },
      description: {
        label: 'Description',
        placeholder: "Widget's description",
        helperText: 'Supports markdown',
      },
      previewImage: {
        title: 'Preview image',
      },
    },
    error: {
      emptyLabel: 'Label cannot be empty.',
      duplicateLabel(data: { label: string }): string {
        return `Widget with label "${data.label}" already exists.`;
      },
    },
  },
  addProp: {
    title: 'Select a property type',
    actionSlot: {
      createLabel: 'Create',
      backLabel: 'Back',
    },
    type: {
      string: {
        label: 'String',
        description: 'Any character array value',
      },
      richText: {
        label: 'Rich Text',
        description: 'Text with options for bold, italic, list...',
      },
      number: {
        label: 'Number',
        description: 'Any real number',
      },
      date: {
        label: 'Date',
        description: 'Unix timestamp - date in milliseconds',
      },
      boolean: {
        label: 'Boolean',
        description: 'Yer or no, true of false, 1 or 0',
      },
      enumeration: {
        label: 'Enumeration',
        description: 'List of choices',
      },
      media: {
        label: 'Media',
        description: 'Select a media file using media picker',
      },
      groupPointer: {
        label: 'Group Pointer',
        description: 'Extend properties of a group',
      },
      entryPointer: {
        label: 'Entry Pointer',
        description: 'Extend properties of an entry',
      },
      colorPicker: {
        label: 'Color Picker',
        description: 'Pre-defined and custom colors',
      },
    },
    input: {
      label: {
        label: 'Label',
        placeholder: 'Label',
      },
      enumeration: {
        label: 'Enumerations',
        placeholder: 'Type something and press Enter key',
        helperText: 'Type your option and press Enter',
      },
      entryPointer: {
        label: 'Select templates',
      },
      required: {
        label: 'Required',
        states: ['Yes', 'No'] as [string, string],
      },
      array: {
        label: 'Array',
        states: ['Yes', 'No'] as [string, string],
      },
    },
    error: {
      emptyType: 'You must select a type.',
      emptyLabel: 'Label is required.',
      duplicateLabel: 'Label is already taken.',
      emptyGroupPointer: 'Please select a group.',
      emptyTemplatePointer: 'Please select a template.',
      emptyEnumeration: 'At least 1 value must be provided.',
      duplicateEnumeration(data: { label: string }): string {
        return `Enumeration with name '${data.label}' is already added.`;
      },
    },
  },
  editProp: {
    title(data: { label: string }): string {
      return `Edit property ${data.label}`;
    },
    actionName: 'Update',
    actionName2: 'Next',
    input: {
      label: {
        label: 'Label',
        placeholder: "Property's label",
      },
      enumeration: {
        label: 'Enumeration',
        placeholder: 'Type something and press Enter key',
      },
      entryPointer: {
        label: 'Select templates',
      },
      required: {
        label: 'Required',
        states: ['Yes', 'No'] as [string, string],
      },
      array: {
        label: 'Array',
        states: ['Yes', 'No'] as [string, string],
      },
    },
    error: {
      emptyLabel: 'Label is required.',
      duplicateLabel: 'Label is already taken.',
      emptyEnumeration: 'At least 1 value must be provided.',
      duplicateEnumeration(data: { label: string }): string {
        return `Enumeration with name '${data.label}' is already added.`;
      },
      emptyEntryPointer: 'You must select at least 1 template.',
    },
  },
  entryStatus: {
    title: 'Edit entry statuses',
    updateTitle: 'Update entry statuses',
    confirm: {
      done: {
        title: 'Update statuses',
        description: 'Are you sure you want to update statuses?',
      },
    },
    input: {
      enumeration: {
        label: 'Add new status',
        placeholder: 'Status name',
      },
    },
    error: {
      duplicateEnumeration(data: { label: string }): string {
        return `Status with name "${data.label}" is already added.`;
      },
    },
  },
  mediaPicker: {
    title: 'Media picker',
    selectedTitle: 'Select media file',
    error: {
      emptyFile: 'You must select a media file.',
    },
  },
  addUpdateDirectory: {
    title: 'Create new folder',
    input: {
      label: {
        label: 'Folder name',
        placeholder: 'Folder name',
      },
    },
    error: {
      emptyLabel: 'Folder name is required.',
      duplicateFolder(data: { label: string }): string {
        return `Folder "${data.label}" already exists. Please choose a different name.`;
      },
    },
  },
  uploadMedia: {
    title: 'Upload files',
    notification: {
      emptyFile: 'There are no files to upload.',
    },
  },
  confirm: {
    title: 'Confirm',
    actionName: 'Confirm',
    input: {
      label: {
        label: 'Confirm',
        helperText(data: { label: string }): string {
          return `Please write <strong>${data.label}</strong>`;
        },
      },
    },
    error: {
      prompt(data: { value: string }): string {
        return `You must type "${data.value}"`;
      },
    },
  },
  showDescriptionExampleTemplate: {
    title: 'How people describe templates',
    description:
      'Template description is displayed on each entry editing page, as instructions for content editors',
    views: [
      {
        title: 'Keep your team aligned',
        description:
          'Ensure your team stays aligned and on track by centralizing your project workflow in one location',
      },
      {
        title: 'Never miss important details',
        description: 'Place important links to external and internal stuff',
      },
      {
        title: "How it's used",
        description: 'Specify where and how the content is being displayed',
      },
    ],
  },
  whereIsItUsed: {
    title: 'Where is it used?',
    groupTitle(data: { label?: string }): string {
      return `${data.label} is used in`;
    },
    widgetTitle(data: { label?: string }): string {
      return `${data.label} is used in`;
    },
    table: {
      columns: {
        type: 'Type',
        label: 'Label',
        location: 'Location',
      },
      openCta: 'Open',
    },
    empty: "It hasn't been used yet",
  },
  contentLink: {
    title: 'Link URL',
    input: {
      type: {
        label: 'Type',
        options: [
          {
            label: 'URL',
            value: 'url',
          },
          {
            label: 'Media',
            value: 'media',
          },
          {
            label: 'Entry',
            value: 'entry',
          },
        ],
      },
      url: {
        label: 'URL',
        helperText: 'Link must start with http:// or https://',
      },
    },
    error: {
      wrongUrl: 'Invalid URL was provided.',
    },
  },
  addWidget: {
    title: 'Add widget',
    actionName: 'Add widget to the content',
    spinnerMessage: 'Loading widgets',
    notification: {
      emptyWidget: 'You need to select a widget.',
    },
  },
  templateOrganizer: {
    title: 'Organize entries',
    actionName: 'Create',
    input: {
      label: {
        placeholder: 'Name the collection',
      },
    },
    error: {
      emptyLabel: 'Please name your collection.',
    },
  },
  addUpdateApiKey: {
    addTitle: 'Add API Key',
    editTitle(data: { label: string }): string {
      return `Edit ${data.label} Key`;
    },
    actionName: 'Create',
    input: {
      label: {
        label: 'Name',
        placeholder: 'Name',
      },
      description: {
        label: 'Description',
        placeholder: 'Description',
      },
    },
    error: {
      emptyLabel: 'Name is required',
    },
  },
  viewUser: {
    title: 'View member',
    input: {
      mode: {
        label: 'Toggle mode',
        states: ['Advanced mode', 'Simple mode'] as [string, string],
      },
      mediaPermission: {
        title: 'Media Permissions',
        advancedModeTitle: 'Can view and edit media',
        subtitle: 'Media',
        values: [
          {
            description: 'Can get resources',
          },
          {
            description: 'Can add data',
          },
          {
            description: 'Can update data',
          },
          {
            description: 'Can delete data',
          },
        ],
      },
      templatePermission: {
        title: 'Template Permissions',
        advancedModeTitle(data: { label: string }): string {
          return `Can view and edit ${data.label}`;
        },
        emptyTitle: 'There are no templates',
        values: [
          {
            description: 'Can get resources',
          },
          {
            description: 'Can add data',
          },
          {
            description: 'Can update data',
          },
          {
            description: 'Can delete data',
          },
        ],
      },
      pluginPermission: {
        title: 'Plugin Permissions',
        advancedModeTitle(data: { label: string }): string {
          return `Allow full access to ${data.label}`;
        },
      },
    },
    notification: {
      userPolicySuccess: 'Users policy updated successfully.',
    },
    loading: 'Loading ...',
  },
  globalSearch: {
    input: {
      value: {
        placeholder: 'Search for anything',
      },
    },
    open: 'Open',
    members: 'Members',
  },
  multiSelect: {
    title: 'Select templates',
  },
  backups: {
    title: 'Backups',
    inProcess: 'In process',
    action: 'Create new backup',
    empty: 'There are no backups available',
  },
};

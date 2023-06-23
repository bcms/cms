export const propTranslationsEn = {
  wrapperArray: {
    actionName(data: { label: string }): string {
      return `Add new item to ${data.label}`;
    },
  },
  wrapperArrayItem: {
    itemIndex(data: { index: number }): string {
      return `Item ${data.index}`;
    },
  },
  entryPointer: {
    select: {
      placeholder: 'Select an entry',
    },
    error: {
      emptyEntry: 'Please select an entry',
      notAllowed: 'This entry is not allowed, please select another.',
    },
  },
  groupPointer: {
    addGroup(label: string): string {
      return `Add ${label}`;
    },
    loading: 'Loading ...',
  },
  enum: {
    error: {
      emptyOption: 'Please select an option',
    },
  },
  media: {
    error: {
      emptyMedia: 'Media file is required. Please select one.',
    },
  },
  richText: {
    error: {
      emptyValue: 'Input must contain some text.',
    },
  },
  input: {
    error: {
      emptyValue: 'Input must contain some text.',
      emptyArray: 'You need to add at least 1 item.',
    },
  },
  colorPicker: {
    error: {
      selectColor: 'You must select a color',
    },
  },
  viewer: {
    array: 'Array',
    propertiesCount(data: { count: number | string; label: string }): string {
      return `${data.count} properties in this ${data.label}`;
    },
    actions: {
      add: 'Add property',
      delete: 'Delete',
      whereIsItUsed: 'See where is it used',
    },
    table: {
      label: 'Label',
      name: 'Name',
      type: 'Type',
    },
    tooltip: {
      entryPointer: 'Entry Pointer',
      entryPointerArray: 'Entry Pointer Array',
      groupPointer: 'Group Pointer',
      groupPointerArray: 'Group Pointer Array',
    },
    overflowItems: {
      title: 'Options',
      moveUp: 'Move up',
      moveDown: 'Move down',
      edit: 'Edit',
      delete: 'Delete',
    },
    emptyText(data: { label: string }): string {
      return `Click "Add property" to start building this ${data.label}`;
    },
    loading: 'Loading...',
    entryPointerSeeAll(data: { count: number }): string {
      return `See all ${data.count} templates`;
    },
  },
};

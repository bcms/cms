export const managerTranslationsEn = {
  info: {
    clickToDescribe(data: { label: string }): string {
      return `Double click here to describe this ${data.label?.toLowerCase()}`;
    },
    actions: {
      showExamples: 'Show examples',
      done: 'Done',
    },
    table: {
      id: 'ID',
      created: 'Created',
      updated: 'Updated',
    },
    input: {
      description: {
        helperText: 'Supports markdown',
      },
    },
    error: {
      emptyLabel: 'Label cannot be empty',
    },
  },
};

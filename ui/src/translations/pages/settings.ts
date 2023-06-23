export const settingsTranslationsEn = {
  meta: {
    title: 'Settings',
  },
  title: 'Settings',
  backups: 'Backups',
  accountManagement: {
    title: 'Account management',
    editCta: 'Edit account',
  },
  notifications: {
    title: 'Notifications',
    notifyMeCta: 'Notify me about news & events',
  },
  languages: {
    title: 'Languages',
    description: 'Add languages that will be available for entries',
    addCta: 'Add',
    input: {
      language: {
        label: 'Language',
      },
    },
    error: {
      emptyLanguage: 'Please select a language to add.',
    },
    confirm: {
      delete: {
        title: 'Delete Language',
        description(data: { langCode: string }): string {
          return `Are you sure you want to delete <img class="w-6 h-6 mx-1 rounded-full inline-block" src="/assets/flags/${data.langCode}.jpg" /> language?`;
        },
      },
    },
    notification: {
      langDeleteSuccess: 'Language successfully removed.',
      langAddSuccess(data: { label: string }): string {
        return `"${data.label}" language successfully added.`;
      },
    },
  },
  team: {
    title: 'Team',
    subtitle: 'Members',
    inviteCta(data: { pl: string }): string {
      return `Invite ${data.pl} member`;
    },
    pendingCta: 'Pending',
  },
};

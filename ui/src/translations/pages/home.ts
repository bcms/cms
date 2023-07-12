export const homeTranslationsEn = {
  meta: {
    title: 'Home',
  },
  featureDisabled: {
    title: 'You are now logged in.',
  },
  greeting: {
    title: (name: string) => `Hello ${name},`,
    wish: 'Have a nice day at work!',
  },
  newOptions: {
    title: 'Create new',
    template: 'Template',
    widget: 'Widget',
    group: 'Group',
    fileUpload: 'File Upload',
    entry: {
      label: 'Entry',
      dropdown: {
        title: 'Select a template',
        seeAll: 'See all',
        noTemplates: 'To create an entry, you need to have at least one template.',
        createATemplate: 'Create a template.',
      },
    },
  },
  search: 'Search for anything',
  stats: {
    title: 'Your stats',
    entries: 'Entries created',
    uploads: 'Megabytes uploaded',
    members: 'Members',
  },
  activity: {
    title: '7-days activity',
    noRecentActivity: 'You don’t have any activity in the past 7 days',
  },
  uploads: {
    title: 'Recently uploaded',
    seeAll: 'See all files',
    noRecentUploads: 'Upload first files to see them here.',
    cta: 'Upload files',
    dropzone: {
      drop: 'Drop files here to upload or',
      select: 'Select files from computer',
      fileSize: 'Maximum file size 100mb',
    },
  },
  members: {
    title: 'Manage members',
    invite: 'Invite a member',
    seeAll: 'See all members',
    noUsers: 'You don’t have any active users now',
    overflowMenu: {
      title: 'Options',
      options: {
        admin: {
          title: 'Make an admin',
          description: `Admin users are able to access all entires,
          create new templates, groups and widgets, as well as invite other users and make them admins`,
        },
        permissions: {
          title: 'Detailed permissions',
          description: `Click here to separately choose create, read, update, delete permissions for each template.`,
        },
        remove: {
          title: 'Remove user from the instance',
          description: `When removed, they won't have access to any content in the instance and won't be able to log in into it.`,
        },
      },
    },
  },
  docsAndResources: {
    title: 'Docs and resources',
    documentation: 'Documentation',
    tutorials: 'Tutorials',
    codeStarters: 'Code starters',
  },
  supportAndCommunity: {
    title: 'Support and community',
    contact: 'Contact',
  },
};

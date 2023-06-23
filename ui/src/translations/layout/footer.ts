import type { BCMSTranslationsFooterDocsKeyNames } from "../../types";

const docsItems: {
  [K in BCMSTranslationsFooterDocsKeyNames]: {
    title: string;
    url: string;
  };
} = {
  w: {
    title: 'Widgets docs',
    url: 'https://docs.thebcms.com/inside-bcms/widgets',
  },
  t: {
    title: 'Templates docs',
    url: 'https://docs.thebcms.com/inside-bcms/templates',
  },
  g: {
    title: 'Groups docs',
    url: 'https://docs.thebcms.com/inside-bcms/groups',
  },
  e: {
    title: 'Entries docs',
    url: 'https://docs.thebcms.com/inside-bcms/entries',
  },
  media: {
    title: 'Media docs',
    url: 'https://docs.thebcms.com/inside-bcms/media',
  },
  settings: {
    title: 'Settings docs',
    url: 'https://docs.thebcms.com/inside-bcms/settings',
  },
  'key-manager': {
    title: 'Keys docs',
    url: 'https://docs.thebcms.com/inside-bcms/key-manager',
  },
  plugin: {
    title: 'Plugins docs',
    url: 'https://docs.thebcms.com/customization/plugins',
  },
  default: {
    title: 'Settings docs',
    url: 'https://docs.thebcms.com/inside-bcms/settings',
  },
};

export const footerTranslationsEn = {
  help: {
    toggleTitle: 'Help, feedback, and \n keyboard shortcuts',
    updated: 'Updated',
    navigation: (name: BCMSTranslationsFooterDocsKeyNames) => {
      const docsItem = docsItems[name] || docsItems.default;

      return [
        {
          title: docsItem.title,
          url: docsItem.url,
          level: 1,
          icon: 'file',
        },
        {
          title: 'Documentation',
          url: 'https://docs.thebcms.com/',
          level: 1,
          icon: 'file',
        },
        {
          title: 'Global search',
          action: 'global-search',
          level: 2,
        },
        {
          title(theme: string): string {
            return theme === 'dark' ? 'Light mode' : 'Dark mode';
          },
          action: 'dark-mode',
          level: 2,
        },
        {
          title: "What's new",
          url: 'https://thebcms.com/changelog',
          level: 2,
        },
        {
          title: 'Join us',
          url: 'https://thebcms.com/careers',
          level: 2,
        },
        {
          title: 'Twitter - @thebcms',
          url: 'https://twitter.com/thebcms',
          level: 3,
        },
        {
          title: 'Terms & privacy',
          url: 'https://thebcms.com/privacy-policy',
          level: 3,
        },
        {
          title: 'Status',
          url: 'https://thebcms.com/status',
          level: 3,
        },
      ];
    },
  },
};

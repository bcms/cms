<template>
  <nav class="nav">
    <ul class="nav--list nav--list_0">
      <nav-item v-for="item in navigation" :key="item.name" :item="item" :depth="0" />
    </ul>
  </nav>
</template>

<script>
import navItem from './navItem.vue';
export default {
  name: 'navigation',
  components: { navItem },
  data() {
    return {
      navigation: [
        {
          label: 'Administration',
          expanded: true,
          items: [
            {
              label: 'Templates',
              icon: 'IconTemplate',
              path: '/templates',
            },
            {
              label: 'Groups',
              icon: 'IconGroup',
              path: '/groups',
            },
            {
              label: 'Widgets',
              icon: 'IconWidget',
              path: '/widgets',
            },
            {
              label: 'Media manager',
              icon: 'IconMedia',
              path: '/media',
            },
            {
              label: 'Settings',
              icon: 'IconSettings',
              items: [
                {
                  label: 'Language',
                  icon: 'IconLanguage',
                  path: '/language',
                },
                {
                  label: 'Users',
                  icon: 'IconUsers',
                  items: [
                    {
                      label: 'Boris Bošnjak',
                      path: '/boris-bosnjak',
                      icon: 'IconAdmin'
                    },
                    {
                      label: 'Branislav Vajagić',
                      path: '/branislav-vajagic',
                      icon: 'IconAdmin'
                    },
                    {
                      label: 'Momcilo Popov',
                      path: '/momcilo-popov',

                    }
                  ]
                },
                {
                  label: 'API',
                  icon: 'IconApi',
                  path: '/api',
                },
                {
                  label: 'Webhook',
                  icon: 'IconWebhook',
                  path: '/webhooks',
                },
              ],
            },
            {
              label: 'Custom portal',
              icon: 'IconPortal',
              path: '/portal',
            },
          ],
        },
        {
          label: 'Webhooks',
          items: [
            {
              label: 'Build production',
              icon: 'IconWebhook',
              path: '/webhooks',
            },
            {
              label: 'Build stagging',
              icon: 'IconWebhook',
              path: '/webhooks',
            },
          ],
        },
        {
          label: 'Entries',
          items: [
            {
              label: 'Plans',
              icon: 'IconEntry',
              path: '/entry',
            },
          ],
        },
      ],
    };
  },
};
</script>
<script context="module">
  export const sideBarOptions = {
    updateTemplates: () => {},
    updateWebhooks: () => {},
  };
</script>

<script>
  import { onMount } from 'svelte';
  import Base64 from '../../base64.js';
  import StringUtil from '../../string-util.js';

  export let Store;
  export let axios;

  let options = {
    sections: [
      {
        name: 'WEBHOOKS',
        menus: [],
      },
      {
        name: 'TEMPLATES',
        menus: [],
      },
    ],
  };

  if (!Store.get('user')) {
    document.location = `/login?error=You are not logged in.`;
  }

  function toggleSubMenu(event) {
    options.menus = options.menus.map(menu => {
      if (menu.name === event.currentTarget.id) {
        if (menu.style.maxHeight === 0) {
          menu.style.maxHeight = 100;
        } else {
          menu.style.maxHeight = 0;
        }
      }
      return menu;
    });
  }

  sideBarOptions.updateTemplates = templates => {
    options.sections = options.sections.map(section => {
      if (section.name === 'TEMPLATES') {
        section.menus = templates.map(template => {
          return {
            type: 'link',
            name: StringUtil.prettyName(template.name),
            link: `/dashboard/template/entries/view/c/${template._id}?page=1&cid=${template._id}&lng=en`,
            faClass: 'fas fa-pencil-alt',
          };
        });
      }
      return section;
    });
  };
  sideBarOptions.updateWebhooks = webhooks => {
    options.sections = options.sections.map(section => {
      if (section.name === 'WEBHOOKS') {
        section.menus = webhooks.map(webhook => {
          return {
            type: 'link',
            name: StringUtil.prettyName(webhook.name)
              .split('-')
              .map(e => {
                const f = e.substring(0, 1).toUpperCase();
                const r = e.substring(1, e.length);
                return f + r;
              })
              .join(' '),
            link: `/dashboard/webhook/trigger/view/w/${webhook._id}?wid=${webhook._id}`,
            faClass: 'fas fa-link',
          };
        });
      }
      return section;
    });
  };

  onMount(async () => {
    let result = await axios.send({
      url: '/template/all',
      method: 'GET',
    });
    if (result.success === false) {
      console.error(result.error);
      return;
    }
    const templates = JSON.parse(
      JSON.stringify(result.response.data.templates),
    );
    result = await axios.send({
      url: '/webhook/all',
      method: 'GET',
    });
    if (result.success === false) {
      console.error(result.error);
      return;
    }
    const webhooks = JSON.parse(JSON.stringify(result.response.data.webhooks));
    if (Store.get('user').roles[0].name === 'ADMIN') {
      options.sections = [
        {
          name: 'ADMINISTRATION',
          menus: [
            {
              type: 'link',
              name: 'Template Manager',
              link: '/dashboard/template/editor',
              faClass: 'fas fa-cubes',
            },
            {
              type: 'link',
              name: 'Group Manager',
              link: '/dashboard/group/editor',
              faClass: 'fas fa-layer-group',
            },
            {
              type: 'link',
              name: 'Widget Manager',
              link: '/dashboard/widget/editor',
              faClass: 'fas fa-pepper-hot',
            },
            {
              type: 'link',
              name: 'Media Manager',
              link: '/dashboard/media/editor',
              faClass: 'fa fa-folder',
            },
            {
              type: 'link',
              name: 'Language Manager',
              link: '/dashboard/language/editor',
              faClass: 'fas fa-globe-europe',
            },
            {
              type: 'link',
              name: 'Users Manager',
              link: '/dashboard/user/editor',
              faClass: 'fas fa-users',
            },
            {
              type: 'link',
              name: 'API Manager',
              link: '/dashboard/api/editor',
              faClass: 'fas fa-key',
            },
            {
              type: 'link',
              name: 'Webhook Manager',
              link: '/dashboard/webhook/editor',
              faClass: 'fas fa-link',
            },
          ],
        },
        ...options.sections,
      ];
    }
    for (const i in options.sections) {
      if (options.sections[i].name === 'TEMPLATES') {
        options.sections[i].menus = templates.map(template => {
          return {
            type: 'link',
            name: StringUtil.prettyName(template.name),
            link: `/dashboard/template/entries/view/c/${template._id}?page=1&cid=${template._id}&lng=en`,
            faClass: 'fas fa-pencil-alt',
          };
        });
      } else if (options.sections[i].name === 'WEBHOOKS') {
        options.sections[i].menus = webhooks.map(webhook => {
          return {
            type: 'link',
            name: StringUtil.prettyName(webhook.name),
            link: `/dashboard/webhook/trigger/view/w/${webhook._id}?wid=${webhook._id}`,
            faClass: 'fas fa-link',
          };
        });
      }
    }
  });
</script>

<style type="text/scss">
  @import './side-bar.scss';
</style>

<div class="side-bar">
  <div class="sections">
    {#each options.sections as section}
      <div class="section">
        <div class="name">{section.name}</div>
        <div class="menus">
          {#each section.menus as menu}
            <div
              class="menu {menu.link.startsWith(window.location.pathname) ? 'active' : ''}">
              {#if menu.type === 'link'}
                <a href={menu.link}>
                  <div class="parent link">
                    <div class="{menu.faClass} icon" />
                    <div class="text">{menu.name}</div>
                  </div>
                </a>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
    <br />
  </div>
</div>

<script context="module">
  export const sideBarOptions = {
    addTemplate: () => {},
    updateTemplates: () => {},
  };
</script>

<script>
  import { onMount } from 'svelte';
  import Base64 from '../../base64.js';

  export let Store;
  export let axios;

  let options = {
    sections: [
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

  sideBarOptions.addTemplate = template => {
    options.sections[1].menus = [
      ...options.sections[1].menus,
      {
        type: 'link',
        name: template.name
          .split('-')
          .map(e => {
            const f = e.substring(0, 1).toUpperCase();
            const r = e.substring(1, e.length);
            return f + r;
          })
          .join(' '),
        link:
          `/dashboard/template/entries/view?` + `page=1&cid=${template._id}&lng=en`,
        faClass: 'fas fa-pencil-alt',
      },
    ];
  };
  sideBarOptions.updateTemplates = templates => {
    options.sections[1].menus = templates.map(template => {
      return {
        type: 'link',
        name: template.name
          .split('-')
          .map(e => {
            const f = e.substring(0, 1).toUpperCase();
            const r = e.substring(1, e.length);
            return f + r;
          })
          .join(' '),
        link: `/dashboard/template/entries/view?page=1&cid=${template._id}&lng=en`,
        faClass: 'fas fa-pencil-alt',
      };
    });
  };

  onMount(async () => {
    const result = await axios.send({
      url: '/template/all',
      method: 'GET',
    });
    if (result.success === false) {
      console.error(result.error);
      return;
    }
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
        options.sections[i].menus = result.response.data.templates.map(
          template => {
            return {
              type: 'link',
              name: template.name
                .split('-')
                .map(e => {
                  const f = e.substring(0, 1).toUpperCase();
                  const r = e.substring(1, e.length);
                  return f + r;
                })
                .join(' '),
              link: `/dashboard/template/entries/view?page=1&cid=${template._id}&lng=en`,
              faClass: 'fas fa-pencil-alt',
            };
          },
        );
        break;
      }
    }
  });
</script>

<style>
  .side-bar {
    font-size: 10pt;
    position: fixed;
    top: 60px;
    bottom: 0;
    width: 250px;
    background-color: #18202e;
    z-index: 1;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .section .name {
    color: #5b626f;
    font-size: 10pt;
    font-weight: bold;
    margin: 30px 10px 20px 20px;
  }

  .menus .menu {
    padding-left: 20px;
  }

  .menus .menu:hover {
    background-color: #232e41;
  }

  .menus .menu .perent {
    display: grid;
    grid-template-columns: 12px auto 20px;
    grid-gap: 10px;
    padding: 10px 0;
  }

  .menus .menu .perent .name {
    margin: 0;
    font-weight: normal;
    color: #5b626f;
  }

  .menus .menu .perent .icon {
    margin: auto 0;
    font-size: 10pt;
    color: var(--c-neutral);
    color: #5b626f;
  }
</style>

<div class="side-bar">
  <div class="sections">
    {#each options.sections as section}
      <div class="section">
        <div class="name">{section.name}</div>
        <div class="menus">
          {#each section.menus as menu}
            <div class="menu">
              {#if menu.type === 'link'}
                <a class="perent link" href={menu.link}>
                  <div class="{menu.faClass} icon" />
                  <div class="name">{menu.name}</div>
                </a>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

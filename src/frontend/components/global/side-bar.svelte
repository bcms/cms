<script>
  import {
    Store,
    fatch,
    templateStore,
    webhookStore,
    pathStore,
  } from '../../config.svelte';
  import { onMount } from 'svelte';
  import { Link, navigate } from 'svelte-routing';
  import Base64 from '../../base64.js';
  import StringUtil from '../../string-util.js';

  if (!Store || !Store.get('loggedIn') || Store.get('loggedIn') === false) {
    Store.remove('refreshToken');
    Store.remove('accessToken');
    Store.remove('user');
    navigate('/login', { replace: true });
    // document.location = `/login?error=You are not logged in.`;
  }

  const accessToken = JSON.parse(
    Base64.decode(Store.get('accessToken').split('.')[1]),
  );
  let options = {
    sections: [
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
      {
        name: 'WEBHOOKS',
        menus: [],
      },
      {
        name: 'ENTRIES',
        menus: [],
      },
    ],
  };
  templateStore.subscribe(value => {
    updateTemplates(value);
  });
  webhookStore.subscribe(value => {
    updateWebhooks(value);
  });

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
  function updateTemplates(templates) {
    options.sections = options.sections.map(section => {
      if (section.name === 'ENTRIES') {
        section.menus = templates.map(template => {
          return {
            _id: template._id,
            type: 'link',
            name: StringUtil.prettyName(template.name),
            link: `/dashboard/template/entries/view/c/${template._id}?page=1&cid=${template._id}&lng=en`,
            faClass: 'fas fa-pencil-alt',
          };
        });
      }
      return section;
    });
  }
  function updateWebhooks(webhooks) {
    options.sections = options.sections.map(section => {
      if (section.name === 'WEBHOOKS') {
        section.menus = webhooks.map(webhook => {
          return {
            _id: webhook._id,
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
  }
  function filter(section, menu) {
    if (accessToken.roles[0].name === 'ADMIN') {
      return false;
    }
    switch (section.name) {
      case 'ADMINISTRATION':
        {
          switch (menu.name) {
            case 'Media Manager':
              {
                if (accessToken.customPool.policy.media.get === true) {
                  return false;
                }
              }
              break;
          }
        }
        break;
      case 'WEBHOOKS':
        {
          const policy = accessToken.customPool.policy.webhooks.find(
            e => e._id === menu._id,
          );
          if (policy && policy.get === true) {
            return false;
          }
        }
        break;
      case 'ENTRIES':
        {
          const policy = accessToken.customPool.policy.templates.find(
            e => e._id === menu._id,
          );
          if (policy && policy.get === true) {
            return false;
          }
        }
        break;
    }
    return true;
  }
</script>

<style type="text/scss">
  .side-bar {
    font-size: 10pt;
    position: fixed;
    top: 0;
    bottom: 0;
    width: 250px;
    background-color: var(--c-white-normal);
    border-right: 1px solid #e0e0e0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .section .name {
    color: var(--c-gray-cold-dark);
    font-size: 10pt;
    font-weight: bold;
    margin: 30px 10px 20px 20px;
  }

  .menus .menu {
    padding-left: 20px;
  }

  .menus .menu .parent {
    display: grid;
    grid-template-columns: 12px auto 20px;
    grid-gap: 10px;
    padding: 10px 0;
  }

  .menus .menu .parent .text {
    margin: 0;
    font-weight: normal;
    color: var(--c-gray-cold-dark);
  }

  .menus .menu .parent .icon {
    margin: auto 0;
    font-size: 10pt;
    color: var(--c-neutral);
    color: var(--c-gray-cold-dark);
  }

  .menus .active .parent .icon {
    color: var(--c-primary);
  }

  .menus .menu:hover {
    background-color: var(--c-gray-light);
  }
</style>

<div class="side-bar">
  <div class="sections">
    <div class="section mt-auto">
      <div class="menus">
        <div class="menu">
          <Link
            to="/login"
            on:click={() => {
              Store.clear();
            }}>
            <div class="parent link">
              <div class="fas fa-sign-out-alt icon" />
              <div class="text">Sign out</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
    {#if options.sections && accessToken}
      {#each options.sections as section}
        <div class="section">
          <div class="name">{section.name}</div>
          <div class="menus">
            {#each section.menus as menu}
              <div
                class="menu {menu.link.startsWith(window.location.pathname) ? 'active' : ''}">
                {#if menu.type === 'link'}
                  {#if filter(section, menu) === false}
                    <Link
                      to={menu.link}
                      state={{ link: menu.link }}
                      on:click={() => {
                        pathStore.update(value => menu.link);
                        options.sections = [...options.sections];
                      }}>
                      <div class="parent link">
                        <div class="{menu.faClass} icon" />
                        <div class="text">{menu.name}</div>
                      </div>
                    </Link>
                  {/if}
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    {/if}
    <br />
  </div>
</div>

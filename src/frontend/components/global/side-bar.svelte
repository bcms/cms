<script>
  import { fade, fly } from 'svelte/transition';
  import {
    Store,
    fatch,
    templateStore,
    webhookStore,
    pathStore,
  } from '../../config.svelte';
  import { onMount } from 'svelte';
  import { Link, navigate } from 'svelte-routing';
  import Button from './button.svelte';
  import Base64 from '../../base64.js';
  import StringUtil from '../../string-util.js';

  export let useNormalLink = false;

  if (!Store || !Store.get('loggedIn') || Store.get('loggedIn') === false) {
    Store.remove('refreshToken');
    Store.remove('accessToken');
    Store.remove('user');
    navigate('/login', { replace: true });
    // document.location = `/login?error=You are not logged in.`;
  }

  const screenWidth = window.innerWidth;
  const accessToken = JSON.parse(
    Base64.decode(Store.get('accessToken').split('.')[1]),
  );
  let show = screenWidth < 900 ? false : true;
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
          {
            type: 'link',
            kind: 'normal',
            name: 'Custom Portal',
            link: '/dashboard/custom',
            faClass: 'fas fa-magic',
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
  options.sections[0].menus = options.sections[0].menus.filter(
    menu => !filter(options.sections[0], menu),
  );
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
        section.menus = section.menus.filter(menu => !filter(section, menu));
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
        section.menus = section.menus.filter(menu => !filter(section, menu));
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
            case 'Custom Portal':
              {
                if (accessToken.customPool.policy.customPortal.get === true) {
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
    background-color: var(--c-primary-dark);
    overflow-x: hidden;
    overflow-y: auto;
  }

  .section .name {
    color: var(--c-gray);
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
    color: var(--c-gray-light);
  }

  .menus .menu .parent .icon {
    margin: auto 0;
    font-size: 10pt;
    color: var(--c-neutral);
    color: var(--c-gray-light);
  }

  .menus .active .parent .icon {
    color: var(--c-primary);
  }

  .menus .menu:hover {
    background-color: var(--c-primary-dark-hover);
    transition: all 0.3s;
  }

  .toggl-side-bar {
    position: fixed;
    bottom: 20px;
    left: 0;
    transition: all 0.35s;
  }

  .toggl-side-bar-show {
    left: 250px;
  }
</style>

{#if show === true}
  <div transition:fade class="overlay">
    <div transition:fly={{ x: -250 }} class="side-bar">
      <div class="sections">
        <div class="section mt-auto">
          <div class="menus">
            <div class="menu">
              {#if useNormalLink === true}
                <a
                  href="/login"
                  on:click={() => {
                    Store.clear();
                  }}>
                  <div class="parent link">
                    <div class="fas fa-sign-out-alt icon" />
                    <div class="text">Sign out</div>
                  </div>
                </a>
              {:else}
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
              {/if}
            </div>
          </div>
        </div>
        {#if options.sections && accessToken}
          {#each options.sections as section}
            {#if section.menus.length > 0}
              <div class="section">
                <div class="name">{section.name}</div>
                <div class="menus">
                  {#each section.menus as menu}
                    <div
                      class="menu {menu.link.startsWith(window.location.pathname) ? 'active' : ''}">
                      {#if menu.type === 'link'}
                        {#if filter(section, menu) === false}
                          {#if useNormalLink === true || menu.kind === 'normal'}
                            <a
                              href={menu.link}
                              on:click={() => {
                                pathStore.update(value => menu.link);
                                options.sections = [...options.sections];
                              }}>
                              <div class="parent link">
                                <div class="{menu.faClass} icon" />
                                <div class="text">{menu.name}</div>
                              </div>
                            </a>
                          {:else}
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
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
        {/if}
        <br />
      </div>
    </div>
  </div>
{/if}
{#if screenWidth < 900}
  <div class="toggl-side-bar {show === true ? 'toggl-side-bar-show' : ''}">
    <Button
      kind="secondary"
      icon="fas fa-compass"
      onlyIcon={true}
      on:click={() => {
        show = !show;
      }} />
  </div>
{/if}

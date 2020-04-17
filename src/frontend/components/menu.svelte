<script>
  import Button from './global/button.svelte';
  import StringUtil from '../string-util.js';

  export let config;
  export let events;

  const screenWidth = window.innerWidth;
  let show = screenWidth < 900 ? false : true;
</script>

<style type="text/scss">
  @import './menu.scss';
</style>

{#if show === true}
  <div class="menu">
    <div class="heading">{config.heading}</div>
    <div class="items">
      {#each config.items as item}
        {#if config.itemSelected && config.itemSelected._id === item._id}
          <div
            class="item selected"
            on:click={() => {
              events.clicked(item);
            }}>
            <div class="fa fa-arrow-right icon" />
            {#if item.username}
              <div class="name">
                {StringUtil.prettyName(item.username.replace(/ /g, '_'))}
              </div>
            {:else}
              <div class="name">{StringUtil.prettyName(item.name)}</div>
            {/if}
            {#if item.roles}
              <div class="role">
                [ {StringUtil.prettyName(item.roles[0].name)} ]
              </div>
            {/if}
          </div>
        {:else}
          <button
            class="item"
            on:click={() => {
              events.clicked(item);
              if (screenWidth < 900) {
                show = false;
              }
            }}>
            <div class="fa fa-arrow-right icon" />
            {#if item.username}
              <div class="name">
                {StringUtil.prettyName(item.username.replace(/ /g, '_'))}
              </div>
            {:else}
              <div class="name">{StringUtil.prettyName(item.name)}</div>
            {/if}
            {#if item.roles}
              <div class="role">
                [ {StringUtil.prettyName(item.roles[0].name)} ]
              </div>
            {/if}
          </button>
        {/if}
      {/each}
    </div>
    <div class="create-new">
      <Button icon="fas fa-plus" kind="ghost" on:click={events.addNewItem}>
        {config.buttonLabel}
      </Button>
    </div>
  </div>
{/if}
{#if screenWidth < 900}
  <div class="toggle-menu {show === true ? 'toggle-menu-show' : ''}">
    <Button
      icon="fas fa-bars"
      onlyIcon={true}
      on:click={() => {
        show = !show;
      }} />
  </div>
{/if}

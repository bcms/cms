<script>
  import StringUtil from '../string-util.js';

  export let config;
  export let events;
</script>

<style type="text/scss">
  @import './menu.scss';
</style>

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
          <div class="name">{StringUtil.prettyName(item.name)}</div>
          {#if item.type}
            <div class="type">[ {StringUtil.prettyName(item.type)} ]</div>
          {/if}
          {#if item.roles}
            <div class="role">[ {StringUtil.prettyName(item.roles[0].name)} ]</div>
          {/if}
        </div>
      {:else}
        <button
          class="item"
          on:click={() => {
            events.clicked(item);
          }}>
          <div class="fa fa-arrow-right icon" />
          <div class="name">{StringUtil.prettyName(item.name)}</div>
          {#if item.type}
            <div class="type">[ {StringUtil.prettyName(item.type)} ]</div>
          {/if}
          {#if item.roles}
            <div class="role">[ {StringUtil.prettyName(item.roles[0].name)} ]</div>
          {/if}
        </button>
      {/if}
    {/each}
  </div>
  <div class="create-new">
    <button class="btn btn-blue-c" on:click={events.addNewItem}>
      <div class="fa fa-plus icon" />
      <div class="text">{config.buttonLabel}</div>
    </button>
  </div>
</div>

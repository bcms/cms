<script>
  import StringUtil from '../string-util.js';

  export let config;
  export let events;
</script>

<style>
  .menu {
    width: 100%;
    height: 100%;
    background-color: #f2f3f4;
    padding: 30px 20px 0 20px;
    padding-left: 20px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .menu .heading {
    color: #919bae;
    font-size: 10pt;
    font-weight: bold;
    padding-left: 10px;
    margin-bottom: 20px;
    margin-top: 20px;
  }

  .items {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 5px;
  }

  .item {
    display: flex;
    margin: auto 0;
    padding: 10px 10px;
    border-radius: 3px;
    border: none;
    transition: 0.5s;
  }

  .item:hover {
    background-color: #ebebeb;
    transition: 0.5s;
  }

  .item .icon {
    margin: auto 0;
    color: #919bae;
    font-size: 8pt;
  }

  .item .name {
    margin: auto 0 auto 10px;
    font-size: 10pt;
  }

  .item .type,
  .item .role {
    margin: auto 0 auto auto;
    font-size: 8pt;
    font-weight: bold;
  }

  .selected {
    background-color: #ebebeb;
  }

  .selected .icon {
    color: var(--c-primary);
  }

  .create-new {
    margin: 20px 0;
  }
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

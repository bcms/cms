<script>
  import TopBar from './top-bar.svelte';
  import SideBar from './side-bar.svelte';

  export let Store;
  export let axios;
</script>

<style>
  .content {
    position: absolute;
    top: 60px;
    left: 250px;
    right: 0;
    bottom: 0;
    color: var(--c-black);
    overflow-x: hidden;
    overflow-y: auto;
    z-index: 0;
  }
</style>

<div class="layout">
  <SideBar {Store} {axios}/>
  <TopBar {Store} />
  <div class="content">
    <slot>
      <layout />
    </slot>
  </div>
</div>
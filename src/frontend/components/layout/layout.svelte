<script>
  import TopBar from './top-bar.svelte';
  import SideBar from './side-bar.svelte';

  export let Store;
  export let axios;
</script>

<style type='text/scss'>
  @import './layout.scss';
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
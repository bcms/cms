<script>
  import SideBar from './side-bar.svelte';

  export let Store;
  export let axios;
</script>

<style type='text/scss'>
  @import './layout.scss';
</style>

<div class="layout">
  <div class="content">
    <slot>
      <layout />
    </slot>
  </div>
  <SideBar {Store} {axios}/>
  <!-- <TopBar {Store} /> -->
</div>
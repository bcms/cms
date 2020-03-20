<script>
  import SideBar from './side-bar.svelte';
</script>

<style type="text/scss">
  @import './layout.scss';
</style>

<div class="layout">
  <div class="content">
    <slot>
      <layout />
    </slot>
  </div>
  <SideBar />
</div>

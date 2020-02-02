<script>
  import SideBar from './side-bar.svelte';
</script>

<style type="text/scss">
  @import './layout.scss';
</style>

<svelt:head>
  <link rel="stylesheet" href="/font-awesome/fontawesome.min.css" />
  <link rel="stylesheet" href="/font-awesome/solid.min.css" />
  <link rel="stylesheet" href="/font-awesome/brands.min.css" />
</svelt:head>

<div class="layout">
  <div class="content">
    <slot>
      <layout />
    </slot>
  </div>
  <SideBar />
</div>

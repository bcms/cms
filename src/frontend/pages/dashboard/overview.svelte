<script>
  import Layout from '../../components/global/layout.svelte';
</script>

<style type="text/scss">
  .wrapper {
    width: 100%;
    height: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
  }

  .content {
    margin: auto;
  }

  .content img {
    width: 250px;
  }
</style>

<Layout>
  <div class="wrapper">
    <div class="content">
      <h4>You are now logged in.</h4>
      <img class="mt-50" src="/logo.svg" alt="logo" />
    </div>
  </div>
</Layout>

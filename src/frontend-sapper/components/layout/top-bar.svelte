<script>
  export let Store;

  const user = Store.get('user');

  function getRoleNames(roles) {
    return roles
      .map(e => {
        return e.name;
      })
      .join('/');
  }

  function toggleUser() {}
</script>

<style type="text/scss">
  @import './top-bar.scss';
</style>

<div class="top-bar">
  <a class="heading" href="/dashboard">
    <div class="logo">
      <img src="/logo.svg" alt="Becomes CMS" />
    </div>
  </a>
  <div class="content">
    <div class="user" href="/dashboard/profile">
      {#if user}
        <span class="name">{user.username}</span>
        |
        <span class="role">{user.roles[0].name}</span>
      {/if}
    </div>
  </div>
</div>

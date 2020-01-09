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

<style>
  .top-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    display: grid;
    grid-template-columns: 250px auto;
    grid-column-gap: 10px;
    overflow: hidden;
    color: var(--c-black);
    background-color: var(--c-white);
    border-bottom-style: solid;
    border-bottom-color: var(--c-neutral);
    border-bottom-width: 1px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.15);
    z-index: 1;
  }

  .heading {
    width: 250px;
    height: 60px;
  }

  .heading .logo {
    text-align: center;
    margin: 5px 0;
  }

  .heading .logo svg {
    height: 50px;
    margin: 0 auto;
  }

  .content {
    display: flex;
    margin: auto 20px auto auto;
    color: var(--c-black);
  }

  .user {
    color: var(--c-black);
  }

  .user:hover {
    color: #4d4d4d;
    transition: 0.2s;
  }

  .user .role {
    font-weight: bold;
  }
</style>

<div class="top-bar">
  <a class="heading" href="/dashboard">
    <div class="logo">
      <img src="/logo.svg" alt="Becomes CMS" />
    </div>
  </a>
  <div class="content">
    <a class="user" href="/dashboard/profile">
      {#if user}
        <span class="name">{user.username}</span>
        |
        <span class="role">{user.roles[0].name}</span>
      {/if}
    </a>
  </div>
</div>

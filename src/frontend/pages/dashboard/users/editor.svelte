<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/layout/layout.svelte';
  import Menu from '../../../components/menu.svelte';
  import AddUserModal from '../../../components/users/modals/add-user.svelte';

  export let Store;
  export let axios;

  let users = [];
  let userSelected;
  let menu = {
    config: {
      heading: 'USERS',
      buttonLabel: 'Add New User',
      items: [],
      itemSelected: userSelected,
    },
    events: {
      clicked: item => {
        userSelected = users.find(e => e._id === item._id);
        menu.config.itemSelected = userSelected;
      },
      addNewItem: () => {
        addUserModalEvents.toggle();
      },
    },
  };
  let addUserModalEvents = { callback: addUser };

  async function addUser(data) {
    const result = await axios.send({
      url: `/user`,
      method: 'POST',
      data
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    users = [...users, result.response.data.user];
    userSelected = result.response.data.user;
    menu.config.items = users;
    menu.config.itemSelected = userSelected;
  }

  onMount(async () => {
    const result = await axios.send({
      url: '/user/all',
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    users = result.response.data.users;
    if (users.length > 0) {
      userSelected = users[0];
    }
    menu.config.items = users.map(e => {
      e.name = e.username;
      return e;
    });
    menu.config.itemSelected = userSelected;
  });
</script>

<style>
  .editor {
    display: grid;
    grid-template-columns: 400px auto;
    height: 100%;
  }

  .content {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 20px;
  }

  .content .heading {
    display: flex;
    font-size: 18pt;
  }

  .content .heading .username {
    font-weight: bold;
    margin-right: 10px;
  }

  .content .heading .role {
    font-weight: lighter;
    margin-left: 10px;
  }

  .content .edit {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 20px;
    margin-top: 30px;
    background-color: #fff;
    padding: 10px 20px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15);
    font-size: 10pt;
  }

  .content .edit .key-value .icon {
    color: #acacac;
  }

  .content .edit .actions {
    display: flex;
    margin-top: 30px;
  }

  .content .edit .actions .edit-btn {
    margin-left: auto;
  }
</style>

<Layout {Store} {axios}>
  <div class="editor">
    <Menu events={menu.events} config={menu.config} />
    {#if userSelected}
      <div class="content">
        <div class="heading">
          <span class="username">{userSelected.username}</span>
          |
          <span class="role">{userSelected.roles[0].name}</span>
        </div>
        <div class="edit">
          <div class="key-value">
            <div class="label">
              <span class="fas fa-signature icon" />
              &nbsp;
              <span>First Name</span>
            </div>
            <div class="value">
              <input
                class="input"
                bind:value={userSelected.customPool.personal.firstName} />
            </div>
          </div>
          <div class="key-value">
            <div class="label">
              <span class="fas fa-signature icon" />
              &nbsp;
              <span>Last Name</span>
            </div>
            <div class="value">
              <input
                class="input"
                bind:value={userSelected.customPool.personal.lastName} />
            </div>
          </div>
          <div class="key-value">
            <div class="label">
              <span class="fas fa-envelope icon" />
              &nbsp;
              <span>Email</span>
            </div>
            <div class="value">
              <input class="input" bind:value={userSelected.email} />
            </div>
          </div>
          <div class="key-value">
            <div class="label">
              <span class="fas fa-key icon" />
              &nbsp;
              <span>Password</span>
            </div>
            <div class="value">
              <input
                class="input"
                type="password"
                placeholder="- Password -"
                bind:value={userSelected.password} />
            </div>
          </div>
          <div class="actions">
            <button class="btn-border btn-red-br btn-red-c delete">
              <div class="fas fa-trash icon" />
              <div class="text">Delete</div>
            </button>
            <button class="btn-fill btn-blue-bg edit-btn">
              <div class="fas fa-trash icon" />
              <div class="text">Update</div>
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</Layout>
<AddUserModal events={addUserModalEvents} />

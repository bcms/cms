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
      itemSelected: undefined,
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
      data,
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    users = [...users, result.response.data.user];
    userSelected = result.response.data.user;
    menu.config.items = users.map(e => {
      e.name = e.username;
      return e;
    });
    menu.config.itemSelected = userSelected;
  }
  async function deleteUser() {
    if (confirm('Are you sure you want to delete a User?')) {
      const result = await axios.send({
        url: `/user/${userSelected._id}`,
        method: 'DELETE',
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      users = users.filter(e => e._id !== userSelected._id);
      userSelected = users[0];
      menu.config.items = users.map(e => {
        e.name = e.username;
        return e;
      });
      menu.config.itemSelected = userSelected;
    }
  }
  async function updateUser() {
    if (confirm('Are you sure you want to update a User?')) {
      const data = {
        _id: userSelected._id,
        email: userSelected.email,
        customPool: {
          personal: {
            firstName: userSelected.customPool.personal.firstName,
            lastName: userSelected.customPool.personal.lastName,
          },
        },
      };
      if (userSelected.password && userSelected.password.replace(/ /g, '') !== '') {
        data.password = userSelected.password;
      }
      const result = await axios.send({
        url: `/user`,
        method: 'PUT',
        data,
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      users = users.map(e => {
        if (e._id === userSelected._id) {
          return result.response.data.user;
        }
        return e;
      });
      userSelected = result.response.data.user;
      menu.config.items = users.map(e => {
        e.name = e.username;
        return e;
      });
      menu.config.itemSelected = userSelected;
      simplePopup.success('User updated successfully.');
    }
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

<style type="text/scss">
  @import './editor.scss';
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
            <button
              class="btn-border btn-red-br btn-red-c delete"
              on:click={deleteUser}>
              <div class="fas fa-trash icon" />
              <div class="text">Delete</div>
            </button>
            <button class="btn-fill btn-blue-bg edit-btn" on:click={updateUser}>
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

<script>
  import { onMount } from 'svelte';
  import {
    axios,
    fatch,
    userStore,
    templateStore,
    webhookStore,
  } from '../../../config.svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import { TextInput, PasswordInput } from 'carbon-components-svelte';
  import Layout from '../../../components/global/layout.svelte';
  import ManagerLayout from '../../../components/global/manager-content.svelte';
  import Button from '../../../components/global/button.svelte';
  import MediaManagerPolicy from '../../../components/users/media-manager-policy.svelte';
  import TemplatePolicy from '../../../components/users/template-policy.svelte';
  import WebhookPolicy from '../../../components/users/webhook-policy.svelte';
  import AddUserModal from '../../../components/users/modals/add-user.svelte';

  let users = [];
  let templates = [];
  let webhooks = [];
  let userSelected;
  let addUserModalEvents = { callback: addUser };

  userStore.subscribe(value => {
    users = value;
    if (users.length > 0 && !userSelected) {
      userSelected = users[0];
      if (!userSelected.customPool.policy) {
        userSelected.customPool.policy = {
          media: {
            get: false,
            post: false,
            put: false,
            delete: false,
          },
          templates: [],
          webhooks: [],
        };
      }
    }
  });
  templateStore.subscribe(value => {
    templates = value;
  });
  webhookStore.subscribe(value => {
    webhooks = value;
  });

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
    userStore.update(value => [...users, result.response.data.user]);
    userSelected = result.response.data.user;
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
      userStore.update(value => users.filter(e => e._id !== userSelected._id));
      userSelected = users[0];
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
          policy: userSelected.customPool.policy,
        },
      };
      if (
        userSelected.password &&
        userSelected.password.replace(/ /g, '') !== ''
      ) {
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
      userStore.update(value =>
        users.map(e => {
          if (e._id === userSelected._id) {
            return result.response.data.user;
          }
          return e;
        }),
      );
      userSelected = result.response.data.user;
      simplePopup.success('User updated successfully.');
    }
  }

  onMount(async () => {
    fatch();
    if (users.length > 0 && !userSelected) {
      userSelected = users[0];
      if (!userSelected.customPool.policy) {
        userSelected.customPool.policy = {
          media: {
            get: false,
            post: false,
            put: false,
            delete: false,
          },
          templates: [],
          webhooks: [],
        };
      }
    }
  });
</script>

<style type="text/scss">
  .update {
    margin-left: auto;
  }
  .content {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 20px;
  }

  .policies .templates {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 370px));
    grid-gap: 20px;
  }

  .policies .admin {
    text-align: center;
    font-size: 18pt;
    color: var(--c-gray);
  }
</style>

<Layout>
  <ManagerLayout
    onlySlot={true}
    items={users}
    itemSelected={userSelected}
    menuConfig={{ heading: 'USERS', buttonLabel: 'Add new User' }}
    on:addNewItem={() => {
      addUserModalEvents.toggle();
    }}
    on:delete={user => {
      deleteUser();
    }}
    on:itemClicked={event => {
      if (event.eventPhase === 0) {
        userSelected = event.detail;
      }
    }}>
    {#if userSelected}
      <div class="update">
        <Button
          icon="fas fa-check"
          on:click={() => {
            updateUser();
          }}>
          Update
        </Button>
      </div>
      <div class="content">
        <TextInput
          labelText="First Name"
          value={userSelected.customPool.personal.firstName}
          on:input={event => {
            userSelected.customPool.personal.firstName = event.target.value;
          }} />
        <TextInput
          labelText="Last Name"
          value={userSelected.customPool.personal.lastName}
          on:input={event => {
            userSelected.customPool.personal.lastName = event.target.value;
          }} />
        <TextInput
          labelText="Email"
          value={userSelected.email}
          on:input={event => {
            userSelected.email = event.target.value;
          }} />
        <PasswordInput
          labelText="Password"
          placeholder="- Password -"
          on:input={event => {
            userSelected.password = event.target.value;
          }} />
        <div class="policies mt-30">
          {#if userSelected.roles[0].name === 'ADMIN'}
            <div class="admin">
              This User is Admin and it has all permissions.
            </div>
          {:else}
            <MediaManagerPolicy user={userSelected} />
            <div class="templates mt-50">
              {#each webhooks as webhook}
                <WebhookPolicy user={userSelected} {webhook} />
              {/each}
            </div>
            <div class="templates mt-50">
              {#each templates as template}
                <TemplatePolicy user={userSelected} {template} />
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </ManagerLayout>
</Layout>
<AddUserModal events={addUserModalEvents} />

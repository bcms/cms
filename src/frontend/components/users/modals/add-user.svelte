<script>
  import Modal from '../../modal.svelte';
  import { simplePopup } from '../../simple-popup.svelte';

  export let events;

  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: 'Create New User',
  };
  let data = {
    email: {
      value: '',
      error: '',
    },
    password: {
      value: '',
      error: '',
    },
    firstName: {
      value: '',
      error: '',
    },
    lastName: {
      value: '',
      error: '',
    },
  };

  events.cancel = () => {
    data = {
      email: {
        value: '',
        error: '',
      },
      password: {
        value: '',
        error: '',
      },
      firstName: {
        value: '',
        error: '',
      },
      lastName: {
        value: '',
        error: '',
      },
    };
    events.toggle();
  };
  events.done = async () => {
    if (data.email.value.replace(/ /g, '') === '') {
      data.email.error = 'Email input cannot be empty.';
      return;
    }
    data.email.error = '';
    if (data.firstName.value.replace(/ /g, '') === '') {
      data.firstName.error = 'First Name input cannot be empty.';
      return;
    }
    data.firstName.error = '';
    if (data.lastName.value.replace(/ /g, '') === '') {
      data.lastName.error = 'Last Name input cannot be empty.';
      return;
    }
    data.lastName.error = '';
    if (data.password.value.replace(/ /g, '') === '') {
      data.password.error = 'Password input cannot be empty.';
      return;
    }
    data.password.error = '';
    events.toggle();
    if (events.callback) {
      events.callback({
        email: data.email.value,
        password: data.password.value,
        customPool: {
          personal: {
            firstName: data.firstName.value,
            lastName: data.lastName.value,
          },
        },
      });
    }
    data = {
      email: {
        value: '',
        error: '',
      },
      password: {
        value: '',
        error: '',
      },
      firstName: {
        value: '',
        error: '',
      },
      lastName: {
        value: '',
        error: '',
      },
    };
  };
</script>

<style>
  .content .title {
    padding-bottom: 5px;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #eff3f6;
    font-size: 14pt;
    font-weight: bold;
  }

  .content .options {
    margin-top: 20px;
    display: grid;
    grid-template-columns: auto;
    grid-gap: 20px;
  }

  .content .options .icon {
    font-size: 8pt;
    color: #8d8d8d;
  }
</style>

<Modal heading={modalHeading} {events}>
  <div class="content">
    <div class="title">Settings</div>
    <div class="options">
      <div class="key-value">
        <div class="label">
          <span class="fas fa-envelope icon" />
          &nbsp;
          <span>Email</span>
          {#if data.email.error !== ''}
            <div style="font-size: 8pt; color: red; margin-top: 5px;">
              <span class="fa fa-exclamation" />
              <span style="margin-left: 5px;">{data.email.error}</span>
            </div>
          {/if}
        </div>
        <div class="value">
          <input
            class="input"
            placeholder="- Email -" 
            bind:value={data.email.value}/>
        </div>
      </div>
      <div class="key-value">
        <div class="label">
          <span class="fas fa-signature icon" />
          &nbsp;
          <span>First Name</span>
          {#if data.firstName.error !== ''}
            <div style="font-size: 8pt; color: red; margin-top: 5px;">
              <span class="fa fa-exclamation" />
              <span style="margin-left: 5px;">{data.firstName.error}</span>
            </div>
          {/if}
        </div>
        <div class="value">
          <input
            class="input"
            placeholder="- First Name -" 
            bind:value={data.firstName.value}/>
        </div>
      </div>
      <div class="key-value">
        <div class="label">
          <span class="fas fa-signature icon" />
          &nbsp;
          <span>Last Name</span>
          {#if data.lastName.error !== ''}
            <div style="font-size: 8pt; color: red; margin-top: 5px;">
              <span class="fa fa-exclamation" />
              <span style="margin-left: 5px;">{data.lastName.error}</span>
            </div>
          {/if}
        </div>
        <div class="value">
          <input
            class="input"
            placeholder="- Last Name -" 
            bind:value={data.lastName.value}/>
        </div>
      </div>
      <div class="key-value">
        <div class="label">
          <span class="fas fa-key icon" />
          &nbsp;
          <span>Password</span>
          {#if data.password.error !== ''}
            <div style="font-size: 8pt; color: red; margin-top: 5px;">
              <span class="fa fa-exclamation" />
              <span style="margin-left: 5px;">{data.password.error}</span>
            </div>
          {/if}
        </div>
        <div class="value">
          <input
            class="input"
            type="password"
            placeholder="- Password -" 
            bind:value={data.password.value}/>
        </div>
      </div>
    </div>
  </div>
</Modal>

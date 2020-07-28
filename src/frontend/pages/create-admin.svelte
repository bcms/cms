<script>
  import { navigate } from 'svelte-routing';
  import { simplePopup } from '../components/simple-popup.svelte';
  import { Store, axios, forceFatch } from '../config.svelte';
  import TextInput from '../components/global/text-input.svelte';
  import PasswordInput from '../components/global/password-input.svelte';
  import Button from '../components/global/button.svelte';
  import AxiosClient from '../axios-client.js';
  import Base64 from '../base64.js';

  const axiosClient2 = AxiosClient.instance();
  const data = {
    secret: {
      value: '',
      error: '',
    },
    email: {
      value: '',
      error: '',
    },
    pass: {
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

  async function checkAdmin() {
    let result = await axiosClient2.send({
      url: '/user/is-initialized',
      method: 'GET',
    });
    if (result.success === false) {
      console.error(result.error);
      simplePopup.error(result.error.response.data.message);
      return;
    }
    if (result.response.data.initialized === true) {
      navigate('/');
    } else {
      result = await axiosClient2.send({
        url: '/user/generate-admin-secret',
        method: 'POST',
      });
    }
  }
  async function submit() {
    if (data.secret.value.replace(/ /g, '') === '') {
      data.secret.error = 'Secret input cannot be empty.';
      return;
    }
    data.secret.error = '';
    if (data.email.value.replace(/ /g, '') === '') {
      data.email.error = 'Email input cannot be empty.';
      return;
    }
    data.email.error = '';
    if (data.firstName.value.replace(/ /g, '') === '') {
      data.firstName.error = 'First name input cannot be empty.';
      return;
    }
    data.firstName.error = '';
    if (data.lastName.value.replace(/ /g, '') === '') {
      data.lastName.error = 'Last name input cannot be empty.';
      return;
    }
    data.lastName.error = '';
    if (data.pass.value.replace(/ /g, '') === '') {
      data.pass.error = 'Password input cannot be empty.';
      return;
    }
    data.pass.error = '';
    let result = await axiosClient2.send({
      url: '/user/create-admin',
      method: 'POST',
      data: {
        securityCode: data.secret.value,
        email: data.email.value,
        password: data.pass.value,
        customPool: {
          personal: {
            firstName: data.firstName.value,
            lastName: data.lastName.value,
          },
        },
      },
    });
    if (result.success === false) {
      console.error(result.error);
      simplePopup.error(result.error.response.data.message);
      return;
    }
    Store.set('accessToken', result.response.data.accessToken);
    Store.set('refreshToken', result.response.data.refreshToken);
    goToDashboard();
  }
  async function goToDashboard() {
    let result = await axios.send({
      url: '/user/me',
      method: 'GET',
    });
    if (result.success === false) {
      console.error(result.error);
      return;
    }
    Store.set('user', result.response.data.user);
    Store.set('loggedIn', true);
    window.location = '/dashboard/overview';
  }
  checkAdmin();
</script>

<style type="text/scss">
  @import './login.scss';
</style>

<div class="wrapper">
  <div class="welcome">
    <div class="content">
      <div class="pre-title">Welcome to</div>
      <h1>
        Becomes
        <strong>CMS</strong>
      </h1>
    </div>
  </div>
  <div class="login">
    <h2>Create an Admin User</h2>
    <PasswordInput
      class="mt-20"
      invalid={data.secret.error !== '' ? true : false}
      invalidText={data.secret.error}
      helperText="See server console output for secret code."
      labelText="Server Secret"
      placeholder="- Server Secret -"
      on:input={event => {
        if (event.eventPhase === 0) {
          data.secret.value = event.detail;
        }
      }} />
    <TextInput
      class="mt-20"
      invalid={data.email.error !== '' ? true : false}
      invalidText={data.email.error}
      labelText="Email"
      placeholder="- Email -"
      on:input={event => {
        if (event.eventPhase === 0) {
          data.email.value = event.detail;
        }
      }} />
    <TextInput
      class="mt-20"
      invalid={data.firstName.error !== '' ? true : false}
      invalidText={data.firstName.error}
      labelText="First Name"
      placeholder="- First Name -"
      on:input={event => {
        if (event.eventPhase === 0) {
          data.firstName.value = event.detail;
        }
      }} />
    <TextInput
      class="mt-20"
      invalid={data.lastName.error !== '' ? true : false}
      invalidText={data.lastName.error}
      labelText="Last Name"
      placeholder="- Last Name -"
      on:input={event => {
        if (event.eventPhase === 0) {
          data.lastName.value = event.detail;
        }
      }} />
    <PasswordInput
      class="mt-20"
      invalid={data.pass.error !== '' ? true : false}
      invalidText={data.pass.error}
      labelText="Password"
      placeholder="- Password -"
      on:input={event => {
        if (event.eventPhase === 0) {
          data.pass.value = event.detail;
        }
      }} />
    <div class="actions mt-50">
      <Button on:click={submit}>Create</Button>
    </div>
  </div>
</div>

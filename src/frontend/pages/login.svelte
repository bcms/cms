<script>
  import { simplePopup } from '../components/simple-popup.svelte';
  import { TextInput, PasswordInput } from 'carbon-components-svelte';
  import Button from '../components/global/button.svelte';
  import AxiosClient from '../axios-client.js';
  import Base64 from '../base64.js';

  export let Store;
  export let axios;

  console.log(Store);

  const axiosClient2 = AxiosClient.instance();
  const login = {
    email: {
      value: '',
      error: '',
    },
    pass: {
      value: '',
      error: '',
    },
  };

  async function submit() {
    if (login.email.value.replace(/ /g, '') === '') {
      login.email.error = 'Email input cannot be empty.';
      return;
    }
    login.email.error = '';
    if (login.pass.value.replace(/ /g, '') === '') {
      login.pass.error = 'Password input cannot be empty.';
      return;
    }
    login.pass.error = '';
    let result = await axiosClient2.send({
      url: '/auth/user',
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' + Base64.encode(login.email.value + ':' + login.pass.value),
      },
    });
    if (result.success === false) {
      console.log(result.error);
      simplePopup.error(result.error.response.data.message);
      return;
    }
    Store.set('accessToken', result.response.data.accessToken);
    Store.set('refreshToken', result.response.data.refreshToken);

    result = await axios.send({
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
    <h2>Log in</h2>
    <TextInput
      class="mt-50"
      invalid={login.email.error !== '' ? true : false}
      invalidText={login.email.error}
      labelText="Email"
      placeholder="- Email -"
      on:input={event => {
        login.email.value = event.target.value;
      }} />
    <PasswordInput
      class="mt-20"
      invalid={login.pass.error !== '' ? true : false}
      invalidText={login.pass.error}
      labelText="Password"
      placeholder="- Password -"
      on:input={event => {
        login.pass.value = event.target.value;
      }} />
    <div class="actions">
      <Button class="mt-50" on:click={submit}>Log in</Button>
    </div>
  </div>
</div>

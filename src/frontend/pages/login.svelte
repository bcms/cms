<script>
  import { simplePopup } from '../components/simple-popup.svelte';
  import AxiosClient from '../axios-client.js';
  import Base64 from '../base64.js';

  export let Store;
  export let axios;

  const axiosClient2 = AxiosClient.instance();
  const login = {
    email: '',
    pass: '',
  };

  async function submit() {
    if (login.email.trim() === '') {
      document.getElementById('email').style = 'border-color: var(--c-error);';
      simplePopup.error('Email input cannot be empty.');
      return;
    }
    document.getElementById('email').style = '';
    if (login.pass.trim() === '') {
      document.getElementById('pass').style = 'border-color: var(--c-error);';
      simplePopup.error('Password input cannot be empty.');
      return;
    }
    document.getElementById('pass').style = '';
    let result = await axiosClient2.send({
      url: '/auth/user',
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' + Base64.encode(login.email + ':' + login.pass),
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
    window.location = '/dashboard';
  }
</script>

<style>
  .login {
    max-width: 300px;
    margin: 100px auto auto auto;
  }

  .heading {
    text-align: center;
  }
  .block {
    border-radius: 2px;
    border-top-style: solid;
    border-top-width: 2px;
    border-top-color: var(--c-primary);
    margin-top: 20px;
    background-color: var(--c-white);
    padding: 20px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05);
  }

  .inputs {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 30px;
  }

  .actions {
    margin-top: 30px;
    text-align: right;
  }
</style>

<div class="login">
  <div class="heading">
    <img src="/logo.svg" alt="NF"/>
  </div>
  <div class="block">
    <div class="inputs">
      <div class="key-value">
        <div class="label">Email</div>
        <div class="value">
          <input
            id="email"
            class="input"
            type="text"
            placeholder="john@example.com"
            bind:value={login.email} />
        </div>
      </div>
      <div class="key-value">
        <div class="label">Password</div>
        <div class="value">
          <input
            id="pass"
            class="input"
            type="password"
            placeholder="Password"
            bind:value={login.pass} />
        </div>
      </div>
    </div>
    <div class="actions">
      <button class="button" on:click={submit}>Log in</button>
    </div>
  </div>
</div>

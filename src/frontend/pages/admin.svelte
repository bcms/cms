<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import TextInput from '../components/global/text-input.svelte';
  import PasswordInput from '../components/global/password-input.svelte';
  import { simplePopup } from '../components/simple-popup.svelte';
  import Button from '../components/global/button.svelte';
  import Axios from '../axios-client.js';

  const axios = Axios.instance();
  const data = {
    securityCode: {
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
    email: {
      value: '',
      error: '',
    },
    password: {
      value: '',
      confirm: '',
      error: '',
    },
  };

  async function isInitialized() {
    await axios.send({
      url: '/user/gen_admin_sec_code',
      method: 'POST',
    });
  }

  async function submit() {
    if (data.securityCode.value.replace(/ /g, '') === '') {
      data.securityCode.error = 'Security code is required.';
      return;
    }
    data.securityCode.error = '';
    if (data.email.value.replace(/ /g, '') === '') {
      data.email.error = 'Email is required.';
      return;
    }
    data.email.error = '';
    if (data.firstName.value.replace(/ /g, '') === '') {
      data.firstName.error = 'First name is required.';
      return;
    }
    data.firstName.error = '';
    if (data.lastName.value.replace(/ /g, '') === '') {
      data.lastName.error = 'Last name is required.';
      return;
    }
    data.lastName.error = '';
    if (data.password.value.replace(/ /g, '') === '') {
      data.password.error = 'Password is required.';
      return;
    }
    if (data.password.value !== data.password.confirm) {
      data.password.error = 'Passwords do not match.';
      return;
    }
    data.password.error = '';
    const result = await axios.send({
      url: '/user/create_admin',
      method: 'POST',
      data: {
        securityCode: data.securityCode.value,
        email: data.email.value,
        password: data.password.value,
        customPool: {
          personal: {
            firstName: data.firstName.value,
            lastName: data.lastName.value,
          },
        },
      },
    });
    if (result.success === false) {
      console.error(result.error.response.data.message);
      simplePopup.error(result.error.response.data.message);
      return;
    }
    navigate('/login', { replace: true });
  }

  onMount(() => {
    isInitialized();
  });
</script>

<style type="text/scss">
  .wrapper {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--c-primary-dark);
    overflow: auto;
  }

  .welcome {
    width: 400px;
    color: var(--c-white);
    display: flex;
    flex-direction: column;
    margin: 50px auto;
  }

  .welcome .pre-title {
    font-size: 16pt;
    font-weight: lighter;
  }

  .login {
    background-color: var(--c-white);
    padding: 50px;
    width: 400px;
    margin: 0 auto;
  }
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
    <h2>Initialize Admin User</h2>
    <TextInput
      class="mt-50"
      invalid={data.securityCode.error !== '' ? true : false}
      invalidText={data.securityCode.error}
      labelText="Security Code"
      helperText="This code can be found in server console."
      placeholder="- Security Code -"
      on:input={event => {
        data.securityCode.value = event.target.value;
      }} />
    <TextInput
      class="mt-20"
      invalid={data.email.error !== '' ? true : false}
      invalidText={data.email.error}
      labelText="Email"
      placeholder="- Email -"
      on:input={event => {
        data.email.value = event.target.value;
      }} />
    <TextInput
      class="mt-20"
      invalid={data.firstName.error !== '' ? true : false}
      invalidText={data.firstName.error}
      labelText="First Name"
      placeholder="- Fisrt Name -"
      on:input={event => {
        data.firstName.value = event.target.value;
      }} />
    <TextInput
      class="mt-20"
      invalid={data.lastName.error !== '' ? true : false}
      invalidText={data.lastName.error}
      labelText="Last Name"
      placeholder="- Last Name -"
      on:input={event => {
        data.lastName.value = event.target.value;
      }} />
    <PasswordInput
      class="mt-20"
      invalid={data.password.error !== '' ? true : false}
      invalidText={data.password.error}
      labelText="Password"
      placeholder="- Password -"
      on:input={event => {
        data.password.value = event.target.value;
      }} />
    <PasswordInput
      class="mt-20"
      invalid={data.password.error !== '' ? true : false}
      invalidText={data.password.error}
      labelText="Confirm Password"
      placeholder="- Confirm Password -"
      on:input={event => {
        data.password.confirm = event.target.value;
      }} />
    <div class="actions mt-50">
      <Button on:click={submit}>Submit</Button>
    </div>
  </div>
</div>

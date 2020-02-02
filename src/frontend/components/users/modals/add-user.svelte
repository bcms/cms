<script>
  import Modal from '../../modal.svelte';
  import { simplePopup } from '../../simple-popup.svelte';
  import { TextInput, PasswordInput } from 'carbon-components-svelte';

  export let events;

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
    if (data.email.value.replace(/ /g, '') === '') {
      data.email.error = 'Email input cannot be empty.';
      return;
    }
    data.email.error = '';
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
          policy: {
            media: {
              get: false,
              post: false,
              put: false,
              delete: false,
            },
            templates: [],
            webhooks: [],
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

<Modal heading={{ title: 'Add User' }} {events}>
  <TextInput
    labelText="First Name"
    placeholder="- First Name -"
    invalid={data.firstName.error !== '' ? true : false}
    invalidText={data.firstName.error}
    value={data.firstName.value}
    on:input={event => {
      data.firstName.value = event.target.value;
    }} />
  <TextInput
    labelText="Last Name"
    placeholder="- Last Name -"
    invalid={data.lastName.error !== '' ? true : false}
    invalidText={data.lastName.error}
    value={data.lastName.value}
    on:input={event => {
      data.lastName.value = event.target.value;
    }} />
  <TextInput
    labelText="Email"
    placeholder="- Email -"
    invalid={data.email.error !== '' ? true : false}
    invalidText={data.email.error}
    value={data.email.value}
    on:input={event => {
      data.email.value = event.target.value;
    }} />
  <PasswordInput
    showPasswordLabel=""
    hidePasswordLabel=""
    labelText="Password"
    placeholder="- Password -"
    invalid={data.password.error !== '' ? true : false}
    invalidText={data.password.error}
    value={data.password.value}
    on:input={event => {
      data.password.value = event.target.value;
    }} />
</Modal>

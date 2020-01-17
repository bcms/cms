<script>
  import Modal from '../../modal.svelte';
  import { simplePopup } from '../../simple-popup.svelte';

  export let axios;
  export let events;

  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: 'Create New Template',
  };
  let options = {
    name: '',
    type: 'DATA_MODEL',
    desc: '',
    entryTemplate: [],
  };
  let errors = {
    name: {
      value: false,
      message: '',
    },
    type: {
      value: false,
      message: '',
    },
  };

  function handleNameInput(event) {
    const value = event.currentTarget.value
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/_/g, '-')
      .replace(/[^0-9a-z---]+/g, '');
    options.name = value;
    event.currentTarget.value = value;
  }

  events.cancel = () => {
    options = {
      name: '',
      type: 'DATA_MODEL',
      desc: '',
      entryTemplate: [],
    };
    errors = {
      name: {
        value: false,
        message: '',
      },
      type: {
        value: false,
        message: '',
      },
    };
    events.toggle();
  };
  events.done = async () => {
    if (options.name.trim() === '') {
      errors.name = {
        value: true,
        message: 'Name input cannot be empty.',
      };
      return;
    }
    errors.name = {
      value: false,
      message: '',
    };
    if (options.type.trim() === '') {
      errors.type = {
        value: true,
        message: 'Type input cannot be empty.',
      };
      return;
    }
    errors.type = {
      value: false,
      message: '',
    };
    const result = await axios.send({
      url: '/template',
      method: 'POST',
      data: options,
    });
    if (result.success === false) {
      const message = result.error.response.data.message;
      if (message.indexOf(`name`) !== -1) {
        errors.name = {
          value: true,
          message,
        };
        return;
      }
      simplePopup.error(result.error.response.data.message);
      return;
    }
    events.toggle();
    if (events.callback) {
      events.callback(result.response.data.template);
    }
    options = {
      name: '',
      type: 'DATA_MODEL',
      desc: '',
      entryTemplate: [],
    };
    errors = {
      name: {
        value: false,
        message: '',
      },
      type: {
        value: false,
        message: '',
      },
    };
  };
</script>

<style>
  .content .title {
    padding-bottom: 5px;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: var(--c-white-dark);
    font-size: 14pt;
    font-weight: bold;
  }

  .content .options {
    margin-top: 20px;
    display: grid;
    grid-template-columns: auto;
    grid-gap: 20px;
  }
</style>

<Modal heading={modalHeading} {events}>
  <div class="content">
    <div class="title">Settings</div>
    <div class="options">
      <div class="key-value">
        <div class="label">
          Name
          {#if errors.name.value === true}
            <div style="font-size: 8pt; color: var(--c-error); margin-top: 5px;">
              <span class="fa fa-exclamation" />
              <span style="margin-left: 5px;">{errors.name.message}</span>
            </div>
          {/if}
        </div>
        <div class="value">
          <input
            class="input"
            on:keyup={handleNameInput}
            value={options.name}
            placeholder="Template Name..." />
        </div>
      </div>
      <div class="key-value">
        <div class="label">
          Type
          {#if errors.type.value === true}
            <div style="font-size: 8pt; color: var(--c-error); margin-top: 5px;">
              <span class="fa fa-exclamation" />
              <span style="margin-left: 5px;">{errors.type.message}</span>
            </div>
          {/if}
        </div>
        <div class="value">
          <select class="select" bind:value={options.type}>
            <option value="DATA_MODEL" selected>Date Model</option>
            <option value="RICH_CONTENT">Rich Text</option>
          </select>
        </div>
      </div>
      <div class="key-value">
        <div class="label">Description</div>
        <div class="value">
          <textarea
            class="input"
            bind:value={options.desc}
            placeholder="Template description" />
        </div>
      </div>
    </div>
  </div>
</Modal>

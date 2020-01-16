<script>
  import Modal from '../../modal.svelte';
  import { simplePopup } from '../../simple-popup.svelte';
  import StringUtil from '../../../string-util.js';

  export let axios;
  export let events;

  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: `Edit Template`,
  };
  let options = {
    _id: '',
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

  events.setTemplate = template => {
    options = {
      _id: template._id,
      name: template.name,
      type: template.type,
      desc: template.desc,
      entryTemplate: template.entryTemplate,
    };
  };
  events.cancel = () => {
    options = {
      _id: '',
      name: '',
      type: 'DATA_MODEL',
      desc: '',
      entryTemplate: [],
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
    options.changes = { props: [] };
    const result = await axios.send({
      url: '/template',
      method: 'PUT',
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
</style>

<Modal heading={modalHeading} {events}>
  <div class="content">
    <div class="title">Settings</div>
    <div class="options">
      <div class="key-value">
        <div class="label">
          Name
          {#if errors.name.value === true}
            <div style="font-size: 8pt; color: red; margin-top: 5px;">
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
            <div style="font-size: 8pt; color: red; margin-top: 5px;">
              <span class="fa fa-exclamation" />
              <span style="margin-left: 5px;">{errors.type.message}</span>
            </div>
          {/if}
        </div>
        <div class="value">
          <select class="select" bind:value={options.type}>
            {#if options.type === 'DATA_MODEL'}
              <option value="DATA_MODEL" selected>Date Model</option>
              <option value="RICH_CONTENT">Rich Text</option>
            {:else}
              <option value="DATA_MODEL">Date Model</option>
              <option value="RICH_CONTENT" selected>Rich Text</option>
            {/if}
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

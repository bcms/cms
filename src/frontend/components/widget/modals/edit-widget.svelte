<script>
  import Modal from '../../modal.svelte';
  import { simplePopup } from '../../simple-popup.svelte';
  import StringUtil from '../../../string-util.js';

  export let events;
  export let widget;

  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: `Edit Widget`,
  };
  let data = {
    _id: widget._id,
    name: {
      value: widget.name,
      error: ''
    },
    type: widget.type,
    desc: widget.desc,
    props: widget.props,
  };

  function handleNameInput(event) {
    const value = event.currentTarget.value
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/-/g, '_')
      .replace(/[^0-9a-z_-_]+/g, '');
    data.name.value = value;
    event.currentTarget.value = value;
  }

  events.cancel = () => {
    data = {
      _id: '',
      name: {
        value: '',
        error: '',
      },
      type: 'DATA_MODEL',
      desc: '',
      props: [],
    };
    events.toggle();
  };
  events.done = async () => {
    if (data.name.value.replace(/ /g, '') === '') {
      data.name.error = 'Name input cannot be empty.';
      return;
    }
    data.name.error = '';
    events.toggle();
    events.callback({
      _id: data._id,
      name: data.name.value,
      desc: data.desc,
    })
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
          {#if data.name.error !== ''}
            <div style="font-size: 8pt; color: var(--c-error); margin-top: 5px;">
              <span class="fa fa-exclamation" />
              <span style="margin-left: 5px;">{data.name.error}</span>
            </div>
          {/if}
        </div>
        <div class="value">
          <input
            class="input"
            on:keyup={handleNameInput}
            value={data.name.value}
            placeholder="- Group Name -" />
        </div>
      </div>
      <div class="key-value">
        <div class="label">Description</div>
        <div class="value">
          <textarea
            class="input"
            bind:value={data.desc}
            placeholder="- Group description -" />
        </div>
      </div>
    </div>
  </div>
</Modal>

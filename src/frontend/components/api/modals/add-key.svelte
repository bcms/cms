<script>
  import Modal from '../../modal.svelte';
  import { simplePopup } from '../../simple-popup.svelte';

  export let events;

  const KeyMethod = {
    ALL: 'ALL',
    POST: 'POST',
    PUT: 'PUT',
    GET: 'GET',
    DELETE: 'DELETE',
  };
  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: 'Create New API Key',
  };
  const modalFooter = {
    greenBtnLabel: 'Next',
  };
  let entries = [];
  let view = 1;
  let data = {
    name: {
      value: '',
      error: '',
    },
    desc: {
      value: '',
      error: '',
    },
    blocked: false,
    access: {
      global: {
        methods: [],
      },
      templates: [],
      functions: [],
    },
  };
  let setup = {
    view_3: {
      methods: [
        {
          value: 'ALL',
          text: 'Allow for All Methods',
          selected: false,
        },
        {
          value: 'POST',
          text: 'Allow Post Method',
          selected: false,
        },
        {
          value: 'PUT',
          text: 'Allow Put Method',
          selected: false,
        },
        {
          value: 'GET',
          text: 'Allow Get Method',
          selected: false,
        },
        {
          value: 'DELETE',
          text: 'Allow Delete Method',
          selected: false,
        },
      ],
    },
  };

  events.cancel = () => {
    data = {
      name: {
        value: '',
        error: '',
      },
      desc: {
        value: '',
        error: '',
      },
      blocked: false,
      access: {
        global: {
          methods: [],
        },
        templates: [],
        functions: [],
      },
    };
    view = 1;
    events.toggle();
  };
  events.done = async () => {
    switch (view) {
      case 1:
        {
          if (data.name.value.replace(/ /g, '') === '') {
            data.name.error = 'Name input cannot be empty.';
            return;
          }
          data.name.error = '';
        }
        break;
    }
    events.toggle();
    if (events.callback) {
      events.callback({
        name: data.name.value,
        desc: data.desc.value,
        blocked: data.blocked,
        access: data.access,
      });
    }
    data = {
      name: {
        value: '',
        error: '',
      },
      desc: {
        value: '',
        error: '',
      },
      blocked: false,
      access: {
        global: {
          methods: [],
        },
        templates: [],
        functions: [],
      },
    };
    view = 1;
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

<Modal heading={modalHeading} footer={modalFooter} {events}>
  <div class="content">
    <div class="title">Configuration</div>
    <div class="options">
      {#if view === 1}
        <div class="key-value">
          <div class="label">
            <span>Name</span>
            {#if data.name.error !== ''}
              <div style="font-size: 8pt; color: red; margin-top: 5px;">
                <span class="fa fa-exclamation" />
                <span style="margin-left: 5px;">{data.name.error}</span>
              </div>
            {/if}
          </div>
          <div class="value">
            <input
              class="input"
              placeholder="- Key Name -"
              bind:value={data.name.value} />
          </div>
        </div>
        <div class="key-value">
          <div class="label">
            <span>Description</span>
          </div>
          <div class="value">
            <textarea
              class="input"
              placeholder="- Key Description -"
              bind:value={data.desc.value} />
          </div>
        </div>
      {/if}
    </div>
  </div>
</Modal>

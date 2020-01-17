<script>
  import StringUtil from '../../../string-util.js';
  import uuid from 'uuid';
  import Modal from '../../modal.svelte';

  export let events;
  export let widgets;

  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: 'Add Section',
  };
  const primaries = [
    {
      name: 'HEADING_1',
    },
    {
      name: 'HEADING_2',
    },
    {
      name: 'HEADING_3',
    },
    {
      name: 'PARAGRAPH',
    },
    {
      name: 'LIST',
    },
    {
      name: 'MEDIA',
    },
    {
      name: 'CODE',
    },
  ];
  const embed = widgets.map(e => {
    return { name: e.name };
  });
  const id = uuid.v4();

  function select(type, additional) {
    if (events) {
      events.toggle();
      if (events.select) {
        events.select(type, additional);
      }
    }
  }

  events.cancel = () => {
    events.toggle();
  };
  events.done = async () => {
    events.cancel();
  };
</script>

<style>
  .primary .title {
    color: var(--c-gray-cold);
    background-color: var(--c-white-normal);
    font-size: 10pt;
    font-weight: bold;
    padding: 3px 10px;
  }

  .actions {
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 20px;
    width: 100%;
  }

  .action {
    display: grid;
    grid-template-columns: auto;
    width: 100%;
    border: none;
    background-color: var(--c-transparent);
    transition: 0.3s;
  }

  .action:hover {
    background-color: var(--c-white-dark);
    transition: 0.3s;
  }

  .action .icon {
    width: 40px;
    margin: 0 auto;
  }

  .action .icon img {
    width: 100%;
  }

  .action .name {
    font-weight: bold;
    font-size: 12pt;
    color: var(--c-primary);
  }

  .action .text {
    font-size: 8pt;
    color: var(--c-gray-cold);
  }

  .embed .title {
    margin-top: 20px;
    color: var(--c-gray-cold);
    background-color: var(--c-white-normal);
    font-size: 10pt;
    font-weight: bold;
    padding: 3px 10px;
  }
</style>

<Modal heading={modalHeading} {events}>
  <div {id} class="modal">
    <div class="primary">
      <div class="title">PRIMARY</div>
      <div class="actions">
        {#each primaries as primary}
          <button
            class="action"
            on:click={() => {
              select(primary.name);
            }}>
            <div class="icon">
              <img
                src="/assets/ics/entry/types/{primary.name}.png"
                alt={primary.name} />
            </div>
            <div class="text">{StringUtil.prettyName(primary.name)}</div>
          </button>
        {/each}
      </div>
    </div>
    <div class="embed">
      <div class="title">WIDGETS</div>
      <div class="actions">
        {#each embed as e}
          <button class="action" on:click={() => {
            select('WIDGET', e.name);
          }}>
            <div class="name">{StringUtil.prettyName(e.name)}</div>
            <div class="text">{StringUtil.prettyName(e.name)}</div>
          </button>
        {/each}
      </div>
    </div>
  </div>
</Modal>

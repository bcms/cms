<script>
  import StringUtil from '../../../string-util.js';
  import uuid from 'uuid';
  import Modal from '../../global/modal/modal.svelte';

  export let events;
  export let widgets;

  let position;

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
        events.select(type, position, additional);
        position = undefined;
      }
    }
  }

  events.setPosition = (p) => {
    position = p;
  }
  events.cancel = () => {
    events.toggle();
  };
  events.done = async () => {
    events.cancel();
  };
</script>

<style type="text/scss">
  @import './select-element.scss';
</style>

<Modal heading={modalHeading} {events}>
  <div {id} class="modal">
    <div class="section">
      <h4 class="title mt-20">PRIMARY</h4>
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
    <div class="section">
      <h4 class="title mt-20">WIDGETS</h4>
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

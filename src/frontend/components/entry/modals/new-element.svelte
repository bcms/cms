<script>
  import StringUtil from '../../../string-util.js';
  import uuid from 'uuid';
  import { onMount } from 'svelte';

  export let events;
  export let widgets;

  if (events) {
    events.toggle = () => {
      if (style.height === 0) {
        setTimeout(() => {
          state = true;
        }, 100);
        style.height = 600;
      } else {
        style.height = 0;
        setTimeout(() => {
          state = false;
        }, 100);
      }
    };
  }

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
    return { name: StringUtil.prettyName(e.name) };
  });
  const id = uuid.v4();
  let style = {
    height: 0,
  };
  let state = false;
  let clickListener;

  function select(type) {
    if (events) {
      events.toggle();
      if (events.select) {
        events.select(type);
      }
    }
  }

  onMount(() => {
    clickListener = document.body.addEventListener('click', function(event) {
      if (state === true) {
        if (
          !document.getElementById(id).contains(event.target) &&
          style.height !== 0
        ) {
          style.height = 0;
          state = false;
        }
      }
    });
  });
</script>

<style>
  .modal {
    border-radius: 5px;
    background-color: var(--c-neutral);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    width: 250px;
    overflow: hidden;
    transition: 1s;
    margin: 0 auto;
  }

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
    grid-template-columns: repeat(3, 1fr);
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

<div {id} class="modal" style="max-height: {style.height}px;">
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
        <button class="action">
          <div class="icon">
            <img src="/assets/ics/entry/types/{e.name}.png" alt={e.name} />
          </div>
          <div class="text">{StringUtil.prettyName(e.name)}</div>
        </button>
      {/each}
    </div>
  </div>
</div>

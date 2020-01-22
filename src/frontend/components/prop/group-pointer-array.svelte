<script>
  import { createEventDispatcher } from 'svelte';
  import Prop from './prop.svelte';
  import { TextArea } from 'carbon-components-svelte';
  import Props from './props.svelte';
  import StringUtil from '../../string-util.js';

  export let prop;
  export let error = '';
  export let events;

  const dispatch = createEventDispatcher();

  function init() {
    for (const i in prop.value.array) {
      const arr = prop.value.array[i];
      events.push({});
    }
  }
  init();
</script>

<style type="text/scss">
  @import './prop.scss';
</style>

<Prop name={prop.name} required={prop.required} type={prop.type} {error}>
  <div class="array">
    {#each prop.value.array as arr, i}
      <div class="group">
        <Props props={arr.value} events={events[i]} />
      </div>
    {/each}
    <button
      class="btn btn-blue-c"
      on:click={() => {
        dispatch('add', prop);
      }}>
      <div class="fas fa-plus icon" />
      <div class="text">Add Element</div>
    </button>
  </div>
</Prop>

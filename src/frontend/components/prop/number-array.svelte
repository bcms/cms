<script>
  import { createEventDispatcher } from 'svelte';
  import Prop from './prop.svelte';
  import { NumberInput } from 'carbon-components-svelte';
  import StringUtil from '../../string-util.js';

  export let prop;
  export let error = '';

  const dispatch = createEventDispatcher();
</script>

<style type="text/scss">
  @import './prop.scss';
</style>

<Prop name={prop.name} required={prop.required} type={prop.type} {error}>
  <div class="array">
    {#each prop.value as v, i}
      <NumberInput
        value={v}
        on:change={event => {
          prop.value[i] = event.detail;
        }} />
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

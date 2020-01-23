<script>
  import { createEventDispatcher } from 'svelte';
  import { Toggle } from 'carbon-components-svelte';
  import Prop from './prop.svelte';
  import Button from '../global/button.svelte';
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
      {#if v === true}
        <Toggle
          toggled={true}
          on:change={event => {
            prop.value[i] = event.target.checked;
          }} />
      {:else}
        <Toggle
          toggled={false}
          on:change={event => {
            prop.value[i] = event.target.checked;
          }} />
      {/if}
    {/each}
    <div class="action">
      <Button
        icon="fas fa-plus"
        size="small"
        kind="ghost"
        on:click={() => {
          dispatch('add', prop);
        }}>
        Add Item
      </Button>
    </div>
  </div>
</Prop>

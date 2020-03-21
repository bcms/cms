<script>
  import { createEventDispatcher } from 'svelte';
  import Toggle from '../global/toggle/small.svelte';
  import Prop from './prop.svelte';
  import Button from '../global/button.svelte';
  import PropArray from './prop-array.svelte';
  import PropArrayItem from './prop-array-item.svelte';
  import StringUtil from '../../string-util.js';

  export let prop;
  export let error = '';

  const dispatch = createEventDispatcher();
</script>

<style type="text/scss">
  @import './prop.scss';
</style>

<Prop name={prop.name} required={prop.required} type={prop.type} {error}>
  <PropArray on:add>
    {#each prop.value as v, i}
      <PropArrayItem prop={v} position={i} on:remove on:move>
        <Toggle
          toggled={prop.value[i]}
          size="30pt"
          on:change={event => {
            if (event.eventPhase === 0) {
              prop.value[i] = event.detail;
            }
          }} />
      </PropArrayItem>
    {/each}
  </PropArray>
</Prop>

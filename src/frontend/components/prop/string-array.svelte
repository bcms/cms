<script>
  import { createEventDispatcher } from 'svelte';
  import {
    TextArea,
    OverflowMenu,
    OverflowMenuItem,
  } from 'carbon-components-svelte';
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
        <TextArea
          cols="500"
          rows="1"
          value={v}
          on:input={event => {
            prop.value[i] = event.target.value;
          }}
          placeholder={`- ${StringUtil.prettyName(prop.name)} -`} />
      </PropArrayItem>
    {/each}
  </PropArray>
</Prop>

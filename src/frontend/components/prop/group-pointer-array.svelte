<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import Prop from './prop.svelte';
  import Props from './props.svelte';
  import Button from '../global/button.svelte';
  import PropArray from './prop-array.svelte';
  import PropArrayItem from './prop-array-item.svelte';
  import StringUtil from '../../string-util.js';

  export let groups = [];
  export let prop;
  export let error = '';
  export let events;

  const dispatch = createEventDispatcher();
  let isInitialized = false;

  function init() {
    const group = groups.find(e => e._id === prop.value._id);
    if (group) {
      return prop.value.array.map(arr => {
        const array = JSON.parse(JSON.stringify(arr));
        events.push({});
        group.props.forEach(prop => {
          if (!array.value.find(e => e.name === prop.name)) {
            array.value = [...array.value, JSON.parse(JSON.stringify(prop))];
          }
        });
        return array;
      });
    }
  }
  onMount(() => {
    setTimeout(() => {
      prop.value.array = init();
      isInitialized = true;
    }, 200);
  });
</script>

<style type="text/scss">
  @import './prop.scss';
</style>

{#if isInitialized === true}
  <Prop name={prop.name} required={prop.required} type={prop.type} {error}>
    <PropArray on:add>
      {#each prop.value.array as arr, i}
        <PropArrayItem prop={arr} position={i} on:remove on:move>
          <div class="group">
            <Props props={arr.value} events={events[i]} />
          </div>
        </PropArrayItem>
      {/each}
    </PropArray>
  </Prop>
{/if}

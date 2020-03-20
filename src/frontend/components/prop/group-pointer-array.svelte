<script>
  import { createEventDispatcher } from 'svelte';
  import { TextArea } from 'carbon-components-svelte';
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

  function init() {
    for (const i in prop.value.array) {
      const arr = prop.value.array[i];
      events.push({});
    }
    for (const j in prop.value.array) {
      const group = groups.find(e => e._id === prop.value._id);
      if (group) {
        for (const i in group.props) {
          if (
            !prop.value.array[j].value.find(e => e.name === group.props[i].name)
          ) {
            prop.value.array[j].value = [
              ...prop.value.array[j].value,
              JSON.parse(JSON.stringify(group.props[i])),
            ];
          }
        }
      }
    }
  }
  init();
</script>

<style type="text/scss">
  @import './prop.scss';
</style>

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

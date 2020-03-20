<script>
  import Prop from './prop.svelte';
  import { Select, SelectItem } from 'carbon-components-svelte';
  import StringUtil from '../../string-util.js';

  export let prop;
  export let error = '';
</script>

<Prop name={prop.name} required={prop.required} type={prop.type}>
  <Select
    invalid={error !== '' ? true : false}
    invalidText={error}
    selected={prop.value.selected}
    on:change={event => {
      if (event.eventPhase === 0) {
        prop.value.selected = event.detail;
      }
    }}>
    <SelectItem text="- Unselected -" value="" />
    {#each prop.value.items as item}
      <SelectItem text={StringUtil.prettyName(item)} value={item} />
    {/each}
  </Select>
</Prop>

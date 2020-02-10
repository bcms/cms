<script>
  import { entryStore } from '../../config.svelte';
  import Prop from './prop.svelte';
  import { Select, SelectItem } from 'carbon-components-svelte';
  import StringUtil from '../../string-util.js';

  export let prop;
  export let error = '';

  let entries = [];
  let entriesTitle = [];

  entryStore.subscribe(value => {
    entries = value.filter(e => e.templateId === prop.value.templateId);
    entriesTitle = entries.map(entry => {
      const temp = entry.content
        .find(e => e.lng === 'en')
        .props.find(p => p.name === prop.value.displayProp);
      if (temp) {
        return temp.value;
      }
    });
  });
</script>

<Prop name={prop.name} required={prop.required} type={prop.type}>
  <Select
    invalid={error !== '' ? true : false}
    invalidText={error}
    selected={prop.value.entryId}
    on:change={event => {
      if (event.eventPhase === 0) {
        prop.value.entryId = event.detail;
      }
    }}>
    <SelectItem text="- Unselected -" value="" />
    {#each entries as entry, i}
      <SelectItem text="{entriesTitle[i]} | {entry._id}" value={entry._id} />
    {/each}
  </Select>
</Prop>

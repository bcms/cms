<script>
  import { createEventDispatcher } from 'svelte';
  import { entryStore } from '../../config.svelte';
  import { Select, SelectItem } from 'carbon-components-svelte';
  import Button from '../global/button.svelte';
  import Prop from './prop.svelte';
  import StringUtil from '../../string-util.js';

  export let prop;
  export let error = '';

  const dispatch = createEventDispatcher();
  let entries = [];
  let entriesTitle = [];

  entryStore.subscribe(value => {
    if (value) {
      entries = value.filter(e => e.templateId === prop.value.templateId);
      entriesTitle = entries.map(entry => {
        if (prop.value.displayProp === 'main_title') {
          return entry.content
            .find(e => e.lng === 'en')
            .props.find(p => p.type === 'QUILL').value.heading.title;
        } else {
          const temp = entry.content
            .find(e => e.lng === 'en')
            .props.find(p => p.name === prop.value.displayProp);
          if (temp) {
            return temp.value;
          }
        }
      });
    }
  });
</script>

<style type="text/scss">
  @import './prop.scss';
</style>

<Prop name={prop.name} required={prop.required} type={prop.type} {error}>
  <div class="array">
    {#each prop.value.entryIds as id, i}
      <Select
        selected={id}
        on:change={event => {
          if (event.eventPhase === 0) {
            prop.value.entryIds[i] = event.detail;
          }
        }}>
        <SelectItem text="- Unselected -" value="" />
        {#each entries as entry, i}
          <SelectItem
            text="{entriesTitle[i]} | {entry._id}"
            value={entry._id} />
        {/each}
      </Select>
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

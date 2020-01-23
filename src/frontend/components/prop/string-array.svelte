<script>
  import { createEventDispatcher } from 'svelte';
  import { TextArea } from 'carbon-components-svelte';
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
      <TextArea
        cols="500"
        rows="1"
        value={v}
        on:input={event => {
          prop.value[i] = event.target.value;
        }}
        placeholder={`- ${StringUtil.prettyName(prop.name)} -`} />
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

<script>
  import Prop from './prop.svelte';
  import { Toggle } from 'carbon-components-svelte';

  export let prop;
  export let error = '';
</script>

<Prop name={prop.name} required={prop.required} type={prop.type} {error}>
  <Toggle
    on:change={event => {
      prop.value = event.target.checked;
    }} />
</Prop>

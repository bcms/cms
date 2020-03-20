<script>
  import Prop from './prop.svelte';
  import { NumberInput } from 'carbon-components-svelte';

  export let prop;
  export let error = '';
</script>

<Prop name={prop.name} required={prop.required} type={prop.type} {error}>
  <NumberInput
    value={prop.value}
    on:change={event => {
      prop.value = event.detail;
    }} />
</Prop>

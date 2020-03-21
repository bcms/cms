<script>
  import Prop from './prop.svelte';
  import NumberInput from '../global/number-input.svelte';

  export let prop;
  export let error = '';
</script>

<Prop name={prop.name} required={prop.required} type={prop.type} {error}>
  <NumberInput
    value={prop.value}
    on:change={event => {
      if (event.eventPhase === 0) {
        prop.value = event.detail;
      }
    }} />
</Prop>

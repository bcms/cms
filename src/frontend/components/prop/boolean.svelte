<script>
  import Prop from './prop.svelte';
  import Toggle from '../global/toggle/small.svelte';

  export let prop;
  export let error = '';
</script>

<Prop name={prop.name} required={prop.required} type={prop.type} {error}>
  <Toggle
    size="30pt"
    toggled={prop.value}
    on:change={event => {
      if (event.eventPhase === 0) {
        prop.value = event.detail;
      }
    }} />
</Prop>

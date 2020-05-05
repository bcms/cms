<script>
  import DatePicker from '../global/date-picker.svelte';
  import Prop from './prop.svelte';
  import StringUtil from '../../string-util.js';

  export let prop;
  export let error = '';
</script>

<Prop name={prop.name} required={prop.required} type={prop.type} {error}>
  <DatePicker
    value={prop.value}
    on:change={event => {
      prop.value = event.detail;
    }} />
</Prop>

<script>
  import { DatePicker, DatePickerInput, TimePicker } from 'carbon-components-svelte';
  import Prop from './prop.svelte';
  import StringUtil from '../../string-util.js';

  export let prop;
  export let error = '';

  let date;

  function handleDateTime() {
    prop.value = date.getTime();
  }
</script>

<Prop name={prop.name} required={prop.required} type={prop.type} {error}>
  <DatePicker
    datePickerType={'single'}
    value={prop.value}
    on:change={event => {
      if (event.eventPhase === 0) {
        date = event.detail.selectedDates[0];
        handleDateTime()
      }
    }}>
    <DatePickerInput />
  </DatePicker>
</Prop>

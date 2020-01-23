<script>
  import Prop from './prop.svelte';
  import { TextArea } from 'carbon-components-svelte';
  import StringUtil from '../../string-util.js';

  export let prop;
  export let error = '';
</script>

<Prop name={prop.name} required={prop.required} type={prop.type}>
  <TextArea
    invalid={error !== '' ? true : false}
    invalidText={error}
    cols="500"
    rows="1"
    value={prop.value}
    on:input={event => {
      prop.value = event.target.value;
    }}
    placeholder={`- ${StringUtil.prettyName(prop.name)} -`} />
</Prop>

<script>
  import Prop from './prop.svelte';
  import { TextArea } from 'carbon-components-svelte';
  import Props from './props.svelte';
  import StringUtil from '../../string-util.js';

  export let prop;
  export let error = '';
  export let events;
</script>

<style type="text/scss">
  @import './prop.scss';
</style>

<Prop name={prop.name} required={prop.required} type={prop.type} {error}>
  <div class="group">
    <Props props={prop.value.props} {events}/>
  </div>
</Prop>

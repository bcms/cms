<script>
  import Prop from './prop.svelte';
  import Props from './props.svelte';
  import StringUtil from '../../string-util.js';

  export let groups;
  export let prop;
  export let error = '';
  export let events;

  function init() {
    const group = groups.find(e => e._id === prop.value._id);
    if (group) {
      for (const i in group.props) {
        if (!prop.value.props.find(e => e.name === group.props[i].name)) {
          prop.value.props = [...prop.value.props, JSON.parse(JSON.stringify(group.props[i]))];
        }
      }
    }
  }

  init();
</script>

<style type="text/scss">
  @import './prop.scss';
</style>

<Prop name={prop.name} required={prop.required} type={prop.type} {error}>
  <div class="group">
    <Props props={prop.value.props} {events} />
  </div>
</Prop>

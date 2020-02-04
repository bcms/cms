<script>
  import Prop from './prop.svelte';
  import Media from '../widget/media.svelte';
  import StringUtil from '../../string-util.js';

  export let prop;
  export let error = '';
</script>

<Prop name={prop.name} required={prop.required} type={prop.type}>
  {#if error !== ''}
    <div class="bx--label" style="color: var(--c-error);">
      <span class="fas fa-exclamation" />
      &nbsp;
      <span>{error}</span>
    </div>
  {/if}
  <Media
    value={prop.value}
    noButtons={true}
    on:change={event => {
      if (event.eventPhase === 0) {
        prop.value = event.detail;
      }
    }} />
</Prop>

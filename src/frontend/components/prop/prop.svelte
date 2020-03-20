<script>
  import StringUtil from '../../string-util.js';

  export let name = 'None';
  export let required = false;
  export let type = 'STRING';
  export let error = '';
</script>

<style type="text/scss">
  @import './prop.scss';
</style>

<div class="prop">
  <div class="heading">
    <div class="name">{StringUtil.prettyName(name)}</div>
    <div class="fa fa-{required === true ? 'lock' : 'unlock'} lock" />
    {#if error !== ''}
      <div class="error">
        <span class="fas fa-exclamation icon" />
        <span class="text">{error}</span>
      </div>
    {/if}
    <div class="type">{StringUtil.prettyName(type)}</div>
  </div>
  <div class="content">
    <slot>
      <prop />
    </slot>
  </div>
</div>

<script>
  import PropString from './string.svelte';
  import PropStringArray from './string-array.svelte';
  import PropBoolean from './boolean.svelte';
  import PropBooleanArray from './boolean-array.svelte';
  import PropNumber from './number.svelte';
  import PropNumberArray from './number-array.svelte';
  import PropEnum from './enum.svelte';
  import PropGroupPointer from './group-pointer.svelte';

  export let props;
</script>

{#each props as prop}
  <div class="prop">
    {#if prop.type === 'STRING'}
      <PropString {prop} error={''} />
    {:else if prop.type === 'STRING_ARRAY'}
      <PropStringArray
        {prop}
        error={''}
        on:add={event => {
          if (event.eventPhase === 0) {
            prop.value.push('');
            props = [...props];
          }
        }} />
    {:else if prop.type === 'BOOLEAN'}
      <PropBoolean {prop} error={''} />
    {:else if prop.type === 'BOOLEAN_ARRAY'}
      <PropBooleanArray
        {prop}
        error={''}
        on:add={event => {
          if (event.eventPhase === 0) {
            prop.value.push(false);
            props = [...props];
          }
        }} />
    {:else if prop.type === 'NUMBER'}
      <PropNumber {prop} error={''} />
    {:else if prop.type === 'NUMBER_ARRAY'}
      <PropNumberArray
        {prop}
        error={''}
        on:add={event => {
          if (event.eventPhase === 0) {
            prop.value.push(0);
            props = [...props];
          }
        }} />
    {:else if prop.type === 'ENUMERATION'}
      <PropEnum {prop} error={''} />
    {:else if prop.type === 'GROUP_POINTER'}
      <PropGroupPointer {prop} error={''} />
    {/if}
  </div>
{/each}

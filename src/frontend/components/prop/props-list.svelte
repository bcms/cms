<script>
  import { createEventDispatcher } from 'svelte';
  import StringUtil from '../../string-util.js';

  export let groups;
  export let props;

  const dispatch = createEventDispatcher();
</script>

<style type="text/scss">
  @import './props-list.scss';
</style>

{#each props as prop, i}
  <div class="prop">
    <div class="img">
      <img src="/assets/ics/template/types/{prop.type}.png" alt="NF" />
    </div>
    <div class="name">{StringUtil.prettyName(prop.name)}</div>
    <div class="type">
      <div class="value">{StringUtil.prettyName(prop.type)}</div>
      {#if prop.type === 'GROUP_POINTER' || prop.type === 'GROUP_POINTER_ARRAY'}
        <div class="fas fa-long-arrow-alt-right group-pointer" />
        <a
          class="btn btn-green-c"
          href="/dashboard/group/editor?gid={prop.value._id}">
          <div class="fas fa-link icon" />
          <div class="text">
            {StringUtil.prettyName(groups.find(e => e._id === prop.value._id).name)}
          </div>
        </a>
      {/if}
    </div>
    {#if prop.required === true}
      <div class="fa fa-lock required" />
    {:else}
      <div class="fa fa-unlock required" />
    {/if}
    <div class="action">
      <button
        class="fa fa-edit"
        on:click={() => {
          dispatch('edit', { prop, i });
        }} />
    </div>
    <div class="action">
      <button
        class="fa fa-trash"
        on:click={() => {
          dispatch('remove', { prop, i });
        }} />
    </div>
  </div>
{/each}

<script>
  import { createEventDispatcher } from 'svelte';
  import OverflowMenu from '../global/overflow-menu.svelte';
  import OverflowMenuItem from '../global/overflow-menu-item.svelte';
  import Props from '../prop/props.svelte';
  import StringUtil from '../../string-util.js';

  export let groups;
  export let widget;
  export let events;

  const dispatch = createEventDispatcher();
  const propsEvents = {};

  events.validateAndGetProps = () => {
    return propsEvents.validateAndGetProps();
  };
</script>

<style type="text/scss">
  @import './widget.scss';
</style>

<div class="widget">
  <div class="head">
    <span class="fas fa-pepper-hot icon" />
    &nbsp;
    <span class="text">Widget | {StringUtil.prettyName(widget.name)}</span>
    <div class="move up">
      <OverflowMenu position="right">
        <OverflowMenuItem text="Move Up" on:click={() => {
          dispatch('move', 'up');
        }} />
        <OverflowMenuItem text="Move Down" on:click={() => {
          dispatch('move', 'down');
        }} />
        <OverflowMenuItem text="Remove" danger={true} on:click={() => {
          dispatch('delete', 'none');
        }} />
      </OverflowMenu>
    </div>
  </div>
  <div class="props">
    <Props {groups} props={widget.props} events={propsEvents} />
  </div>
</div>

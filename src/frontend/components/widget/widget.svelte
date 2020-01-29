<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '../global/button.svelte';
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
      <Button
        icon="fas fa-angle-up"
        onlyIcon={true}
        kind="ghost"
        size="small"
        on:click={() => {
          dispatch('move', 'up');
        }} />
    </div>
    <div class="move down">
      <Button
        icon="fas fa-angle-down"
        onlyIcon={true}
        kind="ghost"
        size="small"
        on:click={() => {
          dispatch('move', 'down');
        }} />
    </div>
    <div class="delete">
      <Button
        icon="fas fa-trash"
        kind="danger"
        size="small"
        on:click={() => {
          dispatch('delete', 'none');
        }}>
        Remove
      </Button>
    </div>
  </div>
  <div class="props">
    <Props {groups} props={widget.props} events={propsEvents} />
  </div>
</div>

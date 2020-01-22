<script>
  import { createEventDispatcher } from 'svelte';
  import Props from '../prop/props.svelte';
  import StringUtil from '../../string-util.js';

  export let widget;
  export let events;

  const dispatch = createEventDispatcher();
  const propsEvents = {};

  events.validateAndGetProps = () => {
    return propsEvents.validateAndGetProps();
  }
</script>

<style type="text/scss">
  @import './widget.scss';
</style>

<div class="widget">
  <div class="head">
    <span class="fas fa-pepper-hot icon" />
    &nbsp;
    <span class="text">Widget | {StringUtil.prettyName(widget.name)}</span>
    <button
      class="btn btn-blue-c fas fa-angle-up move up"
      on:click={() => {
        dispatch('move', 'up');
      }} />
    <button
      class="btn btn-blue-c fas fa-angle-down move down"
      on:click={() => {
        dispatch('move', 'up');
      }} />
    <button
      class="btn btn-red-c fas fa-trash delete"
      on:click={() => {
        dispatch('delete', widget);
      }} />
  </div>
  <div class="props">
    <Props props={widget.props} events={propsEvents} />
  </div>
</div>

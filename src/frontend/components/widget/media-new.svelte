<script>
  import { createEventDispatcher } from 'svelte';
  import { TextInput } from 'carbon-components-svelte';
  import MediaPickerModal from '../global/modal/media-picker.svelte';
  import Button from '../global/button.svelte';
  import StringUtil from '../../string-util.js';

  export let value;

  const dispatch = createEventDispatcher();
  const mediaPicketModalEvents = {};
</script>

<style type="text/scss">
  @import './widget.scss';

  .content {
    border: 5px solid #f4f4f4;
    padding: 20px;
    width: 100%;
  }

  .action {
    padding: 10px;
    border: 1px dashed var(--c-primary);
    text-align: center;
  }
</style>

<div class="widget">
  <div class="head">
    <span class="fas fa-pepper-hot icon" />
    &nbsp;
    <span class="text">Media</span>
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
  <div class="content">
    <div class="bx--label">Media path</div>
    <div class="bx--form__helper-text">
      {value === '' ? '- Not set -' : value}
    </div>
    <div class="action">
      <Button
        kind="ghost"
        on:click={() => {
          mediaPicketModalEvents.toggle();
        }}>
        Click to select a media
      </Button>
    </div>
  </div>
</div>
<MediaPickerModal events={mediaPicketModalEvents}/>

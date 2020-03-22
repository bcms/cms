<script>
  import { createEventDispatcher } from 'svelte';
  import { Store, forceFatch } from '../../config.svelte';
  import MediaPickerModal from '../global/modal/media-picker.svelte';
  import Button from '../global/button.svelte';
  import StringUtil from '../../string-util.js';

  export let value;
  export let noButtons = false;

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

  .heading {
    display: flex;
  }

  .info {
    width: 100%;
  }

  .img {
    margin-left: auto;
    width: 200px;
  }

  .img img {
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
    {#if noButtons === false}
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
    {/if}
  </div>
  <div class="content">
    <div class="heading">
      <div class="info">
        <div class="bx--label">Media path</div>
        <div class="bx--form__helper-text">
          {value === '' ? '- Not set -' : value}
        </div>
      </div>
      {#if value !== ''}
        <div class="img">
          <img
            src="/media/file?path={encodeURIComponent(value.replace('/media', ''))}&access_token={Store.get('accessToken')}"
            alt="File is not an image" />
        </div>
      {/if}
    </div>
    <div class="action">
      <Button
        kind="ghost"
        on:click={() => {
          forceFatch('media');
          mediaPicketModalEvents.toggle();
        }}>
        Click to select a media
      </Button>
    </div>
  </div>
</div>
<MediaPickerModal
  events={mediaPicketModalEvents}
  on:done={event => {
    if (event.eventPhase === 0) {
      value = event.detail;
      dispatch('change', value);
    }
  }} />

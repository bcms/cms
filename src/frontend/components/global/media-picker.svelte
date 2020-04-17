<script>
  import { createEventDispatcher } from 'svelte';
  import { Store, forceFatch } from '../../config.svelte';
  import Button from './button.svelte';
  import MediaPickerModal from './modal/media-picker.svelte';

  export { className as class };
  export let labelText;
  export let helperText;
  export let invalidText;
  export let value = '';

  const dispatch = createEventDispatcher();
  const modalEvents = {};
  let className = '';
</script>

<style>
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

<div class="{className} media-picker">
  {#if labelText}
    <label class="label">{labelText}</label>
    {#if helperText}
      <div class="helper-text">{helperText}</div>
    {/if}
  {/if}
  {#if invalidText}
    <div class="invalid-text">
      <span class="fas fa-exclamation icon" />
      {invalidText}
    </div>
  {/if}
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
          modalEvents.toggle();
        }}>
        Click to select a media
      </Button>
    </div>
  </div>
</div>
<MediaPickerModal
  events={modalEvents}
  on:done={event => {
    if (event.eventPhase === 0) {
      dispatch('change', event.detail);
    }
  }} />

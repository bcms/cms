<script>
  import Button from './global/button.svelte';

  export let heading;
  export let footer;
  export let events;

  let style = {
    right: -600,
  };
  let show = false;

  if (!events) {
    events = {};
  }
  events.toggle = () => {
    if (show === false) {
      show = true;
      setTimeout(() => {
        style = {
          right: 0,
        };
      }, 100);
    } else {
      style = {
        right: -600,
      };
      setTimeout(() => {
        show = false;
      }, 400);
    }
  };
  if (!events.done) {
    events.done = () => {
      console.error('Done function is not defined.');
    };
  }
  if (!events.cancel) {
    events.cancel = () => {
      console.error('CANCEL function is not defined.');
    };
  }
  if (!footer) {
    footer = {
      greenBtnLabel: 'Done',
    };
  }
</script>

<style type="text/scss">
  @import './modal.scss';
</style>

{#if show === true}
  <!-- <div
    class="overlay"
    style="opacity: {style.opacity}; filter: blur({style.blur}px);">
    <div class="content-box">
      <div class="heading">
        <div class="img">
          <img src={heading.icon} alt="NF" />
        </div>
        <div class="name">{heading.title}</div>
        <div class="close">
          <Button
            icon="fas fa-times"
            onlyIcon={true}
            kind="ghost"
            size={'small'}
            on:click={events.cancel} />
        </div>
      </div>
      <div class="settings">
        <slot>
          <modal />
        </slot>
      </div>
      <div class="footer">
        <Button kind="danger" on:click={events.cancel}>Cancel</Button>
        <div class="done">
          <Button icon="fas fa-check" on:click={events.done}>Done</Button>
        </div>
      </div>
    </div>
  </div> -->
  <div class="overlay">
    <div class="modal" style="right: {style.right}px;">
      <div class="heading">
        <div class="title">{heading.title}</div>
        <div class="close">
          <Button
            icon="fas fa-times"
            onlyIcon={true}
            kind="ghost"
            size={'field'}
            on:click={events.cancel} />
        </div>
      </div>
      <div class="content">
        <slot />
      </div>
      <div class="footer">
        <div class="cancel">
          <Button
            style="width: 100%;"
            kind="secondary"
            on:click={events.cancel}>
            Cancel
          </Button>
        </div>
        <div class="done">
          <Button style="width: 100%;" on:click={events.done}>Done</Button>
        </div>
      </div>
    </div>
  </div>
{/if}

<script>
  export let heading;
  export let footer;
  export let events;

  let style = {
    blur: 4,
    opacity: 0,
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
          blur: 0,
          opacity: 1,
        };
      }, 100);
    } else {
      style = {
        blur: 4,
        opacity: 0,
      };
      setTimeout(() => {
        show = false;
      }, 600);
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
    }
  }
</script>

<style type="text/scss">
  @import './modal.scss';
</style>

{#if show === true}
  <div
    class="overlay"
    style="opacity: {style.opacity}; filter: blur({style.blur}px);">
    <div class="content-box">
      <div class="heading">
        <div class="img">
          <img src={heading.icon} alt="NF" />
        </div>
        <div class="name">{heading.title}</div>
        <div class="close">
          <button class="fa fa-times" on:click={events.cancel} />
        </div>
      </div>
      <div class="settings">
        <slot>
          <modal />
        </slot>
      </div>
      <div class="footer">
        <button
          class="btn-border btn-l-padding btn-red-c btn-red-br"
          on:click={events.cancel}>
          <div class="text">Cancel</div>
        </button>
        <button
          class="btn-border btn-l-padding btn-green-c btn-green-br done"
          on:click={events.done}>
          <div class="icon fa fa-check" />
          <div class="text">{footer.greenBtnLabel}</div>
        </button>
      </div>
    </div>
  </div>
{/if}

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

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: rgba(0, 0, 0, 0.2);
    transition: 0.5s;
  }

  .content-box {
    display: flex;
    flex-direction: column;
    width: 900px;
    margin: 100px auto 30px auto;
    background-color: var(--c-white);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  }

  .heading {
    display: flex;
    align-content: center;
    background-color: #fafafa;
    padding: 20px;
  }

  .heading .img {
    display: flex;
    margin: auto 0;
  }

  .heading .img img {
    width: 30px;
  }

  .heading .name {
    margin: auto 0 auto 20px;
    font-size: 10pt;
  }

  .heading .close {
    margin-left: auto;
    width: 30px;
  }

  .heading .close button {
    width: 100%;
    height: 100%;
    font-size: 8pt;
    font-weight: bold;
    border: none;
    background-color: #fafafa;
    color: #c3c5c8;
  }

  .heading .close button:hover {
    color: var(--c-primary);
    transition: 0.2s;
  }

  .settings {
    padding: 20px;
  }

  .footer {
    display: flex;
    margin-top: auto;
    background-color: #eff3f6;
    padding: 20px;
    width: 100%;
  }

  .footer .done {
    margin-left: auto;
  }
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

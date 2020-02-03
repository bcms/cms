<script>
  import { createEventDispatcher } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import Button from '../button.svelte';

  export let heading;
  export let footer;
  export let events;
  export let width = 450;

  const dispatch = createEventDispatcher();
  let show = false;

  if (!events) {
    events = {};
  }

  events.toggle = () => {
    show = show === true ? false : true;
  };

  if (!footer) {
    footer = {
      greenBtnLabel: 'Done',
    };
  }
</script>

<style type="text/scss">
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  .modal {
    display: flex;
    flex-direction: column;
    background-color: var(--c-white);
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    transition: all 0.4s;
  }

  .heading {
    display: flex;
    align-content: center;
  }

  .heading h3 {
    margin: auto 0 auto 20px;
  }

  .heading .close {
    margin-left: auto;
  }

  .content {
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow-y: auto;
    width: 100%;
    height: 100%;
    margin-bottom: 20px;
  }

  .footer {
    margin-top: auto;
    display: flex;
  }

  .footer .cancel,
  .footer .done {
    width: 100%;
  }
</style>

{#if show === true}
  <div transition:fade class="overlay">
    <div transition:fly={{ x: width }} class="modal" style="width: {width}px;">
      <div class="heading">
        <h3>{heading.title}</h3>
        <div class="close">
          <Button
            icon="fas fa-times"
            onlyIcon={true}
            kind="ghost"
            size={'field'}
            on:click={() => {
              if (events.cancel) {
                events.cancel();
              }
              dispatch('cancel');
            }} />
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
            on:click={() => {
              if (events.cancel) {
                events.cancel();
              }
              dispatch('cancel');
            }}>
            Cancel
          </Button>
        </div>
        <div class="done">
          <Button
            style="width: 100%;"
            on:click={() => {
              if (events.cancel) {
                events.done();
              }
              dispatch('done');
            }}>
            Done
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}

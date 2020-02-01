<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '../button.svelte';

  export let heading;
  export let footer;
  export let events;

  const dispatch = createEventDispatcher();
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
    width: 450px;
    background-color: var(--c-white);
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    transition: 0.4s;
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
    display: grid;
    grid-template-columns: auto;
    grid-gap: 20px;
    padding: 20px;
    overflow-y: auto;
    width: 100%;
    margin-bottom: 20px;
  }

  .footer {
    margin-top: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 370px));
  }
</style>

{#if show === true}
  <div class="overlay">
    <div class="modal" style="right: {style.right}px;">
      <div class="heading">
        <h3>{heading.title}</h3>
        <div class="close">
          <Button
            icon="fas fa-times"
            onlyIcon={true}
            kind="ghost"
            size={'field'}
            on:click={() => {
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
              dispatch('cancel');
            }}>
            Cancel
          </Button>
        </div>
        <div class="done">
          <Button
            style="width: 100%;"
            on:click={() => {
              dispatch('done');
            }}>
            Done
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}

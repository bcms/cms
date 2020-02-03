<script>
  import Modal from '../../modal.svelte';
  import { CodeSnippet } from 'carbon-components-svelte';
  export let events;

  let dataModel = '{}';

  events.setDataModel = data => {
    dataModel = data;
  };
  events.cancel = () => {
    dataModel = '{}';
    events.toggle();
  };
  events.done = () => {
    dataModel = '{}';
    events.toggle();
  };
</script>

<style type="text/scss">
  .wrapper {
    font-family: 'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono',
      'Bitstream Vera Sans Mono', Courier, monospace;
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1rem;
    letter-spacing: 0.32px;
    background-color: var(--c-white-normal);
    width: 100%;
    overflow-x: auto;
  }

  .wrapper pre {
    padding: 20px;
  }
</style>

<Modal heading={{ title: 'Entry data model' }} {events}>
  <div class="wrapper">
    <pre>
      <code>{dataModel}</code>
    </pre>
  </div>
</Modal>

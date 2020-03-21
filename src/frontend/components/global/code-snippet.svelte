<script>
  import { createEventDispatcher } from 'svelte';

  export let secret = false;
  export let code = '';

  const dispatch = createEventDispatcher();
</script>

<style lang="scss">
  .code-snippet {
    display: grid;
    grid-template-columns: auto 40px;
    background-color: var(--c-gray-lighter);
    padding: 10px 0px 10px 15px;
  }

  .code-snippet .code {
    font-family: monospace;
    font-size: 10pt;
    margin: auto 0;
  }

  .code-snippet button {
    font-size: 12pt;
    border: none;
    background-color: #0000;
  }
</style>

<div class="code-snippet">
  <div class="code">{secret === false ? code : Array(code.length).join('*')}</div>
  <button
    on:click={() => {
      navigator.clipboard.writeText(code).then(() => {
        dispatch('copy', code);
      });
    }}>
    <span class="fas fa-copy" />
  </button>
</div>

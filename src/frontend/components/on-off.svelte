<script>
  export let events;
  export let init;
  export let stateMessages;

  let value = false;

  function setOn() {
    value = true;
    events.set(true);
  }
  function setOff() {
    value = false;
    events.set(false);
  }

  if (typeof init !== 'undefined') {
    value = init ? true : false;
  }
  if (typeof stateMessages === 'undefined') {
    stateMessages = {
      true: 'Enabled',
      false: 'Disabled',
    }
  }

  events.force = (state) => {
    value = state;
  }
</script>

<style>
  .on-off {
    display: flex;
  }

  .off {
    border-radius: 2px 0 0 2px;
  }

  .on {
    border-radius: 0 2px 2px 0;
  }

  .status {
    font-size: 10pt;
    margin: auto 0 auto 20px;
    color: #a3a3a3;
  }
</style>

<div class="on-off">
  {#if value === false}
    <div class="btn-fill btn-red-bg off">OFF</div>
    <button class="btn-border on" on:click={setOn}>ON</button>
    <div class="status">{stateMessages.false}</div>
  {:else}
    <button class="btn-border off" on:click={setOff}>OFF</button>
    <div class="btn-fill btn-green-bg on">ON</div>
    <div class="status">{stateMessages.true}</div>
  {/if}
</div>

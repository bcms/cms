<script>
  import Checkbox from '../global/checkbox.svelte';

  export let user;
</script>

<style type="text/scss">
  @import './policy.scss';
</style>

<div class="policy">
  <h4>Custom Portal Policy</h4>
  <div class="bx--label mt-20">User is able to:</div>
  {#if user.customPool.policy.customPortal.get === true}
    <Checkbox
      disabled={(user.customPool.policy.customPortal.post === true || user.customPool.policy.customPortal.delete) === true ? true : false}
      labelText="View media"
      checked={true}
      on:change={event => {
        user.customPool.policy.customPortal.get = event.target.checked;
      }} />
  {:else}
    <Checkbox
      labelText="View media"
      checked={false}
      on:change={event => {
        user.customPool.policy.customPortal.get = event.target.checked;
      }} />
  {/if}
  {#if user.customPool.policy.customPortal.post === true}
    <Checkbox
      labelText="Upload and update media"
      checked={true}
      on:change={event => {
        user.customPool.policy.customPortal.post = event.target.checked;
        user.customPool.policy.customPortal.put = event.target.checked;
      }} />
  {:else}
    <Checkbox
      labelText="Upload and update media"
      checked={false}
      on:change={event => {
        user.customPool.policy.customPortal.get = event.target.checked;
        user.customPool.policy.customPortal.post = event.target.checked;
        user.customPool.policy.customPortal.put = event.target.checked;
      }} />
  {/if}
  {#if user.customPool.policy.customPortal.delete === true}
    <Checkbox
      labelText="Delete media"
      checked={true}
      on:change={event => {
        user.customPool.policy.customPortal.delete = event.target.checked;
      }} />
  {:else}
    <Checkbox
      labelText="Delete media"
      checked={false}
      on:change={event => {
        user.customPool.policy.customPortal.get = event.target.checked;
        user.customPool.policy.customPortal.delete = event.target.checked;
      }} />
  {/if}
</div>

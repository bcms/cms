<script>
  import { Checkbox } from 'carbon-components-svelte';
  import StringUtil from '../../string-util.js';

  export let user;
  export let webhook;

  let policy = {
    _id: webhook._id,
    get: false,
    post: false,
    put: false,
    delete: false,
  };

  if (!user.customPool.policy.webhooks.find(e => e._id === webhook._id)) {
    user.customPool.policy.webhooks.push(policy);
  } else {
    policy = user.customPool.policy.webhooks.find(e => e._id === webhook._id);
  }
</script>

<style type="text/scss">
  @import './policy.scss';
</style>

<div class="policy">
  <h4>
    Webhook
    <u>{StringUtil.prettyName(webhook.name)}</u>
    Policy
  </h4>
  <div class="bx--label mt-20">For this webhook, User is able to:</div>
  {#if policy.get === true}
    <Checkbox
      disabled={(policy.post === true || policy.delete) === true ? true : false}
      labelText="Invoke action"
      checked={true}
      on:change={event => {
        policy.get = event.target.checked;
      }} />
  {:else}
    <Checkbox
      labelText="Invoke action"
      checked={false}
      on:change={event => {
        policy.get = event.target.checked;
      }} />
  {/if}
</div>

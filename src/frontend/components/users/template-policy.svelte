<script>
  import { fade } from 'svelte/transition';
  import Checkbox from '../global/checkbox.svelte';
  import StringUtil from '../../string-util.js';

  export let user;
  export let template;

  let policy = {
    _id: template._id,
    get: false,
    post: false,
    put: false,
    delete: false,
  };

  if (!user.customPool.policy.templates.find(e => e._id === template._id)) {
    user.customPool.policy.templates.push(policy);
  } else {
    policy = user.customPool.policy.templates.find(e => e._id === template._id);
  }
</script>

<style type="text/scss">
  @import './policy.scss';
</style>

<div class="policy" transition:fade={{ duration: 100 }}>
  <h4>
    Template
    <u>{StringUtil.prettyName(template.name)}</u>
    Policy
  </h4>
  <div class="bx--label mt-20">For this template, User is able to:</div>
  {#if policy.get === true}
    <Checkbox
      disabled={(policy.post === true || policy.delete) === true ? true : false}
      labelText="View template Entries"
      checked={true}
      on:change={event => {
        policy.get = event.target.checked;
      }} />
  {:else}
    <Checkbox
      labelText="View template Entries"
      checked={false}
      on:change={event => {
        policy.get = event.target.checked;
      }} />
  {/if}
  {#if policy.post === true}
    <Checkbox
      labelText="Add and update template Entries"
      checked={true}
      on:change={event => {
        policy.post = event.target.checked;
        policy.put = event.target.checked;
      }} />
  {:else}
    <Checkbox
      labelText="Add and update template Entries"
      checked={false}
      on:change={event => {
        policy.get = event.target.checked;
        policy.post = event.target.checked;
        policy.put = event.target.checked;
      }} />
  {/if}
  {#if policy.delete === true}
    <Checkbox
      labelText="Delete template Entries"
      checked={true}
      on:change={event => {
        policy.delete = event.target.checked;
      }} />
  {:else}
    <Checkbox
      labelText="Delete template Entries"
      checked={false}
      on:change={event => {
        policy.get = event.target.checked;
        policy.delete = event.target.checked;
      }} />
  {/if}
</div>

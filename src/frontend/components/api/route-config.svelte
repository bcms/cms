<script>
  import { createEventDispatcher } from 'svelte';
  import Select from '../global/select/select.svelte';
  import SelectItem from '../global/select/select-item.svelte';
  import Checkbox from '../global/checkbox.svelte';
  import Button from '../global/button.svelte';
  import StringUtil from '../../string-util.js';

  export let configType;
  export let templates;
  export let functions;
  export let config;

  const dispatch = createEventDispatcher();
  const configTypes = ['Template', 'Function'];
  const configMethods = ['GET_ALL', 'GET', 'POST', 'PUT', 'DELETE'];

  let data = {
    nameOrIdError: '',
  };

  function validate() {
    if (config.template._id.value === '') {
      config.template.error = 'Please select Template.';
      return false;
    }
    config.template.error = '';
    if (config.template.method.values.length === 0) {
      config.template.method.error = 'Select at least 1 method.';
      return false;
    }
    config.template.method.error = '';
    return true;
  }
  function handleMethodCheck(type, method, value) {
    if (value === true) {
      if (type === 'Entry') {
        config.entry.methods.push(method);
      } else {
        config.methods.push(method);
      }
    } else {
      if (type === 'Entry') {
        config.entry.methods = config.entry.methods.filter(e => e !== method);
      } else {
        config.methods = config.methods.filter(e => e !== method);
      }
    }
  }
</script>

<style type="text/scss">
  .heading {
    background-color: #e0e0e0;
    display: flex;
  }

  .heading .title {
    font-size: 12pt;
    margin: auto 0 auto 20px;
  }

  .heading .remove {
    margin-left: auto;
  }

  .content {
    background-color: #f4f4f4;
    padding: 20px;
  }

  .content .options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 20px;
  }
</style>

<div class="config">
  <div class="heading">
    <div class="title">
      <span class="fas fa-{configType === 'Template' ? 'cubes' : 'code'}" />
      &nbsp;{configType}
    </div>
    <div class="remove">
      <Button
        icon="fas fa-times"
        onlyIcon={true}
        kind="ghost"
        on:click={() => {
          dispatch('remove');
        }} />
    </div>
  </div>
  <div class="content">
    {#if configType === 'Template'}
      <Select
        labelText="Select a Template"
        invalid={data.nameOrIdError !== '' ? true : false}
        invalidText={data.nameOrIdError}
        selected={config._id}
        on:change={event => {
          if (event.eventPhase === 0) {
            config._id = event.detail;
          }
        }}>
        <SelectItem value="" text="- Unspecified -" />
        {#each templates as template}
          <SelectItem
            value={template._id}
            text={StringUtil.prettyName(template.name)} />
        {/each}
      </Select>
      <div class="options mt-20">
        <div>
          <div class="bx--legend">Template Methods</div>
          {#if config.methods.find(e => e === 'GET')}
            <Checkbox
              checked={true}
              labelText="Get"
              on:change={event => {
                handleMethodCheck('Template', 'GET', event.target.checked);
              }} />
          {:else}
            <Checkbox
              labelText="Get"
              on:change={event => {
                handleMethodCheck('Template', 'GET', event.target.checked);
              }} />
          {/if}
        </div>
        <div>
          <div class="bx--legend">Entry Methods</div>
          {#each configMethods as method}
            {#if config.entry.methods.find(e => e === method)}
              <Checkbox
                checked={true}
                labelText={StringUtil.prettyName(method)}
                on:change={event => {
                  handleMethodCheck('Entry', method, event.target.checked);
                }} />
            {:else}
              <Checkbox
                labelText={StringUtil.prettyName(method)}
                on:change={event => {
                  handleMethodCheck('Entry', method, event.target.checked);
                }} />
            {/if}
          {/each}
        </div>
      </div>
    {:else}
      <Select
        labelText="Select a Function"
        invalid={data.nameOrIdError !== '' ? true : false}
        invalidText={data.nameOrIdError}
        selected=""
        on:change={event => {
          if (event.eventPhase === 0) {
            config.name = event.detail;
          }
        }}>
        <SelectItem value="" text="- Unspecified -" />
        {#each functions as fn}
          <SelectItem value={fn} text={StringUtil.prettyName(fn)} />
        {/each}
      </Select>
    {/if}
  </div>
</div>

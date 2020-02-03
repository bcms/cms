<script>
  import { Select, SelectItem, Checkbox } from 'carbon-components-svelte';
  import Button from '../global/button.svelte';
  import StringUtil from '../../string-util.js';

  export let configType;
  export let templates;
  export let functions;
  export let config;

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
      <Button icon="fas fa-times" onlyIcon={true} kind="ghost" />
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
  <!-- <div class="heading">
    {#if configType === 'Template'}
      <div class="fas fa-cubes icon" />
    {:else if configType === 'Entry'}
      <div class="fas fa-cube icon" />
    {:else if configType === 'Function'}
      <div class="fas fa-code icon" />
    {/if}
    <div class="name">{configType}</div>
    <div class="actions">
      <button
        class="btn btn-red-c delete"
        on:click={() => {
          events.remove();
        }}>
        <div class="fas fa-times icon" />
      </button>
    </div>
  </div>
  <div class="settings">
    {#if configType === 'Template'}
      <div class="key-value">
        <div class="label">
          <span>Select Template</span>
        </div>
        <div class="value">
          <select class="select" bind:value={config._id}>
            {#if config._id === ''}
              <option value="">- Unselected -</option>
            {/if}
            {#each templates as template}
              {#if template._id === config._id}
                <option value={template._id} selected>
                  {StringUtil.prettyName(template.name)}
                </option>
              {:else}
                <option value={template._id}>
                  {StringUtil.prettyName(template.name)}
                </option>
              {/if}
            {/each}
          </select>
        </div>
      </div>
      <div class="key-value">
        <div class="label">
          <span>Select allowed methods for Template</span>
        </div>
        <div class="value checkbox-group">
          <div class="item">
            {#if config.methods.find(e => e === 'GET')}
              <input
                class="box"
                type="checkbox"
                value="GET"
                checked
                on:change={event => {
                  handleMethodCheck('Template', 'GET', event.target.checked);
                }} />
            {:else}
              <input
                class="box"
                type="checkbox"
                value="GET"
                on:change={event => {
                  handleMethodCheck('Template', "GET", event.target.checked);
                }} />
            {/if}
            <div class="text">{StringUtil.prettyName("GET")}</div>
          </div>
        </div>
      </div>
      <div class="key-value">
        <div class="label">Select allowed methods for Entries</div>
        <div class="value checkbox-group">
          {#each configMethods as method}
            <div class="item">
              {#if config.entry.methods.find(e => e === method)}
                <input
                  class="box"
                  type="checkbox"
                  value={method}
                  checked
                  on:change={event => {
                    handleMethodCheck('Entry', method, event.target.checked);
                  }} />
              {:else}
                <input
                  class="box"
                  type="checkbox"
                  value={method}
                  on:change={event => {
                    handleMethodCheck('Entry', method, event.target.checked);
                  }} />
              {/if}
              <div class="text">{StringUtil.prettyName(method)}</div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="key-value">
        <div class="label">Select a Function</div>
        <div class="value">
          <select class="select" bind:value={config.name}>
            {#if config.name === ''}
              <option value="" selected>- Unselected -</option>
            {/if}
            {#each functions as fn}
              {#if fn.name === config.name}
                <option value={fn} selected>{StringUtil.prettyName(fn)}</option>
              {:else}
                <option value={fn}>{StringUtil.prettyName(fn)}</option>
              {/if}
            {/each}
          </select>
        </div>
      </div>
    {/if}
  </div> -->
</div>

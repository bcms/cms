<script>
  import StringUtil from '../../string-util.js';

  export let configType;
  export let templates;
  export let functions;
  export let config;
  export let events;

  const configTypes = ['Template', 'Function'];
  const configMethods = ['GET_ALL', 'GET', 'POST', 'PUT', 'DELETE'];

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
  @import './route-config.scss';
</style>

<div class="config">
  <div class="heading">
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
  </div>
</div>

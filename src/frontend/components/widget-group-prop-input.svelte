<script>
  import WidgetGroupPropInput from './widget-group-prop-input.svelte';
  import OnOff from './on-off.svelte';
  import StringUtil from '../string-util.js';

  export let parentProp;
  export let errors;
  export let events;

  let groupPropEvents = {};

  function handleDateTimeInput(type, event, prop) {
    const d = new Date(prop.value);
    if (type === 'date') {
      const parts = event.target.value.split('-').map(e => {
        return parseInt(e);
      });
      d.setYear(parts[0]);
      d.setMonth(parts[1] - 1);
      d.setDate(parts[2]);
    } else {
      const parts = event.target.value.split(':').map(e => {
        return parseInt(e);
      });
      d.setHours(parts[0]);
      d.setMinutes(parts[1]);
    }
    prop.value = d.getTime();
  }

  if (!events) {
    events = {};
  }
  if (!errors) {
    errors = {};
  }

  events.checkProps = () => {
    for (const i in parentProp.value.props) {
      const prop = parentProp.value.props[i];
      if (prop.required === true) {
        switch (prop.type) {
          case 'STRING':
            {
              if (prop.value.replace(/ /g, '') === '') {
                errors[prop.name] = 'Value is required and cannot be emplty.';
                return false;
              }
              errors[prop.name] = '';
            }
            break;
          case 'DATE':
            {
              if (prop.value === 0) {
                errors[prop.name] =
                  'Property is required, please select time and date.';
                return;
              }
              errors[prop.name] = '';
            }
            break;
          case 'ENUMERATION':
            {
              if (prop.value.selected.replace(/ /g, '') === '') {
                errors[prop.name] = 'Please selece an option.';
                return false;
              }
              errors[prop.name] = '';
            }
            break;
          case 'GROUP_POINTER':
            {
              if (groupPropEvents[prop.name].checkProps() === false) {
                return false;
              }
            }
            break;
        }
      }
    }
    return true;
  };
</script>

<style>
  .wrapper {
    padding: 20px 20px 0 20px;
    display: grid;
    grid-template-columns: auto;
    grid-gap: 20px;
  }

  .label {
    display: flex;
  }

  .label .icon {
    margin: auto 20px auto 0;
    color: var(--c-secondary);
  }

  .label .type {
    font-weight: bold;
    margin: auto 0 auto auto;
    color: #d8d8d8;
  }

  .label .lock {
    margin: auto 0 auto 10px;
    color: #d8d8d8;
  }

  .gp-label {
    padding: 5px;
    border-bottom: 1px solid #d8d8d8;
  }
</style>

<div class="wrapper">
  {#each parentProp.value.props as prop}
    <div class="key-value {prop.type === 'GROUP_POINTER' ? 'pointer' : ''}">
      {#if prop.type === 'GROUP_POINTER'}
        <div class="label gp-label">
          <span class="fas fa-object-group icon" />
          <span class="text">{StringUtil.prettyName(prop.name)}</span>
          {#if prop.required === true}
            <span class="fas fa-lock lock" />
          {:else}
            <span class="fas fa-unlock lock" />
          {/if}
          <span class="type">{StringUtil.prettyName(prop.type)}</span>
        </div>
      {:else}
        <div class="label">
          <span class="text">{StringUtil.prettyName(prop.name)}</span>
          {#if prop.required === true}
            <span class="fas fa-lock lock" />
          {:else}
            <span class="fas fa-unlock lock" />
          {/if}
          <span class="type">{StringUtil.prettyName(prop.type)}</span>
        </div>
      {/if}
      <div class="value">
        {#if prop.type === 'STRING'}
          <textarea
            class="input"
            style="font-family: monospace; font-size: 10pt;"
            bind:value={prop.value} />
        {:else if prop.type === 'DATE'}
          <div class="date">
            <div class="key-value">
              <div class="label">Date</div>
              <div class="value">
                <input
                  class="input"
                  type="date"
                  on:change={event => {
                    handleDateTimeInput('date', event, prop);
                  }} />
              </div>
            </div>
            <div class="key-value">
              <div class="label">Time</div>
              <div class="value">
                <input
                  class="input"
                  type="time"
                  on:change={event => {
                    handleDateTimeInput('time', event, prop);
                  }} />
              </div>
            </div>
          </div>
        {:else if prop.type === 'BOOLEAN'}
          <OnOff bindValue={prop.value} />
        {:else if prop.type === 'NUMBER'}
          <input
            id="date"
            class="input"
            type="number"
            bind:value={prop.value} />
        {:else if prop.type === 'ENUMERATION'}
          <select class="select" bind:value={prop.value.selected}>
            {#each prop.value.list as item}
              <option value={item}>{StringUtil.prettyName(item)}</option>
            {/each}
          </select>
        {:else if prop.type === 'GROUP_POINTER'}
          <WidgetGroupPropInput
            parentProp={prop}
            errors={errors[prop.name]}
            events={groupPropEvents[prop.name]} />
        {/if}
        <div class="break" />
      </div>
    </div>
  {/each}
</div>

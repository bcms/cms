<script>
  import GroupPropInput from './group-prop-input.svelte';
  import OnOff from './on-off.svelte';
  import StringUtil from '../string-util.js';

  export let parentProp;
  export let errors;
  export let events;

  let groupPropEvents = {};

  function initGroupPropEvents() {
    for (const i in parentProp.value.props) {
      const prop = parentProp.value.props[i];
      if (prop.type === 'GROUP_POINTER') {
        groupPropEvents[prop.name] = { init: true };
      }
    }
  }
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
                errors[prop.name] = 'Property is required, please select time and date.';
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
  // initGroupPropEvents();
</script>

<style>
  .wrapper {
    padding: 10px;
  }

  .group {
    padding: 20px;
    background-color: var(--c-white);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  }

  .pointer {
    border-radius: 5px;
    padding: 5px;
    background-color: var(--c-neutral);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
  }

  .flex-label {
    display: flex;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: #eee;
    padding-bottom: 5px;
  }

  .flex-label .icon {
    margin-left: 20px;
    width: 30px;
  }

  .flex-label .icon img {
    width: 100%;
  }

  .flex-label .type {
    margin-left: auto;
  }

  .flex-label .name {
    font-size: 12pt;
  }

  .flex-label .lock {
    margin: auto 0 auto 10px;
    color: #afafaf;
  }

  .flex-label .error {
    margin: auto 0 auto 20px;
    color: red;
    display: flex;
  }

  .flex-label .error .icon {
    margin: auto 0;
  }

  .flex-label .error .text {
    margin: auto 0;
  }

  .break {
    margin-bottom: 30px;
  }
</style>

<div class="wrapper">
  <div class="group">
    {#each parentProp.value.props as prop}
      <div class="key-value {prop.type === 'GROUP_POINTER' ? 'pointer' : ''}">
        <div class="label flex-label">
          <div class="name">{StringUtil.prettyName(prop.name)}</div>
          {#if prop.required === true}
            <div class="fa fa-lock lock" />
          {:else}
            <div class="fa fa-unlock lock" />
          {/if}
          {#if prop.type !== 'GROUP_POINTER' && errors[prop.name] && errors[prop.name] !== ''}
            <div class="error">
              <span class="fas fa-exclamation icon" />
              <span class="text">{errors[prop.name]}</span>
            </div>
          {/if}
          <div class="type">{StringUtil.prettyName(prop.type)}</div>
          <div class="icon">
            <img src="/assets/ics/template/types/{prop.type}.png" alt="NF" />
          </div>
        </div>
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
            <GroupPropInput
              parentProp={prop}
              errors={errors[prop.name]}
              events={groupPropEvents[prop.name]} />
          {/if}
          <div class="break" />
        </div>
      </div>
    {/each}
  </div>
</div>

<script>
  import { onMount } from 'svelte';
  import { simplePopup } from './simple-popup.svelte';
  import OnOff from './on-off.svelte';
  import GroupPropInput from './group-prop-input.svelte';
  import StringUtil from '../string-util.js';

  export let events;
  export let props;

  let datePicker;
  let errors = {};
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
  function initErrorPaths() {
    for (const i in props) {
      const prop = props[i];
      if (prop.type === 'GROUP_POINTER') {
        errors[prop.name] = createErrorPathForGroupPointer(prop);
      } else {
        errors[prop.name] = '';
      }
    }
  }
  function createErrorPathForGroupPointer(parentProp) {
    const object = {};
    for (const i in parentProp.value.props) {
      const prop = parentProp.value.props[i];
      if (prop.type === 'GROUP_POINTER') {
        object[prop.name] = createErrorPathForGroupPointer(prop);
      } else {
        object[prop.name] = '';
      }
    }
    return object;
  }
  function initGroupPropEvents() {
    for (const i in props) {
      const prop = props[i];
      if (prop.type === 'GROUP_POINTER') {
        groupPropEvents[prop.name] = { init: true };
      }
    }
  }

  events.validateAndGetProps = () => {
    for (const i in props) {
      const prop = props[i];
      if (prop.required === true) {
        switch (prop.type) {
          case 'STRING':
            {
              if (prop.value.replace(/ /g, '') === '') {
                errors[prop.name] = 'Value is required and cannot be emplty.';
                simplePopup.error(
                  `Error in property '${StringUtil.prettyName(prop.name)}'.`,
                );
                return;
              }
              errors[prop.name] = '';
            }
            break;
          case 'DATE':
            {
              if (prop.value === 0) {
                errors[prop.name] =
                  'Property is required, please select time and date.';
                simplePopup.error(
                  `Error in property '${StringUtil.prettyName(prop.name)}'.`,
                );
                return;
              }
              errors[prop.name] = '';
            }
            break;
          case 'ENUMERATION':
            {
              if (prop.value.selected.replace(/ /g, '') === '') {
                errors[prop.name] = 'Please selece an option.';
                simplePopup.error(
                  `Error in property '${StringUtil.prettyName(prop.name)}'.`,
                );
                return;
              }
              errors[prop.name] = '';
            }
            break;
          case 'GROUP_POINTER':
            {
              if (groupPropEvents[prop.name].checkProps() === false) {
                simplePopup.error(
                  `Error in property '${StringUtil.prettyName(prop.name)}'.`,
                );
                return;
              }
            }
            break;
        }
      }
    }
    return JSON.parse(JSON.stringify(props));
  };
  events.updateProps = newProps => {
    props = newProps;
    initGroupPropEvents();
    initErrorPaths();
  };
  initGroupPropEvents();
  initErrorPaths();
</script>

<style>
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

  .pointer {
    border-radius: 5px;
    padding: 5px;
    background-color: var(--c-neutral);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
  }

  .content {
    display: grid;
    grid-gap: 20px;
  }

  .content .prop .date {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 20px;
  }

  .break {
    margin-bottom: 30px;
  }
</style>

<div class="content">
  {#each props as prop, i}
    <div class="prop">
      <div class="key-value {prop.type === 'GROUP_POINTER' ? 'pointer' : ''}">
        <div class="label flex-label">
          <div class="name">{StringUtil.prettyName(prop.name)}</div>
          {#if prop.required === true}
            <div class="fa fa-lock lock" />
          {:else}
            <div class="fa fa-unlock lock" />
          {/if}
          {#if prop.type !== 'GROUP_POINTER' && errors[prop.name] !== ''}
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
            <OnOff
              init={prop.value}
              events={{ set: value => {
                  prop.value = value;
                } }} />
          {:else if prop.type === 'NUMBER'}
            <input
              id="date"
              class="input"
              type="number"
              bind:value={prop.value} />
          {:else if prop.type === 'ENUMERATION'}
            <select class="select" bind:value={prop.value.selected}>
              {#each prop.value.items as item}
                <option value={item}>{StringUtil.prettyName(item)}</option>
              {/each}
              <option value="" selected>- Unselected -</option>
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
    </div>
  {/each}
</div>

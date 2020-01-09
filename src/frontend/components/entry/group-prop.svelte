<script>
  import { afterUpdate } from 'svelte';
  import GroupProp from './group-prop.svelte';
  import OnOff from '../on-off.svelte';
  import StringUtil from '../../string-util.js';

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

  afterUpdate(() => {
    if (!events.checkProps) {
      events.checkProps = () => {
        for (const i in parentProp.value.props) {
          const prop = parentProp.value.props[i];
          if (prop.required === true) {
            switch (prop.type) {
              case 'STRING':
                {
                  if (prop.value.replace(/ /g, '') === '') {
                    errors[prop.name] =
                      'Value is required and cannot be emplty.';
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
      initGroupPropEvents();
    }
  });
</script>

<style type="text/scss">
  @import './group-prop.scss';
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
            <OnOff bindValue={prop.value} />
          {:else if prop.type === 'NUMBER'}
            <input
              id="date"
              class="input"
              type="number"
              bind:value={prop.value} />
          {:else if prop.type === 'ENUMERATION'}
            <select class="select" bind:value={prop.value.selected}>
              <option value="">- Unselected -</option>
              {#each prop.value.items as item}
                <option value={item}>{StringUtil.prettyName(item)}</option>
              {/each}
            </select>
          {:else if prop.type === 'GROUP_POINTER'}
            <GroupProp
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

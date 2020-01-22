<script>
  import { onMount } from 'svelte';
  import { simplePopup } from './simple-popup.svelte';
  import { Toggle } from 'carbon-components-svelte';
  import PropString from './prop/string.svelte';
  import PropStringArray from './prop/string-array.svelte';
  import PropBoolean from './prop/boolean.svelte';
  import PropBooleanArray from './prop/boolean-array.svelte';
  import PropNumber from './prop/number.svelte';
  import PropNumberArray from './prop/number-array.svelte';
  import PropEnum from './prop/enum.svelte';
  import PropGroupPointer from './prop/group-pointer.svelte';
  import PropGroupPointerArray from './prop/group-pointer-array.svelte';
  import OnOff from './on-off.svelte';
  import GroupPropInput from './group-prop-input.svelte';
  import StringUtil from '../string-util.js';

  export let groups;
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
      } else if (prop.type === 'GROUP_POINTER_ARRAY') {
        errors[prop.name] = [];
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
      } else if (prop.type === 'GROUP_POINTER_ARRAY') {
        groupPropEvents[prop.name] = [];
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

<style type="text/scss">
  @import './props-input.scss';
</style>

<div class="content">
  {#each props as prop, i}
    <div class="prop">
      {#if prop.type === 'STRING'}
        <PropString {prop} error={''} />
      {:else if prop.type === 'STRING_ARRAY'}
        <PropStringArray
          {prop}
          error={''}
          on:add={event => {
            if (event.eventPhase === 0) {
              prop.value.push('');
              props = [...props];
            }
          }} />
      {:else if prop.type === 'BOOLEAN'}
        <PropBoolean {prop} error={''} />
      {:else if prop.type === 'BOOLEAN_ARRAY'}
        <PropBooleanArray
          {prop}
          error={''}
          on:add={event => {
            if (event.eventPhase === 0) {
              prop.value.push(false);
              props = [...props];
            }
          }} />
      {:else if prop.type === 'NUMBER'}
        <PropNumber {prop} error={''} />
      {:else if prop.type === 'NUMBER_ARRAY'}
        <PropNumberArray
          {prop}
          error={''}
          on:add={event => {
            if (event.eventPhase === 0) {
              prop.value.push(0);
              props = [...props];
            }
          }} />
      {:else if prop.type === 'ENUMERATION'}
        <PropEnum {prop} error={''} />
      {:else if prop.type === 'GROUP_POINTER'}
        <PropGroupPointer {prop} error={''} />
      {:else if prop.type === 'GROUP_POINTER_ARRAY'}
        <PropGroupPointerArray
          {prop}
          error={''}
          on:add={event => {
            if (event.eventPhase === 0) {
              prop.value.array.push({
                value: JSON.parse(JSON.stringify(prop.value.props)),
              });
              props = [...props];
            }
          }} />
      {/if}
      <!-- <div class="key-value {prop.type === 'GROUP_POINTER' ? 'pointer' : ''}">
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
            <Toggle
              on:change={event => {
                prop.value = event.target.checked;
              }} />
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
              {groups}
              parentProp={prop}
              errors={errors[prop.name]}
              events={groupPropEvents[prop.name]} />
          {:else if prop.type.indexOf('_ARRAY') !== -1}
            <div class="array">
              {#if prop.value.length > 0}
                {#each prop.value as vl, i}
                  {#if prop.type === 'STRING_ARRAY'}
                    <textarea
                      class="input"
                      style="font-family: monospace; font-size: 10pt;"
                      bind:value={vl} />
                  {:else if prop.type === 'BOOLEAN_ARRAY'}
                    <Toggle
                      on:change={event => {
                        prop.value[i] = event.target.checked;
                      }} />
                  {:else if prop.type === 'NUMBER_ARRAY'}
                    <input
                      id="date"
                      class="input"
                      type="number"
                      bind:value={vl} />
                  {/if}
                {/each}
              {/if}
              {#if prop.type === 'GROUP_POINTER_ARRAY' && prop.value.array && prop.value.array.length > 0}
                {#each prop.value.array as vl, i}
                  <GroupPropInput
                    {groups}
                    parentProp={vl}
                    errors={errors[prop.name][i]}
                    events={groupPropEvents[prop.name][i]} />
                {/each}
              {/if}
              <button
                class="btn btn-blue-c"
                on:click={() => {
                  addArrayElement(prop);
                }}>
                <div class="fas fa-plus icon" />
                <div class="text">Add Element</div>
              </button>
            </div>
          {/if}
          <div class="break" />
        </div>
      </div> -->
    </div>
  {/each}
</div>

<script>
  import OnOff from './on-off.svelte';
  import WidgetGroupPropInput from './widget-group-prop-input.svelte';
  import StringUtil from '../string-util.js';

  export let widget;
  export let events;

  let errors = {};
  let groupPropEvents = {};

  function initErrorPaths() {
    for (const i in widget.props) {
      const prop = widget.props[i];
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
    for (const i in widget.props) {
      const prop = widget.props[i];
      if (prop.type === 'GROUP_POINTER') {
        groupPropEvents[prop.name] = { init: true };
      }
    }
  }
  function handleDateTimeInput(type, prop, event) {}

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
  initGroupPropEvents();
  initErrorPaths();
</script>

<style>
  .widget {
    font-size: 10pt;
    font-weight: normal;
    margin-top: 30px;
  }

  .widget .head {
    display: flex;
    padding: 5px;
    border-bottom: 1px solid #d8d8d8;
  }

  .widget .head .icon {
    color: var(--c-primary);
    margin: auto 0;
  }

  .widget .head .text {
    font-weight: normal;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: auto auto auto 20px;
  }

  .widget .head .move {
    font-size: 12pt;
    margin: auto 0;
  }

  .widget .body {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 20px;
    border-style: none solid solid solid;
    border-color: #d8d8d8;
    border-width: 1px;
    padding: 20px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
  }

  .widget .label {
    display: flex;
  }

  .widget .label .icon {
    margin: auto 20px auto 0;
    color: var(--c-secondary);
  }

  .widget .label .type {
    font-weight: bold;
    margin: auto 0 auto auto;
    color: #d8d8d8;
  }

  .widget .label .lock {
    margin: auto 0 auto 10px;
    color: #d8d8d8;
  }

  .widget .gp-label {
    padding: 5px;
    border-bottom: 1px solid #d8d8d8;
  }
</style>

<div class="widget">
  <div class="head">
    <span class="fas fa-pepper-hot icon" />
    &nbsp;
    <span class="text">Widget | {StringUtil.prettyName(widget.name)}</span>
    <button
      class="btn btn-blue-c fas fa-angle-up move up"
      on:click={() => {
        events.move('up');
      }} />
    <button
      class="btn btn-blue-c fas fa-angle-down move down"
      on:click={() => {
        events.move('down');
      }} />
    <button
      class="btn btn-red-c fas fa-trash delete"
      on:click={() => {
        events.delete();
      }} />
  </div>
  <div class="body">
    {#each widget.props as prop}
      <div class="key-value">
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
            <input
              class="input"
              placeholder="- {StringUtil.prettyName(prop.name)} -"
              bind:value={prop.value} />
          {:else if prop.type === 'NUMBER'}
            <input
              class="input"
              type="number"
              placeholder="- {StringUtil.prettyName(prop.name)} -"
              bind:value={prop.value} />
          {:else if prop.type === 'BOOLEAN'}
            <OnOff
              init={false}
              events={{ set: value => {
                  prop.value = value;
                } }} />
          {:else if prop.type === 'ENUMERATION'}
            <select class="select" bind:value={prop.value.selected}>
              {#each prop.value.items as item}
                <option value={item}>{StringUtil.prettyName(item)}</option>
              {/each}
              <option value="" selected>- Unselected -</option>
            </select>
          {:else if prop.type === 'DATE'}
            <div class="date-time">
              <input
                class="input"
                type="date"
                placeholder="- Chose Date -"
                on:change={event => {
                  handleDateTimeInput('date', prop, event);
                }} />
              <input
                class="input"
                type="time"
                placeholder="- Chose Time -"
                on:change={event => {
                  handleDateTimeInput('time', prop, event);
                }} />
            </div>
          {:else if prop.type === 'GROUP_POINTER'}
            <WidgetGroupPropInput
              parentProp={prop}
              errors={errors[prop.name]}
              events={groupPropEvents[prop.name]} />
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

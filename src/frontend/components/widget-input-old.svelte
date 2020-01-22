<script>
  import OnOff from './on-off.svelte';
  import WidgetGroupPropInput from './widget-group-prop-input.svelte';
  import StringUtil from '../string-util.js';

  export let widgets;
  export let widget;
  export let events;

  let errors = {};
  let groupPropEvents = {};

  function init() {
    const w = widgets.find(e => e.name === widget.name);
    if (w) {
      for(const i in w.props) {
        const prop = w.props[i];
        if (!widget.props.find(e => e.name === prop.name)) {
          widget.props.push(prop);
        }
      }
    }
    initGroupPropEvents();
    initErrorPaths();
  }
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
  init();
</script>

<style type="text/scss">
  @import './widget-input.scss';
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
            <textarea
              class="textarea"
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

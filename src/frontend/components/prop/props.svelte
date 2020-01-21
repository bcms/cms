<script>
  import { simplePopup } from '../simple-popup.svelte';
  import PropString from './string.svelte';
  import PropStringArray from './string-array.svelte';
  import PropBoolean from './boolean.svelte';
  import PropBooleanArray from './boolean-array.svelte';
  import PropNumber from './number.svelte';
  import PropNumberArray from './number-array.svelte';
  import PropEnum from './enum.svelte';
  import PropGroupPointer from './group-pointer.svelte';
  import PropGroupPointerArray from './group-pointer-array.svelte';
  import StringUtil from '../../string-util.js';

  export let props;
  export let events;

  const errors = {};
  const groupEvents = {};

  function init() {
    for (const i in props) {
      const prop = props[i];
      errors[prop.name] = '';
      if (prop.type === 'GROUP_POINTER') {
        groupEvents[prop.name] = {};
      } else if (prop.type === 'GROUP_POINTER_ARRAY') {
        groupEvents[prop.name] = [];
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
          case 'STRING_ARRAY':
            {
              for (const j in prop.value) {
                const element = prop.value[j];
                if (element.replace(/ /g, '') === '') {
                  errors[
                    prop.name
                  ] = `Value is required and cannot be emplty at position [${j}].`;
                  simplePopup.error(
                    `Error in property '${StringUtil.prettyName(prop.name)}'.`,
                  );
                  return;
                }
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
              const result = groupEvents[prop.name].validateAndGetProps();
              if (!result) {
                errors[prop.name] = 'Error in Group.';
                return;
              }
              errors[prop.name] = '';
            }
            break;
          case 'GROUP_POINTER_ARRAY':
            {
              for (const j in prop.value.array) {
                const result = groupEvents[prop.name][j].validateAndGetProps();
                if (!result) {
                  errors[prop.name] = 'Error in Group Array.';
                  return;
                }
                errors[prop.name] = '';
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

{#each props as prop}
  <div class="prop">
    {#if prop.type === 'STRING'}
      <PropString {prop} error={errors[prop.name]} />
    {:else if prop.type === 'STRING_ARRAY'}
      <PropStringArray
        {prop}
        error={errors[prop.name]}
        on:add={event => {
          if (event.eventPhase === 0) {
            prop.value.push('');
            props = [...props];
          }
        }} />
    {:else if prop.type === 'BOOLEAN'}
      <PropBoolean {prop} error={errors[prop.name]} />
    {:else if prop.type === 'BOOLEAN_ARRAY'}
      <PropBooleanArray
        {prop}
        error={errors[prop.name]}
        on:add={event => {
          if (event.eventPhase === 0) {
            prop.value.push(false);
            props = [...props];
          }
        }} />
    {:else if prop.type === 'NUMBER'}
      <PropNumber {prop} error={errors[prop.name]} />
    {:else if prop.type === 'NUMBER_ARRAY'}
      <PropNumberArray
        {prop}
        error={errors[prop.name]}
        on:add={event => {
          if (event.eventPhase === 0) {
            prop.value.push(0);
            props = [...props];
          }
        }} />
    {:else if prop.type === 'ENUMERATION'}
      <PropEnum {prop} error={errors[prop.name]} />
    {:else if prop.type === 'GROUP_POINTER'}
      <PropGroupPointer
        {prop}
        error={errors[prop.name]}
        events={groupEvents[prop.name]} />
    {:else if prop.type === 'GROUP_POINTER_ARRAY'}
      <PropGroupPointerArray
        {prop}
        error={errors[prop.name]}
        events={groupEvents[prop.name]}
        on:add={event => {
          if (event.eventPhase === 0) {
            prop.value.array.push({
              value: JSON.parse(JSON.stringify(prop.value.props)),
            });
            groupEvents[prop.name][prop.value.array.length - 1] = {};
            props = [...props];
          }
        }} />
    {/if}
  </div>
{/each}

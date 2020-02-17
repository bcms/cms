<script>
  import { simplePopup } from '../simple-popup.svelte';
  import PropString from './string.svelte';
  import PropStringArray from './string-array.svelte';
  import PropMedia from './media.svelte';
  import PropBoolean from './boolean.svelte';
  import PropBooleanArray from './boolean-array.svelte';
  import PropNumber from './number.svelte';
  import PropNumberArray from './number-array.svelte';
  import PropEnum from './enum.svelte';
  import PropDate from './prop-date.svelte';
  import PropGroupPointer from './group-pointer.svelte';
  import PropGroupPointerArray from './group-pointer-array.svelte';
  import PropEntryPointer from './entry-pointer.svelte';
  import PropEntryPointerArray from './entry-pointer-array.svelte';
  import StringUtil from '../../string-util.js';

  export let groups = [];
  export let props;
  export let events;

  let errors = {};
  let groupEvents = {};

  function init() {
    errors = {};
    groupEvents = {};
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

  if (events) {
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
                      `Error in property '${StringUtil.prettyName(
                        prop.name,
                      )}'.`,
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
            case 'ENTRY_POINTER':
              {
                if (prop.value.entryId.replace(/ /g, '') === '') {
                  errors[prop.name] = 'Please selece an option.';
                  simplePopup.error(
                    `Error in property '${StringUtil.prettyName(prop.name)}'.`,
                  );
                  return;
                }
                errors[prop.name] = '';
              }
              break;
            case 'ENTRY_POINTER_ARRAY':
              {
                for (const j in prop.value.entryIds) {
                  const element = prop.value.entryIds[j];
                  if (element.replace(/ /g, '') === '') {
                    errors[
                      prop.name
                    ] = `Value is required and cannot be emplty at position [${j}].`;
                    simplePopup.error(
                      `Error in property '${StringUtil.prettyName(
                        prop.name,
                      )}'.`,
                    );
                    return;
                  }
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
                  const result = groupEvents[prop.name][
                    j
                  ].validateAndGetProps();
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
    events.init = init;
  }
  init();
</script>

{#each props as prop, i}
  <div class="prop mt-20">
    {#if prop.type === 'STRING'}
      {#if prop.name.indexOf('uri') !== -1}
        <PropMedia {prop} error={errors[prop.name]} />
      {:else}
        <PropString {prop} error={errors[prop.name]} />
      {/if}
    {:else if prop.type === 'STRING_ARRAY'}
      <PropStringArray
        {prop}
        error={errors[prop.name]}
        on:add={event => {
          if (event.eventPhase === 0) {
            prop.value.push('');
            props = [...props];
          }
        }}
        on:remove={event => {
          if (event.eventPhase === 0) {
            prop.value = prop.value.filter((e, j) => j !== event.detail.position);
          }
        }}
        on:move={event => {
          if (event.eventPhase === 0) {
            if (event.detail.to > -1 && event.detail.to < prop.value.length) {
              prop.value = prop.value.map((e, j) => {
                if (j === event.detail.from) {
                  return prop.value[event.detail.to];
                } else if (j === event.detail.to) {
                  return prop.value[event.detail.from];
                }
                return e;
              });
            }
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
        }}
        on:remove={event => {
          if (event.eventPhase === 0) {
            prop.value = prop.value.filter((e, j) => j !== event.detail.position);
          }
        }}
        on:move={event => {
          if (event.eventPhase === 0) {
            if (event.detail.to > -1 && event.detail.to < prop.value.length) {
              prop.value = prop.value.map((e, j) => {
                if (j === event.detail.from) {
                  return prop.value[event.detail.to];
                } else if (j === event.detail.to) {
                  return prop.value[event.detail.from];
                }
                return e;
              });
            }
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
        }}
        on:remove={event => {
          if (event.eventPhase === 0) {
            prop.value = prop.value.filter((e, j) => j !== event.detail.position);
          }
        }}
        on:move={event => {
          if (event.eventPhase === 0) {
            if (event.detail.to > -1 && event.detail.to < prop.value.length) {
              prop.value = prop.value.map((e, j) => {
                if (j === event.detail.from) {
                  return prop.value[event.detail.to];
                } else if (j === event.detail.to) {
                  return prop.value[event.detail.from];
                }
                return e;
              });
            }
          }
        }} />
    {:else if prop.type === 'ENUMERATION'}
      <PropEnum {prop} error={errors[prop.name]} />
    {:else if prop.type === 'DATE'}
      <PropDate {prop} error={errors[prop.name]} />
    {:else if prop.type === 'GROUP_POINTER'}
      <PropGroupPointer
        {groups}
        {prop}
        error={errors[prop.name]}
        events={groupEvents[prop.name]} />
    {:else if prop.type === 'GROUP_POINTER_ARRAY'}
      <PropGroupPointerArray
        {groups}
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
        }}
        on:remove={event => {
          if (event.eventPhase === 0) {
            const buffer = JSON.parse(JSON.stringify(prop.value.array.filter((e, j) => j !== event.detail.position)));
            prop.value.array = [];
            setTimeout(() => {
              prop.value.array = buffer;
            }, 50);
          }
        }}
        on:move={event => {
          if (event.eventPhase === 0) {
            if (event.detail.to > -1 && event.detail.to < prop.value.array.length) {
              const buffer = JSON.parse(JSON.stringify(prop.value.array.map(
                    (e, j) => {
                      if (j === event.detail.from) {
                        return prop.value.array[event.detail.to];
                      } else if (j === event.detail.to) {
                        return prop.value.array[event.detail.from];
                      }
                      return e;
                    },
                  )));
              prop.value.array = [];
              setTimeout(() => {
                prop.value.array = buffer;
              }, 50);
            }
          }
        }} />
    {:else if prop.type === 'ENTRY_POINTER'}
      <PropEntryPointer {prop} error={errors[prop.name]} />
    {:else if prop.type === 'ENTRY_POINTER_ARRAY'}
      <PropEntryPointerArray
        {prop}
        error={errors[prop.name]}
        on:add={event => {
          if (event.eventPhase === 0) {
            prop.value.entryIds.push('');
            props = [...props];
          }
        }}
        on:remove={event => {
          if (event.eventPhase === 0) {
            const buffer = JSON.parse(JSON.stringify(prop.value.entryIds.filter(e => e !== event.detail.prop)));
            prop.value.entryIds = [];
            setTimeout(() => {
              prop.value.entryIds = buffer;
            }, 50);
          }
        }}
        on:move={event => {
          if (event.eventPhase === 0) {
            if (event.detail.to > -1 && event.detail.to < prop.value.entryIds.length) {
              const buffer = JSON.parse(JSON.stringify(prop.value.entryIds.map(
                    (id, j) => {
                      if (j === event.detail.from) {
                        return prop.value.entryIds[event.detail.to];
                      } else if (j === event.detail.to) {
                        return prop.value.entryIds[event.detail.from];
                      }
                      return id;
                    },
                  )));
              prop.value.entryIds = [];
              setTimeout(() => {
                prop.value.entryIds = buffer;
              }, 50);
            }
          }
        }} />
    {/if}
  </div>
{/each}

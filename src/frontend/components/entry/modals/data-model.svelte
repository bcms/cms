<script>
  import uuid from 'uuid';
  import crypto from 'crypto-js';
  import { onMount } from 'svelte';
  import { simplePopup } from '../../simple-popup.svelte';
  import Modal from '../../modal.svelte';
  import OnOff from '../../on-off.svelte';
  import GroupProp from '../group-prop.svelte';
  import StringUtil from '../../../string-util.js';
  import UrlQueries from '../../../url-queries.js';

  export let axios;
  export let events;
  export let template;

  const queries = UrlQueries.get();
  const modalHeading = {
    icon: '/assets/ics/template/icon_type_groups.png',
    title: 'Create New Entry',
  };
  const globalId = uuid.v4();
  let languages = [];
  let selectedLanguage;
  let data;
  let datePicker;

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
  function initErrorPaths(props) {
    const errors = {};
    for (const i in props) {
      const prop = props[i];
      if (prop.type === 'GROUP_POINTER') {
        errors[prop.name] = createErrorPathForGroupPointer(prop);
      } else {
        errors[prop.name] = '';
      }
    }
    return errors;
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
  function initGroupPropEvents(props) {
    const groupPropEvents = {};
    for (const i in props) {
      const prop = props[i];
      if (prop.type === 'GROUP_POINTER') {
        groupPropEvents[prop.name] = { init: true };
      }
    }
    return groupPropEvents;
  }
  function initData() {
    data = {};
    for (const i in languages) {
      const lng = languages[i];
      data[lng.code] = {
        props: JSON.parse(
          JSON.stringify(
            template.entryTemplate.map(e => {
              if (e.type === 'STRING') {
                e.value = '';
              }
              return e;
            }),
          ),
        ),
      };
      data[lng.code].errors = initErrorPaths(data[lng.code].props);
      data[lng.code].groupPropEvents = initGroupPropEvents(
        data[lng.code].props,
      );
      data[lng.code].hash = crypto
        .SHA256(JSON.stringify(data[lng.code].props))
        .toString();
    }
  }
  function setData(entry) {
    initData();
    for (const i in entry.content) {
      const content = entry.content[i];
      data[content.lng].props = JSON.parse(JSON.stringify(content.props));
      data[content.lng].hash = crypto
        .SHA256(JSON.stringify(data[content.lng].props))
        .toString();
    }
  }

  events.setData = setData;
  events.cancel = () => {
    events.toggle();
    initData();
  };
  events.done = async () => {
    const output = {
      content: [],
    };
    for (const lng in data) {
      const newDataHash = crypto
        .SHA256(JSON.stringify(data[lng].props))
        .toString();
      if (newDataHash !== data[lng].hash) {
        for (const i in data[lng].props) {
          const prop = data[lng].props[i];
          const errors = data[lng].errors;
          const groupPropEvents = data[lng].groupPropEvents;
          if (prop.required === true) {
            switch (prop.type) {
              case 'STRING':
                {
                  if (prop.value.replace(/ /g, '') === '') {
                    errors[prop.name] =
                      'Value is required and cannot be emplty.';
                    simplePopup.error(
                      `Error in property '${StringUtil.prettyName(
                        prop.name,
                      )}' for Language '${lng}'.`,
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
                      `Error in property '${StringUtil.prettyName(
                        prop.name,
                      )}' for Language '${lng}'.`,
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
                      `Error in property '${StringUtil.prettyName(
                        prop.name,
                      )}' for Language '${lng}'.`,
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
                      `Error in property '${StringUtil.prettyName(
                        prop.name,
                      )}' for Language '${lng}'.`,
                    );
                    return;
                  }
                }
                break;
            }
          }
        }
        output.content.push({
          lng,
          props: data[lng].props,
        });
      }
    }
    if (output.content.length === 0) {
      simplePopup.error('There are no changes.');
      return;
    }
    /*for (const i in props) {
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
    }*/
    events.toggle();
    events.callback(output);
    initData();
  };

  onMount(async () => {
    const result = await axios.send({
      url: `/language/all`,
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    languages = result.response.data.languages;
    selectedLanguage = queries.lng;
    initData();
  });
</script>

<style type="text/scss">
  @import './add-data-model.scss';
</style>

<Modal heading={modalHeading} {events}>
  {#if data}
    <div class="content">
      <div class="key-value">
        <div class="label">Language</div>
        <div class="value">
          <select class="select" bind:value={selectedLanguage}>
            {#each languages as lng}
              <option value={lng.code}>{lng.name} | {lng.nativeName}</option>
            {/each}
          </select>
        </div>
      </div>
      {#each data[selectedLanguage].props as prop, i}
        <div class="prop">
          <div
            class="key-value {prop.type === 'GROUP_POINTER' ? 'pointer' : ''}">
            <div class="label flex-label">
              <div class="name">{StringUtil.prettyName(prop.name)}</div>
              {#if prop.required === true}
                <div class="fa fa-lock lock" />
              {:else}
                <div class="fa fa-unlock lock" />
              {/if}
              {#if prop.type !== 'GROUP_POINTER' && data[selectedLanguage].errors[prop.name] !== ''}
                <div class="error">
                  <span class="fas fa-exclamation icon" />
                  <span class="text">
                    {data[selectedLanguage].errors[prop.name]}
                  </span>
                </div>
              {/if}
              <div class="type">{StringUtil.prettyName(prop.type)}</div>
              <div class="icon">
                <img
                  src="/assets/ics/template/types/{prop.type}.png"
                  alt="NF" />
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
                  <option value="">- Unselected -</option>
                  {#each prop.value.items as item}
                    <option value={item}>{StringUtil.prettyName(item)}</option>
                  {/each}
                </select>
              {:else if prop.type === 'GROUP_POINTER'}
                <GroupProp
                  parentProp={prop}
                  errors={data[selectedLanguage].errors[prop.name]}
                  events={data[selectedLanguage].groupPropEvents[prop.name]} />
              {/if}
              <div class="break" />
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</Modal>

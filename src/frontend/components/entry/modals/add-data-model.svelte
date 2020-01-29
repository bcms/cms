<script>
  import uuid from 'uuid';
  import crypto from 'crypto-js';
  import { onMount } from 'svelte';
  import { simplePopup } from '../../simple-popup.svelte';
  import Modal from '../../modal.svelte';
  import Props from '../../prop/props.svelte';
  import StringUtil from '../../../string-util.js';
  import UrlQueries from '../../../url-queries.js';

  export let events;
  export let template = null;
  export let languages;

  const queries = UrlQueries.get();
  const modalHeading = {
    icon: '/assets/ics/template/icon_type_groups.png',
    title: 'Create New Entry',
  };
  const propsEvents = {};
  let selectedLanguage;
  let data;

  function initData() {
    data = {};
    for (const i in languages) {
      const lng = languages[i];
      data[lng.code] = {};
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
      data[lng.code].hash = crypto
        .SHA256(JSON.stringify(data[lng.code].props))
        .toString();
    }
  }

  function selectLanguage(event) {
    const newDataHash = crypto
      .SHA256(JSON.stringify(data[selectedLanguage].props))
      .toString();
    if (newDataHash !== data[selectedLanguage].hash) {
      const props = propsEvents.validateAndGetProps();
      if (!props) {
        simplePopup.error('Error in inputs.');
        return;
      }
    }
    selectedLanguage = event.target.value;
  }

  events.setEntry = entry => {
    for (const i in languages) {
      const lng = languages[i];
      console.log('entry', entry);
      if (entry !== null) {
        const content = entry.content.find(e => e.lng === lng.code);
        console.log('content', content);
        if (content) {
          data[lng.code].props = JSON.parse(JSON.stringify(content.props));
        }
      }
      console.log('data', data);
    }
  };
  events.cancel = () => {
    events.toggle();
    initData();
  };
  events.done = () => {
    const props = propsEvents.validateAndGetProps();
    if (!props) {
      simplePopup.error('Error in inputs.');
      return;
    }
    const output = {
      content: [],
    };
    for (const lng in data) {
      const newDataHash = crypto
        .SHA256(JSON.stringify(data[lng].props))
        .toString();
      if (newDataHash !== data[lng].hash) {
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
    events.toggle();
    events.callback(output);
    initData();
  };

  onMount(() => {
    selectedLanguage = queries.lng;
    initData();
  });
</script>

<Modal heading={modalHeading} {events}>
  {#if data}
    <div class="key-value">
      <div class="label">Language</div>
      <div class="value">
        <select class="select" on:change={selectLanguage}>
          {#each languages as lng}
            <option value={lng.code}>{lng.name} | {lng.nativeName}</option>
          {/each}
        </select>
      </div>
    </div>
    <Props props={data[selectedLanguage].props} events={propsEvents} />
  {/if}
</Modal>

<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../simple-popup.svelte';
  import { Select, SelectItem } from 'carbon-components-svelte';
  import Modal from '../../modal.svelte';

  export let events;
  export let axios;

  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: 'Add Language',
  };
  let languages = [];
  let language = {
    code: {
      value: '',
      error: '',
    },
  };

  events.cancel = () => {
    language = {
      code: {
        value: '',
        error: '',
      },
    };
    events.toggle();
  };
  events.done = () => {
    if (language.code.value === '') {
      language.code.error = 'Please select a language.';
      return;
    }
    language.code.error = '';
    events.callback({
      code: language.code.value,
    });
    events.cancel();
  };

  onMount(async () => {
    const result = await axios.send({
      url: '/language/all/available',
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    languages = result.response.data.isoLanguages
      .filter(e => e.code !== 'en')
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        } else if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
  });
</script>

<Modal heading={modalHeading} {events}>
  <Select
    labelText="Select a language"
    invalid={language.code.error !== '' ? true : false}
    invalidText={language.code.error}
    selected={language.code.value}
    on:change={event => {
      if (event.eventPhase === 0) {
        language.code.value = event.detail;
      }
    }}>
    <SelectItem value="" text="- Unselected -" />
    {#each languages as lng}
      <SelectItem value={lng.code} text="{lng.name} | {lng.nativeName}" />
    {/each}
  </Select>
  <!-- <div class="content">
    <div class="title">Options</div>
    <div class="options">
      <div class="key-value">
        <div class="label">
          <div class="text">Select a language</div>
          {#if language.code.error !== ''}
            <div class="btn btn-red-c">
              <div class="fas fa-exclamation icon" />
              <div class="text">{language.code.error}</div>
            </div>
          {/if}
        </div>
        <div class="value">
          <select
            class="select"
            on:change={event => {
              language.code.value = event.target.value;
            }}>
            {#each languages as lng}
              <option value={lng.code}>{lng.name} | {lng.nativeName}</option>
            {/each}
            <option value="" selected>- Unselected -</option>
          </select>
        </div>
      </div>
    </div>
  </div> -->
</Modal>

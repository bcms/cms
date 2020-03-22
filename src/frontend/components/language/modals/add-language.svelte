<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../simple-popup.svelte';
  import Select from '../../global/select/select.svelte';
  import SelectItem from '../../global/select/select-item.svelte';
  import Modal from '../../global/modal/modal.svelte';

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
</Modal>

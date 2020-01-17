<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/layout/layout.svelte';
  import AddLanguageModal from '../../../components/language/modals/add-language.svelte';

  export let axios;
  export let Store;

  let languages = [];
  let addLanguageModalEvents = { callback: addLanguage };

  async function addLanguage(language) {
    const result = await axios.send({
      url: `/language/${language.code}`,
      method: 'POST',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    languages = [...languages, result.response.data.language];
  }
  async function removeLanguage(id) {
    if (
      confirm(
        'Are you sure you want to remove this language?\n\n' +
          'THIS WILL REMOVE THIS LANGUAGE FROM ALL ENTRIES THAT ARE USING IT!',
      )
    ) {
      const result = await axios.send({
        url: `/language/${id}`,
        method: 'DELETE',
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      languages = languages.filter(e => e._id !== id);
    }
  }

  onMount(async () => {
    let result = await axios.send({
      url: '/language/all',
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    languages = result.response.data.languages;
    if (languages.length === 0) {
      result = await axios.send({
        url: '/language/en',
        method: 'POST',
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      languages = [...languages, result.response.data.language];
    }
  });
</script>

<style type="text/scss">
  @import './editor.scss';
</style>

<Layout {Store} {axios}>
  <div class="wrapper">
    <div class="title">Language Manager</div>
    <div class="desc">Add lanuages that will be available for Entries.</div>
    <div class="actions">
      <button
        class="btn-fill btn-blue-bg add"
        on:click={addLanguageModalEvents.toggle}>
        <div class="fas fa-plus icon" />
        <div class="text">Add Language</div>
      </button>
    </div>
    <div class="lngs">
      {#each languages as language}
        <div class="lng">
          <div class="name">{language.name}</div>
          <div class="native-name">{language.nativeName}</div>
          {#if language.code !== 'en'}
            <div class="actions">
              <button
                class="btn-border btn-red-br btn-red-c delete"
                on:click={() => {
                  removeLanguage(language._id);
                }}>
                <div class="fas fa-trash icon" />
                <div class="text">Remove</div>
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</Layout>
<AddLanguageModal events={addLanguageModalEvents} {axios} />

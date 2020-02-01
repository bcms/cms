<script>
  import { onMount } from 'svelte';
  import { axios, fatch, languageStore } from '../../../config.svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/global/layout.svelte';
  import Button from '../../../components/global/button.svelte';
  import AddLanguageModal from '../../../components/language/modals/add-language.svelte';

  let languages = [];
  let addLanguageModalEvents = { callback: addLanguage };

  languageStore.subscribe(value => {
    languages = value;
  });

  async function addLanguage(language) {
    const result = await axios.send({
      url: `/language/${language.code}`,
      method: 'POST',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    languageStore.update(value => [
      ...languages,
      result.response.data.language,
    ]);
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
      languageStore.update(value => languages.filter(e => e._id !== id));
    }
  }

  onMount(async () => {
    fatch();
  });
</script>

<style type="text/scss">
  .wrapper {
    padding: 20px;
  }

  .title {
    font-size: 16pt;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .desc {
    color: var(--c-gray-cold);
    font-size: 10pt;
  }

  .actions {
    display: flex;
    margin-top: 20px;
  }

  .actions .add {
    margin-left: auto;
  }

  .lngs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 370px));
    grid-gap: 20px;
    margin-top: 50px;
  }

  .lng {
    background-color: var(--c-white);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    padding: 10px;
    margin-bottom: auto;
  }

  .lng .name {
    font-size: 12pt;
    font-weight: bold;
  }

  .lng .native-name {
    font-size: 10pt;
    color: var(--c-gray-cold);
  }

  .lng .actions {
    margin-top: 20px;
  }
</style>

<Layout>
  <div class="wrapper">
    <div class="title">Language Manager</div>
    <div class="desc">Add lanuages that will be available for Entries.</div>
    <div class="actions">
      <div class="add">
        <Button
          icon="fas fa-plus"
          on:click={() => {
            addLanguageModalEvents.toggle();
          }}>
          Add Language
        </Button>
      </div>
    </div>
    <div class="lngs">
      {#each languages as language}
        <div class="lng">
          <div class="name">{language.name}</div>
          <div class="native-name">{language.nativeName}</div>
          {#if language.code !== 'en'}
            <div class="actions">
              <Button
                class="w-100p"
                kind="danger"
                size="small"
                on:click={() => {
                  removeLanguage(language._id);
                }}>
                Remove
              </Button>
              <!-- <button
                class="btn-border btn-red-br btn-red-c delete"
                on:click={() => {
                  removeLanguage(language._id);
                }}>
                <div class="fas fa-trash icon" />
                <div class="text">Remove</div>
              </button> -->
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</Layout>
<AddLanguageModal events={addLanguageModalEvents} {axios} />

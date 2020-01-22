<script>
  import { onMount, afterUpdate } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import UrlQueries from '../../../url-queries.js';
  import Base64 from '../../../base64.js';
  import StringUtil from '../../../string-util.js';
  import Layout from '../../../components/layout/layout.svelte';
  import DataModelModal from '../../../components/entry/modals/add-data-model.svelte';

  export let axios;
  export let Store;

  const queries = UrlQueries.get();
  const allowedEntriesPerPage = [10, 20, 30];
  const addDataModalModalEvents = { callback: addNewDataModelEntry };
  const editDataModelModalEvents = { callback: updateDataModalEntry };
  let languages = [];
  let languageSelected = {
    code: 'en',
  };
  let entriesPerPage = 10;
  let entries = [];
  let editEntry;
  let template;
  let page = 1;
  let filters = [];

  if (Store.get('entriesPerPage')) {
    entriesPerPage = Store.get(entriesPerPage);
  }

  async function deleteEntry(entry) {
    if (
      confirm(
        `Are you sure you want to delete '${entry._id}'? ` +
          `This action is irreversable!`,
      )
    ) {
      const result = await axios.send({
        url: `/template/${template._id}/entry/${entry._id}`,
        method: 'DELETE',
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      simplePopup.success(`Entry '${entry._id}' deleted successfully!`);
      entries = entries.filter(e => e._id !== entry._id);
    }
  }
  function setEntriesPerPage(event) {
    entriesPerPage = parseInt(event.target.value, 10);
    entries = [...entries];
  }
  function addEntry() {
    if (template.type === 'DATA_MODEL') {
      addDataModalModalEvents.toggle();
    } else {
      window.location =
        `/dashboard/template/entry/rc` +
        `?tid=${template._id}&lng=${languageSelected.code}`;
    }
  }
  async function addNewDataModelEntry(data) {
    const result = await axios.send({
      url: `/template/${template._id}/entry`,
      method: 'POST',
      data,
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    simplePopup.success('Entry added successfully!');
    entries = [...entries, result.response.data.entry];
    template.entryIds = [...template.entryIds, result.response.data.entry._id];
    Store.remove('entryPropsBuffer');
  }
  async function updateDataModalEntry(data) {
    const result = await axios.send({
      url: `/template/${template._id}/entry`,
      method: 'PUT',
      data: {
        _id: editEntry._id,
        content: data.content,
      },
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    simplePopup.success('Entry added successfully!');
    entries = entries.map(e => {
      if (e._id === result.response.data.entry._id) {
        return result.response.data.entry;
      }
      return e;
    });
    editEntry = undefined;
  }
  function contentToSchema(content) {
    let schema = {};
    for (const i in content) {
      const c = content[i];
      schema[c.lng] = propsToSchema(c.props);
    }
    return JSON.stringify(schema, null, '  ');
  }
  function propsToSchema(props) {
    let schema = {};
    for (const i in props) {
      const prop = props[i];
      if (prop.type === 'GROUP_POINTER') {
        schema[prop.name] = propsToSchema(prop.value.props);
      } else if (prop.type === 'DATE') {
        schema[prop.name] = new Date(prop.value).toISOString();
      } else {
        schema[prop.name] = prop.value;
      }
    }
    return schema;
  }
  function compileSchema(schema) {
    return schema
      .split('":')
      .map(e => {
        let lastIndex = 0;
        let index = 0;
        while (true) {
          index = e.indexOf('"', index + 1);
          if (index === -1) {
            break;
          }
          lastIndex = 0 + index;
        }
        return e.slice(0, lastIndex) + e.slice(lastIndex + 1);
      })
      .join('":')
      .replace(/":/g, ':');
  }
  function sortEntries() {}
  function filterEntry(entry, i) {
    const max = page * entriesPerPage;
    const min = max - entriesPerPage;
    if (i >= min && i < max) {
      const content = entry.content.find(e => e.lng === languageSelected.code);
      if (content) {
        for (const i in filters) {
          const filter = filters[i];
          switch (filter.type) {
            case 'ENUMERATION':
              {
                const prop = content.props.find(e => e.name === filter.name);
                if (prop && prop.value.selected !== filter.selected) {
                  return false;
                }
              }
              break;
          }
        }
      }
      return true;
    }
    return false;
  }
  function setFilter(prop, options) {
    const filter = filters.find(e => e.name === prop.name);
    if (filter) {
      switch (prop.type) {
        case 'ENUMERATION':
          {
            if (options.selected === '') {
              filters = filters.filter(e => e.name !== filter.name);
            } else {
              filter.selected = options.selected;
            }
          }
          break;
      }
    } else {
      switch (prop.type) {
        case 'ENUMERATION':
          {
            if (options.selected !== '') {
              filters.push({
                name: prop.name,
                type: prop.type,
                selected: options.selected,
              });
            }
          }
          break;
      }
    }
    entries = [...entries];
  }

  onMount(async () => {
    if (!queries.cid) {
      simplePopup.error(`Query is missing 'cid'.`);
      return;
    }
    let result = await axios.send({
      url: `/template/${queries.cid}`,
      method: 'GET',
    });
    if (result.success === false) {
      console.error(result.error);
      simplePopup.error(result.error.response.data.message);
      return;
    }
    template = result.response.data.template;
    result = await axios.send({
      url: `/template/${template._id}/entry/all`,
      method: 'GET',
    });
    if (result.success === false) {
      console.error(result.error);
      simplePopup.error(result.error.response.data.message);
      return;
    }
    entries = result.response.data.entries;
    // Get Languages
    result = await axios.send({
      url: `/language/all`,
      method: 'GET',
    });
    if (result.success === false) {
      console.error(result.error);
      simplePopup.error(result.error.response.data.message);
      return;
    }
    languages = result.response.data.languages;
    languageSelected = languages.find(e => e.code === queries.lng);
    // addDataModalModalEvents.init();
  });
</script>

<style type="text/scss">
  @import './view.scss';
</style>

<Layout {axios} {Store}>
  <div class="content">
    {#if template}
      <div class="heading">
        <div class="text">
          <div class="title">{StringUtil.prettyName(template.name)}</div>
          <div class="entry-count">
            {template.entryIds.length} Entries found
          </div>
        </div>
        <div class="action">
          <button class="btn-fill btn-blue-bg" on:click={addEntry}>
            <div class="fa fa-plus icon" />
            <div class="text">Add New Entry</div>
          </button>
        </div>
      </div>
      <div class="filters">
        <div class="key-value">
          <div class="label">Languages</div>
          <div class="value">
            <select
              class="select"
              on:change={event => {
                languageSelected = languages.find(e => e.code === event.target.value);
              }}>
              {#each languages as lng}
                {#if lng.code === languageSelected.code}
                  <option value={lng.code} selected>
                    {lng.name} | {lng.nativeName}
                  </option>
                {:else}
                  <option value={lng.code}>
                    {lng.name} | {lng.nativeName}
                  </option>
                {/if}
              {/each}
            </select>
          </div>
        </div>
        <h3>Filters</h3>
        <!-- <div class="prop-filters">
          {#each template.entryTemplate as prop}
            {#if prop.type === 'ENUMERATION' || prop.type === 'STRING'}
              <div class="key-value prop">
                <div class="label">{StringUtil.prettyName(prop.name)}</div>
                <div class="value">
                  {#if prop.type === 'ENUMERATION'}
                    <select
                      class="select"
                      on:change={event => {
                        setFilter(prop, { selected: event.target.value });
                      }}>
                      <option value="" selected>- Unselected -</option>
                      {#each prop.value.items as item}
                        <option value={item}>
                          {StringUtil.prettyName(item)}
                        </option>
                      {/each}
                    </select>
                  {:else}
                    <div class="string">
                      <textarea id="filter-{prop.name}" class="input" />
                      <div class="actions">

                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
          {/each}
        </div> -->
      </div>
      {#if entries.length > 0}
        <div class="entries">
          {#each entries as entry, i}
            {#if filterEntry(entry, i) === true}
              {#if template.type === 'RICH_CONTENT'}
                <div class="entry">
                  <div class="heading">{entry._id}</div>
                  <div class="info">
                    {#if entry.content.find(e => e.lng === languageSelected.code)}
                      {#each entry.content.find(e => e.lng === languageSelected.code).props as prop}
                        {#if prop.type === 'QUILL'}
                          {#if prop.value.heading.title !== ''}
                            <div class="title">{prop.value.heading.title}</div>
                            <div class="slug">
                              /template/{template._id}/entry/{entry._id}
                            </div>
                            <div class="desc">
                              {prop.value.heading.desc.substring(0, 80)}...
                            </div>
                          {:else}
                            <div class="not-available">
                              This Entry is not available in '{languageSelected.code}'
                              language.
                            </div>
                          {/if}
                        {/if}
                      {/each}
                    {:else}
                      <div class="not-available">
                        This Entry is not available in '{languageSelected.code}'
                        language.
                      </div>
                    {/if}
                    <div class="key-value date-time">
                      <div class="label">
                        <span class="fas fa-clock icon" />
                        <span>Created At</span>
                      </div>
                      <div class="text">
                        <span class="date">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                        <span class="time">
                          {new Date(entry.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div class="key-value date-time">
                      <div class="label">
                        <span class="fas fa-clock icon" />
                        <span>Update At</span>
                      </div>
                      <div class="text">
                        <span class="date">
                          {new Date(entry.updatedAt).toLocaleDateString()}
                        </span>
                        <span class="time">
                          {new Date(entry.updatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div class="actions">
                      <button
                        class="btn-border btn-red-br btn-red-c delete"
                        on:click={() => {
                          deleteEntry(entry);
                        }}>
                        <div class="fa fa-edit icon" />
                        <div class="text">Delete Entry</div>
                      </button>
                      <a
                        class="btn-fill btn-blue-bg edit"
                        href="/dashboard/template/entry/rc?tid={template._id}&eid={entry._id}&lng={languageSelected.code}">
                        <div class="fa fa-edit icon" />
                        <div class="text">Edit Entry</div>
                      </a>
                    </div>
                  </div>
                </div>
              {:else}
                <div class="entry">
                  <div class="heading">{entry._id}</div>
                  <div class="info">
                    <div class="slug">
                      /template/{template._id}/entry/{entry._id}
                    </div>
                    {#if !entry.content.find(e => e.lng === languageSelected.code)}
                      <div class="not-available">
                        This Entry is not available in '{languageSelected.code}'
                        language.
                      </div>
                    {/if}
                    <div class="key-value date-time">
                      <div class="label">
                        <span class="fas fa-clock icon" />
                        <span>Created At</span>
                      </div>
                      <div class="text">
                        <span class="date">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                        <span class="time">
                          {new Date(entry.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div class="key-value date-time">
                      <div class="label">
                        <span class="fas fa-clock icon" />
                        <span>Updated At</span>
                      </div>
                      <div class="text">
                        <span class="date">
                          {new Date(entry.updatedAt).toLocaleDateString()}
                        </span>
                        <span class="time">
                          {new Date(entry.updatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div class="schema">
                      <pre>
                        <code>
                          {compileSchema(contentToSchema(entry.content))}
                        </code>
                      </pre>
                    </div>
                    <div class="actions">
                      <button
                        class="btn-border btn-red-br btn-red-c delete"
                        on:click={() => {
                          deleteEntry(entry);
                        }}>
                        <div class="fas fa-trash icon" />
                        <div class="text">Delete Entry</div>
                      </button>
                      <button
                        on:click={() => {
                          editEntry = entry;
                          editDataModelModalEvents.setData(entry);
                          editDataModelModalEvents.toggle();
                        }}
                        class="btn-fill btn-blue-bg edit">
                        <div class="fas fa-edit icon" />
                        <div class="text">Edit Entry</div>
                      </button>
                    </div>
                  </div>
                </div>
              {/if}
            {/if}
          {/each}
        </div>
      {:else}
        <div class="no-entries">There are no Entries in this Template</div>
      {/if}
      <div class="page-scroll">
        <div class="wrapper">
          {#if entries.length > 0}
            <div class="entry-count">
              <select class="select" on:change={setEntriesPerPage}>
                {#each allowedEntriesPerPage as i}
                  {#if entriesPerPage === i}
                    <option value={i} selected>{i}</option>
                  {:else}
                    <option value={i}>{i}</option>
                  {/if}
                {/each}
              </select>
              <span>Entries per page</span>
            </div>
            <div class="nav">
              {#if page === 1}
                <div class="fa fa-angle-left btn dis" />
              {:else}
                <button
                  class="fa fa-angle-left btn"
                  on:click={() => {
                    page = page - 1;
                    entries = [...entries];
                  }} />
              {/if}
              <div class="current">{page}</div>
              {#if page * entriesPerPage >= entries.length}
                <div class="fa fa-angle-right btn dis" />
              {:else}
                <button
                  class="fa fa-angle-right btn"
                  on:click={() => {
                    page = page + 1;
                    entries = [...entries];
                  }} />
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div class="no-template">Template was not provided.</div>
    {/if}
  </div>
</Layout>
{#if template && languages.length > 0}
  <DataModelModal events={editDataModelModalEvents} {template} {languages} />
  <DataModelModal events={addDataModalModalEvents} {template} {languages} />
{/if}

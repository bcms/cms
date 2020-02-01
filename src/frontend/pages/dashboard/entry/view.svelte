<script>
  import { onMount, afterUpdate } from 'svelte';
  import {
    axios,
    Store,
    fatch,
    languageStore,
    templateStore,
    pathStore,
  } from '../../../config.svelte';
  import {
    Select,
    SelectItem,
    OverflowMenu,
    OverflowMenuItem,
  } from 'carbon-components-svelte';
  import uuid from 'uuid';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/global/layout.svelte';
  import Button from '../../../components/global/button.svelte';
  import DataModelModal from '../../../components/entry/modals/add-data-model.svelte';
  import UrlQueries from '../../../url-queries.js';
  import Base64 from '../../../base64.js';
  import StringUtil from '../../../string-util.js';

  let queries = UrlQueries.get();
  const allowedEntriesPerPage = [10, 20, 30];
  const addDataModalModalEvents = { callback: addNewDataModelEntry };
  const editDataModelModalEvents = { callback: updateDataModalEntry };
  let languages = [];
  let languageSelected = {
    code: 'en',
  };
  let entriesPerPage = 10;
  let entries;
  let editEntry;
  let template;
  let page = 1;
  let filters = [];
  let templates = [];

  languageStore.subscribe(value => {
    languages = value;
    languageSelected = languages.find(e => e.code === queries.lng);
    if (!languageSelected) {
      languageSelected = {
        code: 'en',
      };
    }
  });
  templateStore.subscribe(value => {
    templates = value;
    template = templates.find(e => e._id === queries.cid);
  });
  pathStore.subscribe(value => {
    setTimeout(() => {
      queries = UrlQueries.get();
      getData();
    }, 100);
  });

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
  async function getData() {
    if (!queries.cid) {
      return;
    }
    template = templates.find(e => e._id === queries.cid);
    if (template) {
      let result = await axios.send({
        url: `/template/${template._id}/entry/all`,
        method: 'GET',
      });
      if (result.success === false) {
        console.error(result.error);
        simplePopup.error(result.error.response.data.message);
        return;
      }
      entries = result.response.data.entries;
    } else {
      setTimeout(getData, 100);
    }
  }

  onMount(async () => {
    fatch();
    getData();
  });
</script>

<style type="text/scss">
  @import './view.scss';
</style>

<Layout>
  <div key={uuid.v4()} class="wrapper">
    {#if template && entries}
      <div class="heading">
        <div class="text">
          <h2>{StringUtil.prettyName(template.name)}</h2>
          <div class="entry-count">
            {template.entryIds.length} Entries found
          </div>
        </div>
        <div class="action">
          <Button icon="fas fa-plus" on:click={addEntry}>Add new Entry</Button>
        </div>
      </div>
      <div class="options mt-20">
        <Select
          labelText="View language"
          helperText="Entry result will be shown in selected language."
          selected={languageSelected.code}
          on:change={event => {
            if (event.eventPhase === 0) {
              languageSelected = languages.find(e => (e.code = event.detail));
            }
          }}>
          {#each languages as lng}
            <SelectItem value={lng.code} text="{lng.name} | {lng.nativeName}" />
          {/each}
        </Select>
      </div>
      <h4 class="mt-20">Filters</h4>
      <div class="filters mt-20">
        {#each template.entryTemplate as prop}
          {#if prop.type === 'ENUMERATION'}
            <Select
              labelText={StringUtil.prettyName(prop.name)}
              helperText="Show Entries with selected enumeration."
              selected={languageSelected.code}
              on:change={event => {
                if (event.eventPhase === 0) {
                  setFilter(prop, { selected: event.detail });
                }
              }}>
              <SelectItem value="" text="- Unselected -" />
              {#each prop.value.items as item}
                <SelectItem value={item} text={StringUtil.prettyName(item)} />
              {/each}
            </Select>
          {/if}
        {/each}
      </div>
      {#if entries.length > 0}
        <div class="entries">
          {#each entries as entry, i}
            {#if filterEntry(entry, i) === true}
              {#if template.type === 'RICH_CONTENT'}
                <div class="entry">
                  <div class="heading">
                    <div class="id">{entry._id}</div>
                    <div class="overflow-menu">
                      <OverflowMenu>
                        <OverflowMenuItem
                          text="Edit"
                          href="/dashboard/template/entry/rc?tid={template._id}&eid={entry._id}&lng={languageSelected.code}" />
                        <OverflowMenuItem
                          danger={true}
                          text="Delete"
                          on:click={() => {
                            deleteEntry(entry);
                          }} />
                      </OverflowMenu>
                    </div>
                  </div>
                  <div class="info">
                    {#if entry.content.find(e => e.lng === languageSelected.code)}
                      {#each entry.content.find(e => e.lng === languageSelected.code).props as prop}
                        {#if prop.type === 'QUILL'}
                          {#if prop.value.heading.title !== ''}
                            <div class="title">{prop.value.heading.title}</div>
                            <div class="desc">{prop.value.heading.desc}</div>
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
                    <div class="bx--label mt-20">Created At</div>
                    <div class="date-time">
                      <span class="date">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                      <span class="time">
                        {new Date(entry.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div class="bx--label mt-20">Updated At</div>
                    <div class="date-time">
                      <span class="date">
                        {new Date(entry.updatedAt).toLocaleDateString()}
                      </span>
                      <span class="time">
                        {new Date(entry.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              {:else}
                <div class="entry">
                  <div class="heading">
                    <div class="id">{entry._id}</div>
                    <div class="overflow-menu">
                      <OverflowMenu>
                        <OverflowMenuItem
                          text="Edit"
                          on:click={() => {
                            editEntry = entry;
                            editDataModelModalEvents.setEntry(entry);
                            editDataModelModalEvents.toggle();
                          }} />
                        <OverflowMenuItem
                          danger={true}
                          text="Delete"
                          on:click={() => {
                            deleteEntry(entry);
                          }} />
                      </OverflowMenu>
                    </div>
                  </div>
                  <div class="info">
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

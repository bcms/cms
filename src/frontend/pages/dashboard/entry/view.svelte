<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import UrlQueries from '../../../url-queries.js';
  import Base64 from '../../../base64.js';
  import StringUtil from '../../../string-util.js';
  import Layout from '../../../components/layout/layout.svelte';
  import DataModelModal from '../../../components/entry/modals/data-model.svelte';

  export let axios;
  export let Store;

  const queries = UrlQueries.get();
  const allowedEntriesPerPage = [10, 20, 30];
  const addDataModalModalEvents = { callback: addNewDataModelEntry };
  const editDataModelModalEvents = { callback: updateDataModalEntry };
  let entriesPerPage = 10;
  let entries = [];
  let editEntry;
  let template;
  let page = 1;

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
  function setEntriesPerPage(event) {}
  function addEntry() {
    if (template.type === 'DATA_MODEL') {
      addDataModalModalEvents.toggle();
    } else {
      window.location =
        `/dashboard/template/entry/rc` +
        `?tid=${template._id}&lng=${queries.lng}`;
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
      <div class="filters" />
      {#if entries.length > 0}
        <div class="entries">
          {#each entries as entry}
            {#if template.type === 'RICH_CONTENT'}
              <div class="entry">
                <div class="heading">{entry._id}</div>
                <div class="info">
                  {#if entry.content.find(e => e.lng === queries.lng)}
                    {#each entry.content.find(e => e.lng === queries.lng).props as prop}
                      {#if prop.type === 'QUILL'}
                        {#if prop.value.heading.title !== ''}
                          <div class="title">{prop.value.heading.title}</div>
                          <div class="slug">
                            /template/{template.name}/entry/{entry._id}
                          </div>
                          <div class="desc">
                            {prop.value.heading.desc.substring(0, 80)}...
                          </div>
                        {:else}
                          <div class="not-available">
                            This Entry is not available in '{queries.lng}'
                            language.
                          </div>
                        {/if}
                      {/if}
                    {/each}
                  {:else}
                    <div class="not-available">
                      This Entry is not available in '{queries.lng}' language.
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
                      href="/dashboard/template/entry/rc?tid={template._id}&eid={entry._id}&lng={queries.lng}">
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
                <button class="fa fa-angle-left btn" />
              {/if}
              <div class="current">{page}</div>
              {#if page + entriesPerPage >= entries.length}
                <div class="fa fa-angle-right btn dis" />
              {:else}
                <button class="fa fa-angle-right btn" />
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
{#if template}
  <DataModelModal
    events={editDataModelModalEvents}
    {template}
    {axios} />
  <DataModelModal events={addDataModalModalEvents} {template} {axios} />
{/if}

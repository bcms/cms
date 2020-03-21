<script>
  import { onMount, afterUpdate } from 'svelte';
  import { Link, navigate } from 'svelte-routing';
  import {
    axios,
    Store,
    fatch,
    languageStore,
    templateStore,
    pathStore,
    entryStore,
  } from '../../../config.svelte';
  import Select from '../../../components/global/select/select.svelte';
  import SelectItem from '../../../components/global/select/select-item.svelte';
  import TextInput from '../../../components/global/text-input.svelte';
  import NumberInput from '../../../components/global/number-input.svelte';
  import uuid from 'uuid';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/global/layout.svelte';
  import Button from '../../../components/global/button.svelte';
  import DataModelModal from '../../../components/entry/modals/add-data-model.svelte';
  import ViewDataModelModal from '../../../components/entry/modals/view-data-model.svelte';
  import OverflowMenu from '../../../components/global/overflow-menu.svelte';
  import OverflowMenuItem from '../../../components/global/overflow-menu-item.svelte';
  import UrlQueries from '../../../url-queries.js';
  import Base64 from '../../../base64.js';
  import StringUtil from '../../../string-util.js';

  const accessToken = JSON.parse(
    Base64.decode(Store.get('accessToken').split('.')[1]),
  );
  const allowedEntriesPerPage = [10, 20, 30];
  const addDataModalModalEvents = { callback: addNewDataModelEntry };
  const editDataModelModalEvents = { callback: updateDataModalEntry };
  const viewDataModelModalEvents = {};
  let queries = UrlQueries.get();
  let languages = [];
  let languageSelected = {
    code: 'en',
  };
  let entriesPerPage = 10;
  let allEntries;
  let entries;
  let editEntry;
  let template;
  let templatePolicy;
  let page = 1;
  let filters = [];
  let sort = {
    createdAt: '',
  };
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
    if (queries.cid) {
      template = templates.find(e => e._id === queries.cid);
      if (allEntries) {
        entries = allEntries.filter(e => e.templateId === template._id);
        getData();
      }
    }
  });
  entryStore.subscribe(value => {
    allEntries = value;
    if (template) {
      entries = allEntries.filter(e => e.templateId === template._id);
      getData();
    }
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
      navigate(
        `/dashboard/template/entry/rc` +
          `?tid=${template._id}&lng=${languageSelected.code}`,
      );
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
  function sortEntries() {
    if (sort.createdAt !== '') {
      switch (sort.createdAt) {
        case 'newest':
          {
            entries.sort((a, b) => {
              if (a.createdAt > b.createdAt) {
                return -1;
              } else if (a.createdAt < b.createdAt) {
                return 1;
              }
              return 0;
            });
          }
          break;
        case 'oldest':
          {
            entries.sort((a, b) => {
              if (a.createdAt > b.createdAt) {
                return 1;
              } else if (a.createdAt < b.createdAt) {
                return -1;
              }
              return 0;
            });
          }
          break;
      }
    }
  }
  function filterEntry(entry, i) {
    const content = entry.content.find(e => e.lng === languageSelected.code);
    if (content) {
      for (const i in filters) {
        const filter = filters[i];
        let prop;
        if (filter.name === 'root_title') {
          try {
            prop = {
              value: content.props.find(p => p.type === 'QUILL').value.heading
                .title,
            };
          } catch (error) {
            console.error(error);
          }
        } else {
          prop = content.props.find(e => e.name === filter.name);
        }
        if (!prop) {
          return false;
        }
        switch (filter.type) {
          case 'ENUMERATION':
            {
              if (prop && prop.value.selected !== filter.selected) {
                return false;
              }
            }
            break;
          case 'BOOLEAN':
            {
              if (prop && prop.value !== filter.value) {
                return false;
              }
            }
            break;
          case 'STRING':
            {
              if (prop) {
                if (filter.value.type === 'contains') {
                  if (
                    prop.value
                      .toLowerCase()
                      .indexOf(filter.value.value.toLowerCase()) === -1
                  ) {
                    return false;
                  }
                } else if (filter.value.type === 'regex') {
                  try {
                    const regex = new RegExp(filter.value.value, 'g');
                    if (regex.test(prop.value) === false) {
                      return false;
                    }
                  } catch (error) {
                    console.error(error);
                    return false;
                  }
                } else {
                  return false;
                }
              }
            }
            break;
          case 'NUMBER':
            {
              switch (filter.value.type) {
                case '=':
                  {
                    console.log(filter);
                    console.log(prop.value);
                    if (prop.value !== filter.value.value) {
                      console.log('HERE');
                      return false;
                    }
                  }
                  break;
                case '>=':
                  {
                    if (prop.value < filter.value.value) {
                      return false;
                    }
                  }
                  break;
                case '<=':
                  {
                    if (prop.value > filter.value.value) {
                      return false;
                    }
                  }
                  break;
                default: {
                  return false;
                }
              }
            }
            break;
        }
      }
    }
    return true;
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
        case 'BOOLEAN':
          {
            if (options === '') {
              filters = filters.filter(e => e.name !== filter.name);
            } else {
              filter.value = options === 'true' ? true : false;
            }
          }
          break;
        case 'STRING':
          {
            if (options === '') {
              filters = filters.filter(e => e.name !== filter.name);
            } else if (options.type && options.type !== '') {
              filter.value.type = options.type;
            } else if (options.value && options.value !== '') {
              filter.value.value = options.value;
            }
          }
          break;
        case 'NUMBER':
          {
            if (options === '') {
              filters = filters.filter(e => e.name !== filter.name);
            } else if (options.type && options.type !== '') {
              filter.value.type = options.type;
            } else if (options.value && options.value !== '') {
              filter.value.value = options.value;
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
        case 'BOOLEAN':
          {
            if (options) {
              filters.push({
                name: prop.name,
                type: prop.type,
                value: options === 'true' ? true : false,
              });
            }
          }
          break;
        case 'STRING':
          {
            if (options) {
              filters.push({
                name: prop.name,
                type: prop.type,
                value: {
                  type: options.type,
                  value: options.value,
                },
              });
            }
          }
          break;
        case 'NUMBER':
          {
            if (options && options !== '') {
              filters.push({
                name: prop.name,
                type: prop.type,
                value: {
                  type: options.type,
                  value: options.value,
                },
              });
            }
          }
          break;
      }
    }
  }
  async function getData() {
    if (!queries.cid) {
      return;
    }
    if (accessToken.roles[0].name === 'ADMIN') {
      templatePolicy = {
        get: true,
        post: true,
        put: true,
        delete: true,
      };
    } else {
      templatePolicy = accessToken.customPool.policy.templates.find(
        e => e._id === queries.cid,
      );
    }
    template = templates.find(e => e._id === queries.cid);
    entries = allEntries.filter(e => e.templateId === template._id);
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
          {#if templatePolicy.post === true}
            <Button icon="fas fa-plus" on:click={addEntry}>
              Add new Entry
            </Button>
          {/if}
        </div>
      </div>
      <div class="options mt-20">
        <Select
          labelText="View language"
          helperText="Entry result will be shown in selected language."
          selected={languageSelected.code}
          on:change={event => {
            if (event.eventPhase === 0 && event.returnValue === true) {
              const l = languages.find(e => (e.code = event.detail));
              if (l) {
                languageSelected = l;
              }
            }
          }}>
          {#each languages as lng}
            <SelectItem value={lng.code} text="{lng.name} | {lng.nativeName}" />
          {/each}
        </Select>
      </div>
      <div class="filter-heading mt-20">
        <h4>Filters</h4>
        <Button
          class="ml-20"
          kind="ghost"
          icon="fas fa-filter"
          on:click={() => {
            sortEntries();
            entries = [...entries];
          }}>
          Filter
        </Button>
      </div>
      <div class="filters mt-20">
        <div class="filter">
          <Select
            labelText="Sort by date created"
            helperText="Sort entries by the date they were created."
            selected=""
            on:change={event => {
              if (event.eventPhase === 0 && event.returnValue === true) {
                sort.createdAt = event.detail;
              }
            }}>
            <SelectItem value="">- Unselected -</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </Select>
        </div>
        <div class="filter">
          <Select
            labelText="Title"
            helperText="Select a type of string search."
            on:change={event => {
              if (event.eventPhase === 0 && typeof event.detail === 'string') {
                if (event.detail === '') {
                  setFilter({ type: 'STRING', name: 'root_title' }, '');
                } else {
                  setFilter({ type: 'STRING', name: 'root_title' }, { type: event.detail, value: '' });
                }
                filters = [...filters];
              }
            }}>
            <SelectItem value="" text="- Unselected -" />
            <SelectItem value="contains" text="Contains" />
            <SelectItem value="regex" text="Regex" />
          </Select>
          {#if filters.find(e => e.name === 'root_title')}
            <TextInput
              class="mt-20"
              labelText="Search for"
              placeholder="- Type a string to find -"
              on:input={event => {
                setFilter({ type: 'STRING', name: 'root_title' }, { value: event.target.value });
              }} />
          {/if}
        </div>
        {#each template.entryTemplate as prop}
          {#if prop.type === 'ENUMERATION'}
            <div class="filter">
              <Select
                labelText={StringUtil.prettyName(prop.name)}
                helperText="Show Entries with selected enumeration."
                selected=""
                on:change={event => {
                  if (event.eventPhase === 0 && typeof event.detail === 'string') {
                    setFilter(prop, { selected: event.detail });
                    console.log(filters);
                  }
                }}>
                <SelectItem value="" text="- Unselected -" />
                {#each prop.value.items as item}
                  <SelectItem value={item} text={StringUtil.prettyName(item)} />
                {/each}
              </Select>
            </div>
          {:else if prop.type === 'BOOLEAN'}
            <div class="filter">
              <Select
                labelText={StringUtil.prettyName(prop.name)}
                helperText="Show Entries with boolean state."
                selected={languageSelected.code}
                on:change={event => {
                  if (event.eventPhase === 0 && typeof event.detail === 'string') {
                    setFilter(prop, event.detail);
                  }
                }}>
                <SelectItem value="" text="- Unselected -" />
                <SelectItem value="true" text="True" />
                <SelectItem value="false" text="False" />
              </Select>
            </div>
          {:else if prop.type === 'STRING'}
            <div class="filter">
              <Select
                labelText={StringUtil.prettyName(prop.name)}
                helperText="Select type of string search."
                on:change={event => {
                  if (event.eventPhase === 0 && typeof event.detail === 'string') {
                    if (event.detail === '') {
                      setFilter(prop, '');
                    } else {
                      setFilter(prop, { type: event.detail, value: '' });
                    }
                    template.entryTemplate = JSON.parse(JSON.stringify(template.entryTemplate));
                  }
                }}>
                <SelectItem value="" text="- Unselected -" />
                <SelectItem value="contains" text="Contains" />
                <SelectItem value="regex" text="Regex" />
              </Select>
              {#if filters.find(e => e.name === prop.name)}
                <TextInput
                  class="mt-20"
                  labelText="Search for"
                  placeholder="- Type a string to find -"
                  on:input={event => {
                    if (event.eventPhase === 0) {
                      setFilter(prop, { value: event.detail });
                    }
                  }} />
              {/if}
            </div>
          {:else if prop.type === 'NUMBER'}
            <div class="filter">
              <Select
                labelText={StringUtil.prettyName(prop.name)}
                helperText="Select type of number search."
                on:change={event => {
                  if (event.eventPhase === 0 && event.returnValue === true) {
                    if (event.detail === '') {
                      setFilter(prop, '');
                    } else {
                      setFilter(prop, { type: event.detail, value: 0 });
                    }
                    template.entryTemplate = JSON.parse(JSON.stringify(template.entryTemplate));
                  }
                }}>
                <SelectItem value="" text="- Unselected -" />
                <SelectItem value="=" text="Equal" />
                <SelectItem value=">=" text="Grater or equal" />
                <SelectItem value="<=" text="Less or equal" />
              </Select>
              {#if filters.find(e => e.name === prop.name)}
                <NumberInput
                  value="0"
                  class="mt-20"
                  labelText="Search for"
                  placeholder="- Type a string to find -"
                  on:change={event => {
                    if (event.eventPhase === 0) {
                      const filter = filters.find(e => e.name === prop.name);
                      if (filter) {
                        filter.value.value = event.detail;
                      }
                    }
                  }} />
              {/if}
            </div>
          {/if}
        {/each}
      </div>
      {#if entries.length > 0}
        <table class="etable mt-50 mb-50">
          <tr class="header">
            <th>
              <span class="m-auto-0">ID</span>
            </th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Title</th>
            <th>Description</th>
            <th />
          </tr>
          {#each entries as entry, i}
            {#if filterEntry(entry, i) === true}
              <tr class="row">
                <td class="id">{entry._id}</td>
                <td class="date">
                  {new Date(entry.createdAt).toLocaleDateString()}
                  <br />
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </td>
                <td class="date">
                  {new Date(entry.updatedAt).toLocaleDateString()}
                  <br />
                  {new Date(entry.updatedAt).toLocaleTimeString()}
                </td>
                {#if entry.content.find(e => e.lng === languageSelected.code)}
                  {#each entry.content.find(e => e.lng === languageSelected.code).props as prop}
                    {#if prop.type === 'QUILL'}
                      {#if prop.value.heading.title !== ''}
                        <td class="title">{prop.value.heading.title}</td>
                        <td class="desc">{prop.value.heading.desc}</td>
                      {:else}
                        <td class="title">Not available</td>
                        <td class="desc">
                          This Entry is not available in '{languageSelected.code}'
                          language.
                        </td>
                      {/if}
                    {/if}
                  {/each}
                {:else}
                  <td class="title">Not available</td>
                  <td class="desc">
                    This Entry is not available in '{languageSelected.code}'
                    language.
                  </td>
                {/if}
                <td class="actions">
                  <OverflowMenu position="right">
                    <OverflowMenuItem
                      text="Data Model"
                      on:click={() => {
                        viewDataModelModalEvents.setDataModel(JSON.stringify(entry, null, '  '));
                        viewDataModelModalEvents.toggle();
                      }} />
                    {#if templatePolicy && templatePolicy.put === true}
                      <OverflowMenuItem
                        text="Edit"
                        on:click={() => {
                          navigate(`/dashboard/template/entry/rc` + `?tid=${template._id}&eid=${entry._id}&lng=${languageSelected.code}`);
                        }} />
                    {/if}
                    {#if templatePolicy && templatePolicy.delete === true}
                      <OverflowMenuItem
                        danger={true}
                        text="Delete"
                        on:click={() => {
                          deleteEntry(entry);
                        }} />
                    {/if}
                  </OverflowMenu>
                </td>
              </tr>
            {/if}
          {/each}
        </table>
      {:else}
        <div class="no-entries">There are no Entries in this Template</div>
      {/if}
    {:else}
      <div class="no-template">Template was not provided.</div>
    {/if}
  </div>
</Layout>
<ViewDataModelModal events={viewDataModelModalEvents} />
{#if template && languages.length > 0}
  <DataModelModal events={editDataModelModalEvents} {template} {languages} />
  <DataModelModal events={addDataModalModalEvents} {template} {languages} />
{/if}

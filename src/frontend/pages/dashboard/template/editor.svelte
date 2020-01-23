<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import { sideBarOptions } from '../../../components/layout/side-bar.svelte';
  import Layout from '../../../components/layout/layout.svelte';
  import ManagerLayout from '../../../components/layout/manager-content.svelte';
  import AddPropModal from '../../../components/modals/add-prop.svelte';
  import EditPropModal from '../../../components/modals/edit-prop.svelte';
  import AddModal from '../../../components/template/modals/add.svelte';
  import EditModal from '../../../components/template/modals/edit.svelte';
  import PropsList from '../../../components/prop/props-list.svelte';
  import Button from '../../../components/global/button.svelte';
  import UrlQueries from '../../../url-queries.js';
  import StringUtil from '../../../string-util.js';

  export let axios;
  export let Store;

  let templates = [];
  let groups = [];
  let templateSelected;
  let addPropModalEvents = { callback: addProp };
  let editPropModalEvents = { callback: editProp };
  let editModalEvents = { callback: templateEdit };
  let addModalEvents = { callback: templateAdded, toggle: () => {} };

  function showTemplate(template) {
    templateSelected = template;
  }
  function templateAdded(template) {
    templates = [...templates, template];
    templateSelected = template;
    sideBarOptions.updateTemplates(templates);
  }
  function templateEdit(template) {
    templateSelected = template;
    templates = templates.map(e => {
      if (e._id === template._id) {
        e = template;
      }
      return e;
    });
    sideBarOptions.updateTemplates(templates);
  }
  async function addProp(data) {
    if (data.name === 'content') {
      simplePopup.error(
        `'content' is reserved name for this type of template.`,
      );
      return;
    }
    templateSelected.entryTemplate.forEach(e => {
      if (e.type === 'GROUP_POINTER_ARRAY' && !e.value.array) {
        e.value.array = [];
      }
    });
    const result = await axios.send({
      url: '/template',
      method: 'PUT',
      data: {
        _id: templateSelected._id,
        entryTemplate: [...templateSelected.entryTemplate, data],
        changes: {
          props: [],
        },
      },
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    templateSelected = result.response.data.template;
    templates = templates.map(e => {
      if (e._id === templateSelected._id) {
        return templateSelected;
      }
      return e;
    });
  }
  async function deleteTemplate() {
    if (
      confirm('Are you sure? This will delete all entries for this template!')
    ) {
      const result = await axios.send({
        url: `/template/${templateSelected._id}`,
        method: 'DELETE',
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      simplePopup.success('Template deleted successfully.');
      templates = templates.filter(e => e._id !== templateSelected._id);
      sideBarOptions.updateTemplates(templates);
      if (templates.length === 0) {
        templateSelected = undefined;
      } else {
        templateSelected = templates[0];
      }
    }
  }
  async function editProp(originalName, prop) {
    let oldProp;
    templateSelected.entryTemplate = templateSelected.entryTemplate.map(e => {
      if (e.name === originalName) {
        oldProp = e;
        return prop;
      }
      return e;
    });
    const changes = {
      props: [
        {
          name: {
            old: oldProp.name,
            new: prop.name,
          },
          required: prop.required,
        },
      ],
    };
    const result = await axios.send({
      url: '/template',
      method: 'PUT',
      data: {
        _id: templateSelected._id,
        entryTemplate: templateSelected.entryTemplate,
        changes,
      },
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    templateSelected = result.response.data.template;
    templates = templates.map(e => {
      if (e._id === templateSelected._id) {
        return templateSelected;
      }
      return e;
    });
  }
  async function deleteProp(prop, index) {
    if (confirm('Are you sure you want to delete this property?')) {
      templateSelected.entryTemplate = templateSelected.entryTemplate.filter(
        (e, i) => i !== index,
      );
      const result = await axios.send({
        url: '/template',
        method: 'PUT',
        data: {
          _id: templateSelected._id,
          name: templateSelected.name,
          desc: templateSelected.desc,
          entryTemplate: templateSelected.entryTemplate,
          changes: {
            props: [
              {
                name: {
                  new: '',
                  old: prop.name,
                },
                required: prop.required,
                remove: true,
              },
            ],
          },
        },
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      templateSelected = result.response.data.template;
      templates = templates.map(e => {
        if (e._id === templateSelected._id) {
          return templateSelected;
        }
        return e;
      });
    }
  }

  onMount(async () => {
    const queries = UrlQueries.get();
    let result = await axios.send({
      url: '/group/all',
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    groups = result.response.data.groups;
    result = await axios.send({
      url: '/template/all',
      method: 'GET',
    });
    if (result.success === false) {
      return;
    }
    templates = result.response.data.templates;
    if (!templateSelected && templates.length > 0) {
      templateSelected = templates[0];
    }
  });
</script>

<style type="text/scss">
  @import './editor.scss';
</style>

<Layout {Store} {axios}>
  <ManagerLayout
    items={templates}
    itemSelected={templateSelected}
    menuConfig={{ heading: 'TEMPLATES', buttonLabel: 'Add new Template' }}
    on:addNewItem={event => {
      if (event.eventPhase === 0) {
        addModalEvents.toggle();
      }
    }}
    on:itemClicked={event => {
      if (event.eventPhase === 0) {
        showTemplate(event.detail);
      }
    }}
    on:addProp={event => {
      if (event.eventPhase === 0) {
        addPropModalEvents.toggle();
      }
    }}
    on:delete={event => {
      if (event.eventPhase === 0) {
        deleteTemplate();
      }
    }}>
    {#if templateSelected && templateSelected.entryTemplate.length > 0}
      <PropsList
        props={templateSelected.entryTemplate}
        {groups}
        on:remove={event => {
          if (event.eventPhase === 0) {
            deleteProp(event.detail.prop, event.detail.i);
          }
        }}
        on:edit={event => {
          if (event.eventPhase === 0) {
            editPropModalEvents.setProp(event.detail.prop, event.detail.i);
            editPropModalEvents.toggle();
          }
        }} />
    {:else}
      <div class="no-props">
        <div class="message">There are no properties yet</div>
        <div class="desc">Add your first to this Template</div>
        <div class="action">
          <Button
            icon={'fas fa-plus'}
            size={'small'}
            on:click={addPropModalEvents.toggle}>
            Add Property
          </Button>
        </div>
      </div>
    {/if}
  </ManagerLayout>
</Layout>
<AddModal {axios} events={addModalEvents} />
<EditModal {axios} events={editModalEvents} />
{#if templateSelected}
  <AddPropModal
    selectedGroupId={undefined}
    usedPropNames={templateSelected.entryTemplate.map(e => {
      return e.name;
    })}
    {groups}
    events={addPropModalEvents} />
  <EditPropModal
    selectedGroupId={templateSelected._id}
    usedPropNames={templateSelected.entryTemplate.map(e => {
      return e.name;
    })}
    {groups}
    events={editPropModalEvents} />
{/if}

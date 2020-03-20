<script>
  import {
    axios,
    templateStore,
    groupStore,
    fatch,
  } from '../../../config.svelte';
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/global/layout.svelte';
  import ManagerLayout from '../../../components/global/manager-content.svelte';
  import AddPropModal from '../../../components/global/modal/add-prop.svelte';
  import EditPropModal from '../../../components/modals/edit-prop.svelte';
  import AddModal from '../../../components/template/modals/add.svelte';
  import EditModal from '../../../components/global/modal/name-desc.svelte';
  import PropsList from '../../../components/prop/props-list.svelte';
  import Button from '../../../components/global/button.svelte';
  import UrlQueries from '../../../url-queries.js';
  import StringUtil from '../../../string-util.js';

  let templates = [];
  let groups = [];
  let templateSelected = templates[0];
  let addPropModalEvents = {};
  let editPropModalEvents = { callback: editProp };
  const editModalEvents = {};
  let addModalEvents = { callback: templateAdded, toggle: () => {} };

  templateStore.subscribe(value => {
    templates = value;
    if (!templateSelected && templates.length > 0) {
      templateSelected = templates[0];
    }
  });
  groupStore.subscribe(value => {
    groups = value;
  });

  function showTemplate(template) {
    templateSelected = template;
  }
  async function templateAdded(data) {
    const result = await axios.send({
      url: '/template',
      method: 'POST',
      data,
    });
    if (result.success === false) {
      simplePopup.push('error', result.error.response.data.message);
      return;
    }
    templateStore.update(value => [
      ...templates,
      result.response.data.template,
    ]);
    templateSelected = result.response.data.template;
  }
  async function updateTemplate(data) {
    const result = await axios.send({
      url: '/template',
      method: 'PUT',
      data: {
        _id: templateSelected._id,
        name: data.name,
        desc: data.desc,
      },
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    templateSelected = result.response.data.template;
    templateStore.update(value =>
      templates.map(e => {
        if (e._id === templateSelected._id) {
          return templateSelected;
        }
        return e;
      }),
    );
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
    templateStore.update(value =>
      templates.map(e => {
        if (e._id === templateSelected._id) {
          return templateSelected;
        }
        return e;
      }),
    );
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
      templateStore.update(value =>
        templates.filter(e => e._id !== templateSelected._id),
      );
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
    templateStore.update(value =>
      templates.map(e => {
        if (e._id === templateSelected._id) {
          return templateSelected;
        }
        return e;
      }),
    );
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
      templateStore.update(value =>
        templates.map(e => {
          if (e._id === templateSelected._id) {
            return templateSelected;
          }
          return e;
        }),
      );
    }
  }
  async function moveProp(position, data) {
    let found = false;
    if (position === 'up') {
      if (data.i > 0) {
        found = true;
        templateSelected.entryTemplate = templateSelected.entryTemplate.map(
          (e, i) => {
            if (i === data.i) {
              return templateSelected.entryTemplate[i - 1];
            } else if (i === data.i - 1) {
              return data.prop;
            }
            return e;
          },
        );
      }
    } else if (position === 'down') {
      if (templateSelected.entryTemplate[data.i + 1]) {
        found = true;
        templateSelected.entryTemplate = templateSelected.entryTemplate.map(
          (e, i) => {
            if (i === data.i) {
              return templateSelected.entryTemplate[i + 1];
            } else if (i === data.i + 1) {
              return data.prop;
            }
            return e;
          },
        );
      }
    }
    if (found === false) {
      simplePopup.error('Action cannot be performed.');
      return;
    }
    const result = await axios.send({
      url: '/template',
      method: 'PUT',
      data: {
        _id: templateSelected._id,
        entryTemplate: templateSelected.entryTemplate,
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
    templateStore.update(value =>
      templates.map(e => {
        if (e._id === templateSelected._id) {
          return templateSelected;
        }
        return e;
      }),
    );
  }

  onMount(async () => {
    fatch();
    if (!templateSelected && templates.length > 0) {
      templateSelected = templates[0];
    }
  });
</script>

<Layout>
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
    on:edit={event => {
      editModalEvents.set(templateSelected.name, templateSelected.desc);
      editModalEvents.toggle();
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
        }}
        on:moveUp={event => {
          if (event.eventPhase === 0) {
            moveProp('up', event.detail);
          }
        }}
        on:moveDown={event => {
          if (event.eventPhase === 0) {
            moveProp('down', event.detail);
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
{#if templateSelected}
  <EditModal
    title="Edit Template"
    events={editModalEvents}
    name={templateSelected.name}
    desc={templateSelected.desc}
    on:done={event => {
      if (event.eventPhase === 0) {
        const data = event.detail;
        updateTemplate(data);
      }
    }} />
  <AddPropModal
    usedPropNames={templateSelected.entryTemplate.map(e => {
      return e.name;
    })}
    events={addPropModalEvents}
    {groups}
    on:done={event => {
      addProp(event.detail);
    }} />
  <EditPropModal
    selectedGroupId={templateSelected._id}
    usedPropNames={templateSelected.entryTemplate.map(e => {
      return e.name;
    })}
    {groups}
    events={editPropModalEvents} />
{/if}

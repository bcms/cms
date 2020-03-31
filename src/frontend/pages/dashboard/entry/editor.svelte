<script>
  import uuid from 'uuid';
  import crypto from 'crypto-js';
  import { onMount, afterUpdate } from 'svelte';
  import { navigate } from 'svelte-routing';
  import {
    axios,
    widgetStore,
    groupStore,
    languageStore,
    templateStore,
    entryStore,
  } from '../../../config.svelte';
  import Select from '../../../components/global/select/select.svelte';
  import SelectItem from '../../../components/global/select/select-item.svelte';
  import TextArea from '../../../components/global/text-area.svelte';
  import Media from '../../../components/widget/media.svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Leyout from '../../../components/global/layout.svelte';
  import Props from '../../../components/prop/props.svelte';
  import QuillContent from '../../../components/entry/quill-content.svelte';
  import Button from '../../../components/global/button.svelte';
  import StringUtil from '../../../string-util.js';
  import UrlQueries from '../../../url-queries.js';

  const queries = UrlQueries.get();
  let initDone = false;
  let entryId;
  let template;
  let templates;
  let entries;
  let widgets;
  let groups;
  let languages;
  let selectedLanguage = {
    code: 'en',
    disabled: false,
  };
  let entry;
  let quill;
  let loadTimer;
  let data = {
    en: {
      title: {
        error: '',
        value: '',
      },
      slug: '',
      coverImageUri: '',
      desc: '',
      meta: [],
      sections: [],
    },
  };
  let dataHash;
  let quillContentEvents = {};
  let propsEvents = {};
  widgetStore.subscribe(value => {
    if (value) {
      widgets = value;
    }
    if (initDone === false) {
      console.log('widgets');
      init();
    }
  });
  groupStore.subscribe(value => {
    if (value) {
      groups = value;
    }
    if (initDone === false) {
      console.log('groups');
      init();
    }
  });
  languageStore.subscribe(value => {
    if (value) {
      languages = value;
    }
    if (initDone === false) {
      console.log('languages');
      init();
    }
  });
  templateStore.subscribe(value => {
    if (value) {
      templates = value;
      template = value.find(e => e._id === queries.tid);
    }
    if (initDone === false) {
      console.log('templates');
      init();
    }
  });
  entryStore.subscribe(value => {
    if (value) {
      entries = value;
      if (initDone === false) {
        if (queries.eid) {
          entry = entries.find(e => e._id === queries.eid);
        }
        console.log('entries');
        init();
      }
    }
  });

  async function addEntry() {
    const metaProps = propsEvents.validateAndGetProps();
    if (!metaProps) {
      return;
    }
    const verificationResult = validateSections();
    if (verificationResult === false) {
      return;
    }
    const content = createContent();
    const result = await axios.send({
      url: `/template/${template._id}/entry`,
      method: 'POST',
      data: {
        content,
      },
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    entryStore.update(value => [...value, result.response.data.entry]);
    navigate(
      `/dashboard/template/entries/view/c/${template._id}?` +
        `cid=${template._id}&lng=${selectedLanguage.code}`,
      { replace: true },
    );
  }
  async function updateEnrty() {
    const metaProps = propsEvents.validateAndGetProps();
    if (!metaProps) {
      return;
    }
    const verificationResult = validateSections();
    if (verificationResult === false) {
      return;
    }
    const content = createContent();
    const result = await axios.send({
      url: `/template/${template._id}/entry`,
      method: 'PUT',
      data: {
        _id: queries.eid,
        content,
        onlyLng: selectedLanguage.code,
      },
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    simplePopup.success('Entry updated successfully.');
    dataHash = hashData();
    selectedLanguage.disabled = false;
  }
  function createContent() {
    const content = [];
    for (const lng in data) {
      const d = data[lng];
      const props = JSON.parse(JSON.stringify(d.meta));
      props.push({
        type: 'QUILL',
        name: 'content',
        required: true,
        value: {
          heading: {
            title: data[lng].title.value,
            slug: data[lng].slug,
            desc: data[lng].desc,
            coverImageUri: data[lng].coverImageUri,
          },
          content: [],
        },
      });
      if (d.sections.length > 0) {
        d.sections.forEach(section => {
          if (section.type === 'MEDIA') {
            props[props.length - 1].value.content.push({
              id: section.id,
              type: section.type,
              value: section.value ? section.value : '',
              valueAsText: section.valueAsText,
            });
          } else if (section.type === 'WIDGET') {
            props[props.length - 1].value.content.push({
              id: section.id,
              type: section.type,
              value: section.value,
              valueAsText: '',
            });
          } else {
            props[props.length - 1].value.content.push({
              id: section.id,
              type: section.type,
              value: section.value ? section.value : {},
              valueAsText: section.valueAsText,
            });
          }
        });
      }
      content.push({
        lng,
        props,
      });
    }
    return content;
  }
  function validateSections() {
    if (data[selectedLanguage.code].title.value.replace(/ /g, '') === '') {
      data[selectedLanguage.code].title.error = 'Title cannot be empty.';
      return false;
    }
    data[selectedLanguage.code].title.error = '';
    for (const i in data[selectedLanguage.code].sections) {
      const section = data[selectedLanguage.code].sections[i];
      if (section.type === 'WIDGET') {
        const props = section.quillEvents.validateAndGetProps();
        if (!props) {
          return false;
        }
      }
    }
    return true;
  }
  function changeLanguage(lng) {
    const checkDataHash = hashData();
    if (checkDataHash !== dataHash) {
      if (
        !confirm(
          'You have unsaved changes. ' +
            'Are you sure you want to change language?',
        )
      ) {
        languages = JSON.parse(JSON.stringify(languages));
        return;
      }
    }
    navigate(
      `/dashboard/template/entry/rc?tid=${template._id}&eid=${entry._id}&lng=${lng}`,
      { replace: true },
    );
    selectedLanguage.code = lng;
    initDone = false;
    setTimeout(() => {
      init();
      propsEvents.init();
    }, 100);
  }
  function hashData() {
    const d = {};
    for (const lng in data) {
      d[lng] = {
        title: data[lng].title,
        slug: data[lng].slug,
        desc: data[lng].desc,
        coverImageUri: data[lng].coverImageUri,
        meta: data[lng].meta,
        sections: data[lng].sections.map((e, i) => {
          return {
            id: e.id,
            type: e.type,
            order: e.order,
            error: e.error,
            class: e.type.toLowerCase().replace(/_/g, '-'),
            value: e.value,
            valueAsText: e.valueAsText,
            style: '',
          };
        }),
      };
    }
    return crypto.SHA256(JSON.stringify(d)).toString();
  }
  function handleTitle(event) {
    data[selectedLanguage.code].title.value = event.target.value;
    data[selectedLanguage.code].slug = StringUtil.toUri(
      data[selectedLanguage.code].title.value,
    );
  }

  function getQuill() {
    console.log('Quill');
    if (window.Quill) {
      clearInterval(loadTimer);
      quill = Quill;
    }
  }
  function getHighlight() {
    console.log('hljs');
    if (window.hljs) {
      clearInterval(loadTimer);
      loadTimer = setInterval(getQuill, 50);
    }
  }
  function init() {
    if (languages && languages.length > 0 && template && groups && widgets) {
      if (queries.eid) {
        if (entry) {
          const entryId = entry._id;
          for (const j in languages) {
            const lng = languages[j];
            const entryContent = entry.content.find(e => e.lng === lng.code);
            let content = [];
            if (entryContent) {
              content = JSON.parse(JSON.stringify(entryContent));
            } else {
              content = JSON.parse(
                JSON.stringify(entry.content.find(e => e.lng === 'en')),
              );
            }
            data[lng.code] = {};
            if (!content) {
              data[lng.code] = {
                title: {
                  error: '',
                  value: '',
                },
                slug: '',
                coverImageUri: '',
                desc: '',
                meta: JSON.parse(JSON.stringify(template.entryTemplate)),
                sections: [],
              };
            } else {
              const orderProps = function(props, referenceProps) {
                return JSON.parse(
                  JSON.stringify(
                    referenceProps.map(e => {
                      const p = props.find(prop => prop.name === e.name);
                      if (!p) {
                        return e;
                      }
                      if (p.type === 'GROUP_POINTER') {
                        p.value.props = orderProps(
                          p.value.props,
                          e.value.props,
                        );
                      } else if (p.type === 'GROUP_POINTER_ARRAY') {
                        p.value.props = orderProps(
                          p.value.props,
                          e.value.props,
                        );
                      }
                      return p;
                    }),
                  ),
                );
              };
              data[lng.code].meta = orderProps(
                content.props,
                template.entryTemplate,
              );
              const quillProp = content.props.find(e => e.type === 'QUILL');
              data[lng.code].title = {
                value: quillProp.value.heading.title,
                error: '',
              };
              data[lng.code].slug = quillProp.value.heading.slug;
              data[lng.code].desc = quillProp.value.heading.desc;
              data[lng.code].coverImageUri =
                quillProp.value.heading.coverImageUri;
              data[lng.code].sections = quillProp.value.content.map((e, i) => {
                let value = e.value;
                if (e.type === 'WIDGET') {
                  const widget = widgets.find(t => t._id === value._id);
                  if (widget) {
                    value.props = orderProps(value.props, widget.props);
                  } else {
                    console.error(
                      `Widget "${value._id}"" does not exist!`,
                      value,
                    );
                  }
                }
                return {
                  id: e.id,
                  type: e.type,
                  order: i,
                  error: '',
                  class: e.type.toLowerCase().replace(/_/g, '-'),
                  value: value,
                  valueAsText: e.valueAsText,
                  quill: undefined,
                  quillEvents: {
                    delete: quillContentEvents.removeSection,
                    move: quillContentEvents.moveSection,
                    addSection: quillContentEvents.addSection,
                    selectElementModalEvents:
                      quillContentEvents.selectElementModalEvents,
                    validate: () => {},
                  },
                  style: '',
                };
              });
            }
            initDone = true;
          }
        }
      } else {
        languages.forEach(e => {
          data[e.code] = {
            title: {
              error: '',
              value: '',
            },
            slug: '',
            coverImageUri: '',
            desc: '',
            meta: JSON.parse(JSON.stringify(template.entryTemplate)),
            sections: [],
          };
        });
        initDone = true;
      }
      dataHash = hashData();
    }
  }

  selectedLanguage = {
    code: queries.lng,
  };
  if (queries.eid) {
    axios
      .send({
        url: `/template/${queries.tid}/entry/${queries.eid}`,
        method: 'GET',
      })
      .then(result => {
        if (result.success === false) {
          console.error(result.error);
          simplePopup.error(result.error.response.data.message);
          return;
        }
        entry = result.response.data.entry;
        init();
      });
  }

  onMount(async () => {
    loadTimer = setInterval(getHighlight, 50);
  });
  afterUpdate(() => {
    const checkDataHash = hashData();
    if (checkDataHash !== dataHash) {
      selectedLanguage.disabled = true;
    } else {
      selectedLanguage.disabled = false;
    }
  });
</script>

<style type="text/scss">
  @import './editor.scss';

  .title {
    border: none;
    padding: 10px;
    font-size: 30pt;
  }

  .title .error {
    color: var(--c-error);
    font-size: 10pt;
  }

  .title .error .icon {
    margin-right: 10px;
  }
</style>

<svelte:head>
  <script src="/js/highlight.js">

  </script>
  <script src="/js/quill.js">

  </script>
</svelte:head>
<Leyout>
  {#if initDone === true}
    <div class="wrapper">
      <div class="heading">
        <div class="info">
          <div class="title">
            {StringUtil.prettyName(template.name)} | {queries.eid ? 'Edit Entry' : 'New Entry'}
          </div>
          <div class="desc">
            Create new rich content Entry for this Template.
          </div>
        </div>
        <div class="actions">
          {#if queries.eid}
            <Button icon="fas fa-check" on:click={updateEnrty}>Update</Button>
          {:else}
            <Button icon="fas fa-plus" on:click={addEntry}>Save</Button>
          {/if}
        </div>
      </div>
      <h3>Change Language</h3>
      <div
        class="lng"
        on:click={() => {
          const checkDataHash = hashData();
          if (checkDataHash !== dataHash) {
            selectedLanguage.disabled = true;
          } else {
            selectedLanguage.disabled = false;
          }
        }}>
        <Select
          selected="en"
          disabled={selectedLanguage.disabled}
          on:change={event => {
            console.log(event);
            if (event.eventPhase === 0 && entry) {
              console.log('lol');
              changeLanguage(event.detail);
            }
          }}>
          {#each languages as lng}
            <SelectItem text="{lng.name} | {lng.nativeName}" value={lng.code} />
          {/each}
        </Select>
      </div>
      <div class="title">
        {#if data[selectedLanguage.code].title.error !== ''}
          <div class="error">
            <span class="fas fa-exclamation icon" />
            <span>{data[selectedLanguage.code].title.error}</span>
          </div>
        {/if}
        <input
          id="title"
          class="title"
          placeholder="- Title -"
          value={data[selectedLanguage.code].title.value}
          on:keyup={handleTitle} />
      </div>
      <div>
        <div class="bx--label">Description</div>
        <TextArea
          cols="500"
          value={data[selectedLanguage.code].desc}
          placeholder="- Description -"
          on:input={event => {
            if (event.eventPhase === 0) {
              data[selectedLanguage.code].desc = event.detail;
            }
          }} />
      </div>
      <div class="bx--label mt-20">Cover Image</div>
      <Media
        value={data[selectedLanguage.code].coverImageUri}
        noButtons={true}
        on:change={event => {
          if (event.eventPhase === 0) {
            data[selectedLanguage.code].coverImageUri = `${event.detail}`;
          }
        }} />
      <h3>Meta</h3>
      <div class="meta">
        <Props
          {groups}
          {widgets}
          props={data[selectedLanguage.code].meta}
          events={propsEvents} />
      </div>
      <h3>Content</h3>
      <div class="content">
        {#if quill}
          <QuillContent
            {axios}
            {quill}
            {groups}
            {widgets}
            data={data[selectedLanguage.code]}
            events={quillContentEvents} />
        {/if}
      </div>
    </div>
  {/if}
</Leyout>

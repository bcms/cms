<script>
  import uuid from 'uuid';
  import crypto from 'crypto-js';
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import {
    axios,
    widgetStore,
    groupStore,
    languageStore,
    templateStore,
  } from '../../../config.svelte';
  import { Select, SelectItem } from 'carbon-components-svelte';
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
  let templates = [];
  let widgets = [];
  let groups = [];
  let languages = [];
  let selectedLanguage = {
    code: 'en',
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
    widgets = value;
    if (initDone === false) {
      init();
    }
  });
  groupStore.subscribe(value => {
    groups = value;
    if (initDone === false) {
      init();
    }
  });
  languageStore.subscribe(value => {
    languages = value;
    if (initDone === false) {
      init();
    }
  });
  templateStore.subscribe(value => {
    templates = value;
    template = value.find(e => e._id === queries.tid);
    if (initDone === false) {
      init();
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
    window.location =
      `/dashboard/template/entries/view/c/${template._id}?` +
      `cid=${template._id}&lng=${selectedLanguage.code}`;
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
    console.log('Content', content);
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
        return;
      }
    }
    navigate(
      `/dashboard/template/entry/rc?tid=${template._id}&eid=${entry._id}&lng=${lng}`,
      { replace: true },
    );
    selectedLanguage.code = lng;
    init();
    propsEvents.init();
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

  function getQuill() {
    if (Quill) {
      clearInterval(loadTimer);
      quill = Quill;
    }
  }
  function getHighlight() {
    if (hljs) {
      clearInterval(loadTimer);
      loadTimer = setInterval(getQuill, 50);
    }
  }
  function init() {
    if (languages && template && groups && widgets) {
      if (queries.eid && entry) {
        const entryId = entry._id;
        for (const j in languages) {
          const lng = languages[j];
          const content = JSON.parse(
            JSON.stringify(entry.content.find(e => e.lng === lng.code)),
          );
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
              meta: JSON.parse(JSON.stringify(t.entryTemplate)),
              sections: [],
            };
          } else {
            data[lng.code].meta = content.props.filter(e => e.type !== 'QUILL');
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
              return {
                id: e.id,
                type: e.type,
                order: i,
                error: '',
                class: e.type.toLowerCase().replace(/_/g, '-'),
                value: e.value,
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
          template.entryTemplate.forEach(e => {
            if (!data[lng.code].meta.find(m => m.name === e.name)) {
              data[lng.code].meta.push(e);
            }
          });
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
      }
      initDone = true;
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
</script>

<style type="text/scss">
  @import './editor.scss';
</style>

<svelte:head>
  <script src="/js/highlight.js">

  </script>
  <script src="/js/quill.js">

  </script>
</svelte:head>
<Leyout>
  {#if template && initDone === true && data[selectedLanguage.code] && data[selectedLanguage.code].meta}
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
      <div class="lng">
        <Select
          selected={selectedLanguage.code}
          on:change={event => {
            if (event.eventPhase === 0) {
              changeLanguage(event.detail);
            }
          }}>
          {#each languages as lng}
            <SelectItem text="{lng.name} | {lng.nativeName}" value={lng.code} />
          {/each}
        </Select>
      </div>
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

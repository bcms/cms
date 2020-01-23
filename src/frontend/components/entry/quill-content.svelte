<script>
  import uuid from 'uuid';
  import { onMount } from 'svelte';
  import QuillElement from './quill-element.svelte';
  import SelectElementModal from './modals/select-element.svelte';
  import Button from '../global/button.svelte';
  import StringUtil from '../../string-util.js';

  export let quill;
  export let data;
  export let events;
  export let widgets;

  let selectElementModalEvents = {
    select: (type, position, additional) => {
      addSection(type, position, additional);
    },
  };

  function handleTitle(event) {
    data.title.value = event.target.value;
    data.slug = StringUtil.toUri(data.title.value);
  }
  function addSection(type, position, additional) {
    const section = {
      id: uuid.v4(),
      type,
      order: data.sections.length,
      error: '',
      class: type.toLowerCase().replace(/_/g, '-'),
      value: undefined,
      valueAsText: '',
      quill: undefined,
      quillEvents: {
        delete: removeSection,
        move: moveSection,
        addSection,
        selectElementModalEvents,
        validate: () => {},
      },
      style: '',
    };
    if (typeof additional === 'object') {
      section.value = additional.value;
    } else {
      switch (type) {
        case 'MEDIA':
          {
            section.value = '';
          }
          break;
        case 'WIDGET':
          {
            section.value = JSON.parse(
              JSON.stringify(widgets.find(e => e.name === additional)),
            );
          }
          break;
      }
    }
    if (typeof position !== 'undefined' && data.sections[position]) {
      section.order = position;
      data.sections.forEach(e => {
        if (e.order >= position) {
          e.order = e.order + 1;
        }
      });
    }
    data.sections.push(section);
    data.sections.sort((a, b) => {
      if (a.order > b.order) {
        return 1;
      } else if (a.order < b.order) {
        return -1;
      }
      return 0;
    });
    data.sections = data.sections.map(e => {
      e.quill = undefined;
      return e;
    });
  }
  function removeSection(sectionId) {
    data.sections = data.sections
      .filter(e => e.id !== sectionId)
      .map(e => {
        e.quill = undefined;
        return e;
      });
  }
  function moveSection(from, to) {
    if (to > -1 && to < data.sections.length) {
      data.sections.forEach(section => {
        if (section.order === to) {
          section.order = from;
        } else if (section.order === from) {
          section.order = to;
        }
      });
      data.sections.sort((a, b) => {
        if (a.order > b.order) {
          return 1;
        } else if (a.order < b.order) {
          return -1;
        }
        return 0;
      });
      data.sections = data.sections.map(e => {
        e.quill = undefined;
        return e;
      });
      setTimeout(() => {
        data.sections.forEach(section => {
          section.quillEvents.init();
        });
      }, 10);
    }
  }

  (events.delete = removeSection), (events.addSection = addSection);
  events.removeSection = removeSection;
  events.moveSection = moveSection;
  events.selectElementModalEvents = selectElementModalEvents;

  for (const i in data.sections) {
    data.sections[i].quillEvents = {
      delete: removeSection,
      move: moveSection,
      addSection,
      selectElementModalEvents,
      validate: () => {},
    };
  }
</script>

<style type="text/scss">
  @import './quill-content.scss';
</style>

<div class="title">
  {#if data.title.error !== ''}
    <div class="error">
      <span class="fas fa-exclamation icon" />
      <span>{data.title.error}</span>
    </div>
  {/if}
  <input
    id="title"
    class="title"
    placeholder="- Title -"
    value={data.title.value}
    on:keyup={handleTitle} />
</div>
<textarea class="desc" placeholder="- Description -" bind:value={data.desc} />
<input
  class="input"
  placeholder="- Cover Image URI -"
  bind:value={data.coverImageUri} />
<div class="sections">
  {#if data.sections.length > 0 && quill}
    {#each data.sections as section, i}
      <QuillElement
        {widgets}
        {quill}
        {section}
        events={section.quillEvents}
        inFocus={false} />
    {/each}
    <div class="actions">
      <Button
        icon="fas fa-plus"
        on:click={() => {
          selectElementModalEvents.toggle();
        }}>
        Add Section
      </Button>
    </div>
  {:else}
    <div class="empty">
      <div class="message">Looks like there are no Sections...</div>
      <div class="actions">
        <Button
          icon="fas fa-plus"
          on:click={() => {
            selectElementModalEvents.toggle();
          }}>
          Add Section
        </Button>
      </div>
    </div>
  {/if}
</div>
<SelectElementModal events={selectElementModalEvents} {widgets} />

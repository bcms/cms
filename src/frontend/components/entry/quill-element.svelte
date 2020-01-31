<script>
  import { onMount, afterUpdate } from 'svelte';
  import Widget from '../widget/widget.svelte';

  export let groups;
  export let quill;
  export let section;
  export let events;
  export let inFocus;

  let id = '';
  let shift = false;

  const quillOptions = {
    HEADING_1: {
      modules: {
        toolbar: false,
      },
      placeholder: 'Heading 1',
      theme: 'bubble',
    },
    HEADING_2: {
      modules: {
        toolbar: false,
      },
      placeholder: 'Heading 2',
      theme: 'bubble',
    },
    HEADING_3: {
      modules: {
        toolbar: false,
      },
      placeholder: 'Heading 3',
      theme: 'bubble',
    },
    PARAGRAPH: {
      modules: {
        toolbar: [['bold', 'italic', 'underline', 'strike']],
      },
      placeholder: 'Paragraph',
      theme: 'bubble',
    },
    CODE: {
      modules: {
        syntax: true,
        toolbar: false,
      },
      placeholder: 'CODE',
      theme: 'bubble',
    },
    LIST: {
      modules: {
        toolbar: [['bold', 'italic', 'underline', 'strike']],
      },
      placeholder: 'List',
      theme: 'bubble',
    },
  };

  function init() {
    if (section.type !== 'MEDIA' && section.type !== 'WIDGET') {
      if (typeof section.quill === 'undefined') {
        section.quill = new quill(
          document.getElementById(section.id),
          quillOptions[section.type],
        );
      }
      if (section.value) {
        section.quill.setContents(section.value);
      } else {
        switch (section.type) {
          case 'LIST':
            {
              section.quill.setContents([
                { insert: '' },
                {
                  attributes: {
                    list: 'bullet',
                  },
                  insert: '\n',
                },
              ]);
            }
            break;
          case 'CODE':
            {
              section.quill.setContents([
                { insert: '' },
                {
                  attributes: {
                    'code-block': true,
                  },
                  insert: '\n',
                },
              ]);
            }
            break;
          default: {
            section.quill.setContents([]);
          }
        }
      }
      section.quill.on('text-change', () => {
        if (section.quill) {
          section.value = section.quill.getContents();
          section.valueAsText = section.quill.getText();
          if (section.type.startsWith('HEADING_') === true) {
            let text = section.quill.getText();
            if (text.endsWith('\n\n') === true) {
              text = text.replace('\n\n', '\n');
              section.quill.setText(text);
            }
          } else if (section.type === 'PARAGRAPH') {
            let lastOps = section.value.ops[section.value.ops.length - 1];
            if (lastOps.insert.endsWith('\n\n') === true && shift === false) {
              lastOps.insert = lastOps.insert.substring(
                0,
                lastOps.insert.length - 1,
              );
              section.value.ops[section.value.ops.length - 1] = lastOps;
              section.quill.setContents(section.value);
            }
          }
        } else {
          console.log('No quill', section.type);
        }
      });
      document
        .getElementById(section.id)
        .removeEventListener('keydown', keyDownListener);
      document
        .getElementById(section.id)
        .addEventListener('keydown', keyDownListener);
      document
        .getElementById(section.id)
        .removeEventListener('keyup', keyUpListener);
      document
        .getElementById(section.id)
        .addEventListener('keyup', keyUpListener);
    }
  }
  function keyDownListener(event) {
    if (event.key === 'Shift') {
      shift = true;
    }
  }
  function keyUpListener(event) {
    switch (event.key) {
      case 'Shift':
        {
          shift = false;
        }
        break;
      case 'Backspace':
        {
          if (section.value === '') {
            document
              .getElementById(section.id)
              .removeEventListener('keyup', keyUpListener);
            document
              .getElementById(section.id)
              .removeEventListener('keyup', keyUpListener);
            events.delete(section.id);
          }
          if (section.quill.getText().length === 1) {
            section.value = '';
          }
        }
        break;
      case 'Enter':
        {
          if (shift === false) {
            if (
              section.type.startsWith('HEADING_') === true ||
              section.type === 'PARAGRAPH'
            ) {
              events.selectElementModalEvents.setPosition(section.order + 1);
              events.selectElementModalEvents.toggle();
            }
          } else {
            if (section.type === 'LIST' || section.type === 'CODE') {
              events.selectElementModalEvents.setPosition(section.order + 1);
              events.selectElementModalEvents.toggle();
            }
          }
        }
        break;
    }
  }

  events.init = init;

  onMount(() => {
    events.init();
    id = section.id;
  });
  afterUpdate(() => {
    if (!section.quill) {
      events.init = init;
      events.init();
    }
  });
</script>

<style type="text/scss" global>
  @import './quill-element.scss';
</style>

<div class="quill">
  {#if section.type === 'MEDIA'}
    {#if inFocus === true}
      <input
        id={section.id}
        class="input"
        placeholder="- Path to File -"
        value={section.value}
        on:keyup={event => {
          section.value = event.target.value;
          section.valueAsText = section.value;
        }} />
    {:else}
      <input
        class="input"
        placeholder="- Path to File -"
        value={section.value}
        on:keyup={event => {
          section.value = event.target.value;
          section.valueAsText = section.value;
        }} />
    {/if}
  {:else if section.type === 'WIDGET'}
    <Widget
      {groups}
      widget={section.value}
      {events}
      on:delete={event => {
        if (event.eventPhase === 0) {
          events.delete(section.id);
        }
      }}
      on:move={event => {
        if (event.eventPhase === 0) {
          if (event.detail === 'up') {
            events.move(section.order, section.order - 1, section.id);
          } else {
            events.move(section.order, section.order + 1, section.id);
          }
        }
      }} />
  {:else}
    <div id={section.id} class={section.class} />
  {/if}
</div>

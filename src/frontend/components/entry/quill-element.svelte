<script>
  import { onMount } from 'svelte';
  import WidgetInput from '../widget-input.svelte';

  export let widgets;
  export let quill;
  export let section;
  export let events;
  export let inFocus;

  let id = '';

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

  events.init = () => {
    if (section.type !== 'MEDIA' && section.type !== 'WIDGET') {
      section.quill = new quill(
        document.getElementById(section.id),
        quillOptions[section.type],
      );
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
        }
      }
      let shift = false;
      section.quill.on('text-change', () => {
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
      });
      document.getElementById(section.id).addEventListener('keydown', event => {
        if (event.key === 'Shift') {
          shift = true;
        }
      });
      document.getElementById(section.id).addEventListener('keyup', event => {
        switch (event.key) {
          case 'Shift':
            {
              shift = false;
            }
            break;
          case 'Backspace':
            {
              if (section.value === '') {
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
                  events.selectElementModalEvents.toggle();
                }
              }
            }
            break;
        }
      });
    }
  };

  onMount(() => {
    events.init();
    id = section.id;
  });
</script>

<style type="text/scss">
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
    <WidgetInput
      {widgets}
      widget={section.value}
      events={{ delete: () => {
          events.delete(section.id);
        }, move: where => {
          if (where === 'up') {
            events.move(section.order, section.order - 1, section.id);
          } else {
            events.move(section.order, section.order + 1, section.id);
          }
        } }} />
  {:else}
    <div id={section.id} class={section.class} />
  {/if}
</div>

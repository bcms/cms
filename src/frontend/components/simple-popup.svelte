<script context="module">
  import { ToastNotification } from 'carbon-components-svelte';
  import StringUtil from '../string-util.js';

  export const simplePopup = {
    info: () => {},
    success: () => {},
    error: () => {},
    hide: () => {},
  };
  export const MessageType = {
    error: 'error',
    success: 'success',
  };
</script>

<script>
  import uuid from 'uuid';

  let messages = [];
  const timeout = 8000;

  simplePopup.remove = messageId => {
    if (messages.find(e => e.id === messageId)) {
      messages = messages.map(message => {
        if (message.id === messageId) {
          message.position = 0;
        }
        return message;
      });
      setTimeout(() => {
        messages = messages.filter(message => message.id !== messageId);
      }, 800);
    }
  };

  simplePopup.error = content => {
    simplePopup.push(MessageType.error, content);
  };

  simplePopup.success = content => {
    simplePopup.push(MessageType.success, content);
  };

  simplePopup.push = (type, content) => {
    switch (type) {
      case MessageType.error:
        {
          const message = {
            id: uuid.v4(),
            position: 0,
            type,
            content,
          };
          messages = [...messages, message];
          setTimeout(() => {
            message.position = 320;
            messages = [...messages];
          }, 100);
          setTimeout(() => {
            simplePopup.remove(message.id);
          }, timeout);
        }
        break;
      case MessageType.success:
        {
          const message = {
            id: uuid.v4(),
            position: 0,
            type,
            content,
          };
          messages = [...messages, message];
          setTimeout(() => {
            message.position = 320;
            messages = [...messages];
          }, 100);
          setTimeout(() => {
            simplePopup.remove(message.id);
          }, timeout);
        }
        break;
      default: {
        throw new Error(`Message of type '${type}' does not exist.`);
      }
    }
  };
</script>

<style type="text/scss" global>
  @import './simple-popup.scss';
</style>

<div class="simple-popup">
  {#each messages as message}
    <div id={message.id} class="message" style="right: {message.position}px;">
      <ToastNotification
        title={StringUtil.prettyName(message.type)}
        kind={message.type}
        lowContrast={true}
        caption={message.content}
        on:click={() => {
          simplePopup.remove(message.id);
        }} />
    </div>
  {/each}
</div>

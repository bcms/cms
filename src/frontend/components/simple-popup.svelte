<script context="module">
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
            message.position = 370;
            messages = [...messages];
          }, 100);
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
            message.position = 370;
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
  .simple-popup {
    position: fixed;
    bottom: 20px;
    right: -350px;
    width: 350px;
    font-size: 10pt;
    border: none;
    z-index: 1;
  }

  .simple-popup .message {
    transition: 0.4s;
    color: var(--c-white);
    width: 100%;
    margin-top: 10px;
    border-radius: 3px;
    position: relative;
    right: 370px;
  }

  .simple-popup .message:hover {
    cursor: pointer;
  }

  .toast {
    width: 100%;
    color: var(--c-black);
    padding: 20px;
    min-height: 80px;
  }

  .error {
    background-color: rgb(231, 179, 179);
    border-left: 4px solid var(--c-error);
  }

  .success {
    background-color: rgb(188, 231, 179);
    border-left: 4px solid var(--c-success);
  }

  .toast .type {
    display: flex;
  }

  .toast .type .text {
    font-size: 12pt;
    font-weight: bold;
    margin: auto 0 auto 10px;
  }

  .toast .type .icon {
    font-size: 16pt;
  }

  .error .type .icon {
    color: var(--c-error);
  }

  .success .type .icon {
    color: var(--c-success);
  }

  .toast .type .close {
    border: none;
    background-color: #0000;
    margin: auto 0 auto auto;
    font-size: 12pt;
  }

  .toast .content {
    margin-top: 20px;
  }
</style>

<div class="simple-popup">
  {#each messages as message}
    <div id={message.id} class="message" style="right: {message.position}px;">
      <div class="toast {message.type}">
        <div class="type">
          <span
            class="fas fa-{message.type === 'error' ? 'exclamation-circle' : 'check-circle'}
            icon" />
          <span class="text">{StringUtil.prettyName(message.type)}</span>
          <button
            class="fas fa-times close"
            on:click={() => {
              simplePopup.remove(message.id);
            }} />
        </div>
        <div class="content">{message.content}</div>
      </div>
    </div>
  {/each}
</div>

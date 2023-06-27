import * as uuid from 'uuid';
import { defineComponent, ref, onUnmounted } from 'vue';
import type {
  BCMSNotificationMessage,
  BCMSNotificationMessageType,
} from '../types';
import BCMSIcon from './icon';

const component = defineComponent({
  setup() {
    const notification = window.bcms.notification;
    const timeout = 8000;
    const notifUnreg = notification.register((type, content) => {
      const message: BCMSNotificationMessage = {
        id: uuid.v4(),
        type,
        content,
      };
      if (messages.value.find((e) => e.content === message.content)) {
        return;
      }
      setTimeout(() => {
        messages.value = messages.value.filter((e) => e.id !== message.id);
      }, timeout);
      messages.value = [...messages.value, message];
    });
    const messages = ref<BCMSNotificationMessage[]>([]);

    function messageTypeClass(type: BCMSNotificationMessageType) {
      switch (type) {
        case 'error': {
          return 'bg-error';
        }
        case 'success': {
          return 'bg-success';
        }
        case 'warning': {
          return 'bg-warning';
        }
      }
    }

    onUnmounted(() => {
      notifUnreg();
    });

    function getTypeIcon(type: BCMSNotificationMessageType) {
      switch (type) {
        case 'error': {
          return (
            <BCMSIcon
              src="/alert-triangle"
              class="w-6 h-6 flex-shrink-0 text-red fill-current"
            />
          );
        }
        case 'success': {
          return (
            <BCMSIcon
              src="/success"
              class="w-6 h-6 flex-shrink-0 text-green fill-current"
            />
          );
        }
        case 'warning': {
          return (
            <BCMSIcon
              src="/bell"
              class="w-6 h-6 flex-shrink-0 text-yellow fill-current stroke-current"
            />
          );
        }
      }
    }

    return () => {
      return (
        <div class="fixed z-[10000000] w-[90vw] top-[5px] left-1/2 -translate-x-1/2 md:min-w-[50vw] md:max-w-[700px] ">
          {messages.value.map((message) => {
            return (
              <div class="grid grid-cols-1 gap-2.5">
                <div
                  id={message.id}
                  class={`w-full flex items-center py-1 pl-6 pr-3 rounded-lg min-h-[48px] mb-2.5 ${messageTypeClass(
                    message.type,
                  )}`}
                >
                  {getTypeIcon(message.type)}
                  <p class="text-base leading-tight ml-4.5 relative top-0.5 text-dark">
                    {message.content}
                  </p>
                  <button
                    class="group p-3 ml-auto flex"
                    onClick={() => {
                      messages.value = messages.value.filter(
                        (e) => e.id !== message.id,
                      );
                    }}
                  >
                    <BCMSIcon
                      src="/close"
                      class="w-6 h-6 flex-shrink-0 text-dark fill-current stroke-current m-auto transition-colors duration-300 group-scope-hover:text-red group-scope-focus-visible:text-red"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    };
  },
});
export default component;

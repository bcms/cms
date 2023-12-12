import { defineComponent, type PropType } from 'vue';
import { BCMSIcon } from '../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { BCMSNotificationMessageType } from '../../../types';

const component = defineComponent({
  props: {
    type: {
      type: String as PropType<'error' | 'success' | 'warning'>,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  setup(props) {
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
        default: {
          return <></>;
        }
      }
    }

    return () => {
      return (
        <div className="flex items-center flex-wrap gap-4 mb-5">
          <div
            class={`w-full flex items-center py-1 pl-6 pr-3 rounded-lg min-h-[48px] mb-2.5 ${messageTypeClass(
              props.type,
            )}`}
          >
            {getTypeIcon(props.type)}
            <p class="text-base leading-tight ml-4.5 relative top-0.5 text-dark">
              {props.content}
            </p>
            <button class="group p-3 ml-auto flex" onClick={action('close')}>
              <BCMSIcon
                src="/close"
                class="w-6 h-6 flex-shrink-0 text-dark fill-current stroke-current m-auto transition-colors duration-300 group-scope-hover:text-red group-scope-focus-visible:text-red"
              />
            </button>
          </div>
        </div>
      );
    };
  },
});

export default component;

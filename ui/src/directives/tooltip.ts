import type { Directive } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { BCMSTooltipInput } from '../types';

const handlers: {
  [id: string]: {
    msg: string;
    enterCallback: (event: MouseEvent) => void;
    leaveCallback: (event: MouseEvent) => void;
  };
} = {};

export const tooltip: Directive<HTMLElement, BCMSTooltipInput> = {
  beforeUpdate(el, msg) {
    const msgString =
      typeof msg.value === 'string' ? msg.value : JSON.stringify(msg.value);
    const id = el.getAttribute('bcms-tooltip-id');
    if (id && handlers[id] && msgString !== handlers[id].msg) {
      el.removeEventListener('mouseenter', handlers[id].enterCallback);
      handlers[id].enterCallback = () => {
        window.bcms.tooltip.show(
          el,
          typeof msg.value === 'string' ? msg.value : msg.value.msg,
          typeof msg.value === 'string' ? 'default' : msg.value.type
        );
      };
      el.addEventListener('mouseenter', handlers[id].enterCallback);
    }
  },
  beforeMount(el, msg) {
    const id = uuidv4();
    el.setAttribute('bcms-tooltip-id', id);

    handlers[id] = {
      msg:
        typeof msg.value === 'string' ? msg.value : JSON.stringify(msg.value),
      enterCallback: () => {
        if (msg.value) {
          window.bcms.tooltip.show(
            el,
            typeof msg.value === 'string' ? msg.value : msg.value.msg,
            typeof msg.value === 'string' ? 'default' : msg.value.type
          );
        }
      },
      leaveCallback: () => {
        window.bcms.tooltip.hide();
      },
    };

    el.addEventListener('mouseenter', handlers[id].enterCallback);
    el.addEventListener('mouseleave', handlers[id].leaveCallback);
    el.addEventListener('click', handlers[id].leaveCallback);
  },
  unmounted(el) {
    const id = el.getAttribute('bcms-tooltip-id');
    if (id) {
      el.removeEventListener('mouseenter', handlers[id].enterCallback);
      el.removeEventListener('mouseleave', handlers[id].leaveCallback);
      el.removeEventListener('click', handlers[id].leaveCallback);
    }
  },
};

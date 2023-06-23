import type { BCMSModalService, BCMSModalServiceExtended } from '../types';
import { v4 as uuidv4 } from 'uuid';

let service: BCMSModalService;

function modalNotImplemented(): {
  hide(): void;
  show(): void;
  subscribe(eventName: string, handler: (event: Event) => void): () => void;
  triggerEvent(eventName: string, event: Event): void;
} {
  const subs: {
    [name: string]: {
      [id: string]: (event: Event) => void;
    };
  } = {};

  return {
    hide() {
      console.error('Not implemented');
    },
    show() {
      console.error('Not implemented');
    },
    subscribe(eventName, handler) {
      const id = uuidv4();
      if (!subs[eventName]) {
        subs[eventName] = {};
      }
      subs[eventName][id] = handler;
      return () => {
        delete subs[eventName][id];
      };
    },
    triggerEvent(eventName, event) {
      if (subs[eventName]) {
        for (const id in subs[eventName]) {
          subs[eventName][id](event);
        }
      }
    },
  };
}

export function useBcmsModalService<
  CustomModals = undefined
>(): BCMSModalServiceExtended<CustomModals> {
  return service as BCMSModalServiceExtended<CustomModals>;
}

export function createBcmsModalService(): void {
  const escHandlers: Array<() => void> = [];
  window.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      const fn = escHandlers.pop();
      if (fn) {
        fn();
      }
    }
  });
  service = {
    register(data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const self = service as BCMSModalServiceExtended<any>;

      if (!self.custom) {
        self.custom = {};
      }

      self.custom[data.name] = modalNotImplemented();
    },
    escape: {
      register(handler) {
        const index = escHandlers.push(handler) - 1;
        let latch = false;
        return () => {
          if (latch) {
            return;
          }
          latch = true;
          escHandlers.splice(index, 1);
        };
      },
    },
    confirm: modalNotImplemented(),
    media: {
      addUpdateDir: modalNotImplemented(),
      upload: modalNotImplemented(),
      picker: modalNotImplemented(),
    },
    entry: {
      viewModel: modalNotImplemented(),
      status: modalNotImplemented(),
    },
    props: {
      add: modalNotImplemented(),
      edit: modalNotImplemented(),
      viewEntryPointer: modalNotImplemented(),
    },
    whereIsItUsed: modalNotImplemented(),
    showDescriptionExample: modalNotImplemented(),
    addUpdate: {
      group: modalNotImplemented(),
      template: modalNotImplemented(),
      widget: modalNotImplemented(),
    },
    content: {
      link: modalNotImplemented(),
      widget: modalNotImplemented(),
    },
    templateOrganizer: {
      create: modalNotImplemented(),
    },
    apiKey: {
      addUpdate: modalNotImplemented(),
    },
    settings: {
      view: modalNotImplemented(),
    },
    multiSelect: modalNotImplemented(),
    backup: modalNotImplemented(),
  };
}

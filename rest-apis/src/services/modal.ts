import { v4 as uuidv4 } from 'uuid';

export interface ModalOnDone<OutputData> {
  (data: OutputData): void | Promise<void>;
}

export interface ModalOnCancel {
  (): void | Promise<void>;
}

export interface ModalInputDefaults<OutputData = void> {
  title?: string;
  onDone?: ModalOnDone<OutputData>;
  onCancel?: ModalOnCancel;
}

export interface ModalServiceItem<
  OutputData,
  InputData extends ModalInputDefaults<OutputData>
> {
  show(data: InputData): void;
  hide(): void;
  subscribe?(eventName: string, handler: (event: Event) => void): () => void;
  triggerEvent?(eventName: string, event: Event): void;
  onShow(data: InputData): void;
}

function modalNotImplemented<
  OutputData = void,
  InputData extends ModalInputDefaults<OutputData> = ModalInputDefaults<OutputData>
>(): ModalServiceItem<OutputData, InputData> {
  const subs: {
    [name: string]: Array<{ id: string; handler: (event: Event) => void }>;
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
        subs[eventName] = [];
      }
      subs[eventName].push({ id, handler });
      return () => {
        for (let i = 0; i < subs[eventName].length; i++) {
          const sub = subs[eventName][i];
          if (sub.id === id) {
            subs[eventName].splice(i, 1);
            break;
          }
        }
      };
    },
    triggerEvent(eventName, event) {
      if (subs[eventName]) {
        for (let i = 0; i < subs[eventName].length; i++) {
          const sub = subs[eventName][i];
          sub.handler(event);
        }
      }
    },
    onShow() {
      // Do nothing
    },
  };
}

export const ModalService = {
  addServer: modalNotImplemented<string>(),
};

export type ModalServiceType = typeof ModalService;

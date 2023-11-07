import { defineComponent, ref } from 'vue';
import { createModalCancelFn, createModalDoneFn, Modal } from './_wrapper';
import { ModalInputDefaults, ModalService } from '../../services';
import { BCMSTextInput } from '@ui/components';

let done = createModalDoneFn(() => {
  // Do nothing
});
let cancel = createModalCancelFn(() => {
  // Do nothing
});

export const AddServerModal = defineComponent({
  setup() {
    const data = ref<
      ModalInputDefaults<string> & {
        url: string;
      }
    >({
      title: 'Add server',
      url: '',
    });

    ModalService.addServer.onShow = (event) => {
      done = () => {
        if (event.onDone) {
          event.onDone(data.value.url);
        }
      };
      cancel = () => {
        if (event.onCancel) {
          event.onCancel();
        }
      };
      data.value = { ...event, url: '' };
    };

    return () => (
      <Modal
        modalName="addServer"
        title={data.value.title || 'Add Server'}
        onDone={() => {
          if (done) {
            done();
            return true;
          }
          return false;
        }}
        onCancel={() => {
          if (cancel) {
            cancel();
          }
        }}
        doneText="Done"
      >
        <BCMSTextInput
          label="Server Origin"
          placeholder="https://bcms.mydomain.com"
          value={data.value.url}
          onInput={(value) => {
            data.value.url = value;
          }}
        />
      </Modal>
    );
  },
});

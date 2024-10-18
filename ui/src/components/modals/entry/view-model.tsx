import { defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@bcms/selfhosted-ui/components/modals/_wrapper';
import { CodeEditor } from '@bcms/selfhosted-ui/components/inputs/code-editor';

export interface ModalEntryViewModelInput {
    entryId: string;
    templateId: string;
}

export const ModalEntryViewModel = defineComponent({
    props: getModalDefaultProps<ModalEntryViewModelInput, undefined>(),
    setup(props) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;

        const data = ref<ModalEntryViewModelInput>({
            entryId: '',
            templateId: '',
        });
        const tab = ref<'parsed' | 'raw'>('parsed');
        const code = ref('');

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                tab.value = 'parsed';
                data.value.entryId = '';
                if (event?.data) {
                    data.value = event.data;
                }
                if (data.value.entryId) {
                    throwable(
                        async () => {
                            return await sdk.entry.getParsed({
                                entryId: data.value.entryId,
                                templateId: data.value.templateId,
                            });
                        },
                        async (entry) => {
                            code.value = JSON.stringify(entry, null, 4);
                        },
                    ).catch((err) => console.error(err));
                }
            };
            handler._onDone = async () => {
                return [true, undefined];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        return () => (
            <ModalWrapper
                title={'View entry model'}
                handler={props.handler}
                footer={() => <div></div>}
            >
                <div>
                    <CodeEditor value={code.value} />
                    {/*<pre>{JSON.stringify(code.value || {}, null, 4)}</pre>*/}
                </div>
            </ModalWrapper>
        );
    },
});

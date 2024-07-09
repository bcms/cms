import { defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@thebcms/selfhosted-ui/components/modals/_wrapper';
import {
    createRefValidator,
    createValidationItem,
} from '@thebcms/selfhosted-ui/util/validation';
import { TextInput } from '@thebcms/selfhosted-ui/components/inputs/text';
import { StringUtility } from '@thebcms/selfhosted-utils/string-utility';
import { Select } from '@thebcms/selfhosted-ui/components/inputs/select/main';
import { SelectEntryPointer } from '@thebcms/selfhosted-ui/components/inputs/select/entry-pointer';
import { MediaSelect } from '@thebcms/selfhosted-ui/components/inputs/select/media';

type LinkType = 'url' | 'entry' | 'media';

export const linkSplitChar = '@*_';

export interface ModalEntryContentLindEditInput {
    href: string;
}

export interface ModalEntryContentLindEditOutput {
    href: string;
}

export const ModalEntryContentLinkEdit = defineComponent({
    props: getModalDefaultProps<
        ModalEntryContentLindEditInput,
        ModalEntryContentLindEditOutput
    >(),
    setup(props) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;

        const data = ref<ModalEntryContentLindEditInput>({
            href: '',
        });
        const inputs = ref(getInputs('url', {}));
        const inputsValid = createRefValidator(inputs);

        function getInputs(
            type: LinkType,
            info: {
                url?: string;
                entry?: {
                    eid: string;
                    tid: string;
                };
                mediaId?: string;
            },
        ) {
            return {
                type: createValidationItem<LinkType>({
                    value: type,
                }),
                url: createValidationItem({
                    value: info.url || '',
                }),
                entry: createValidationItem({
                    value: info.entry
                        ? info.entry
                        : {
                              eid: '',
                              tid: '',
                          },
                }),
                mediaId: createValidationItem({
                    value: info.mediaId || '',
                }),
            };
        }

        function inputsToLink(): string {
            switch (inputs.value.type.value) {
                case 'url': {
                    return inputs.value.url.value;
                }
                case 'media': {
                    if (inputs.value.mediaId.value) {
                        return `media:${inputs.value.mediaId.value}${linkSplitChar}${linkSplitChar}:media`;
                    }
                    return '';
                }
                case 'entry': {
                    if (inputs.value.entry.value.eid) {
                        return `entry:${inputs.value.entry.value.eid}${linkSplitChar}${inputs.value.entry.value.tid}:entry`;
                    }
                    return '';
                }
            }
        }

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                if (event?.data) {
                    data.value = event.data;
                    throwable(
                        async () => {
                            await sdk.entry.getAllLite();
                            await sdk.media.getAll();
                        },
                        async () => {
                            if (
                                data.value.href.startsWith('entry:') &&
                                data.value.href.endsWith(':entry')
                            ) {
                                const [eid, tid] = StringUtility.textBetween(
                                    data.value.href,
                                    'entry:',
                                    ':entry',
                                ).split(linkSplitChar);
                                inputs.value = getInputs('entry', {
                                    entry: {
                                        eid,
                                        tid,
                                    },
                                });
                            } else if (
                                data.value.href.startsWith('media:') &&
                                data.value.href.endsWith(':media')
                            ) {
                                const [mediaId] = StringUtility.textBetween(
                                    data.value.href,
                                    'media:',
                                    ':media',
                                ).split(linkSplitChar);
                                inputs.value = getInputs('media', {
                                    mediaId,
                                });
                            } else {
                                inputs.value = getInputs('url', {});
                            }
                        },
                    ).catch((err) => console.error(err));
                    data.value = event.data;
                }
            };
            handler._onDone = async () => {
                if (!inputsValid()) {
                    return [false, { href: '' }];
                }
                return [true, { href: inputsToLink() }];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        function getActiveSection(type: LinkType) {
            switch (type) {
                case 'url': {
                    return (
                        <TextInput
                            label={`URL`}
                            value={inputs.value.url.value}
                            placeholder={`ex. https://youtube.com`}
                            focus
                            onInput={(value) => {
                                inputs.value.url.value = value;
                            }}
                        />
                    );
                }
                case 'entry': {
                    return (
                        <SelectEntryPointer
                            selected={inputs.value.entry.value.eid}
                            error={inputs.value.entry.error}
                            onChange={(entry) => {
                                if (
                                    inputs.value.entry.value.eid === entry._id
                                ) {
                                    inputs.value.entry.value = {
                                        eid: '',
                                        tid: '',
                                    };
                                } else {
                                    inputs.value.entry.value = {
                                        eid: entry._id,
                                        tid: entry.templateId,
                                    };
                                }
                            }}
                        />
                    );
                }
                case 'media': {
                    return (
                        <MediaSelect
                            label={`Media file`}
                            mediaId={inputs.value.mediaId.value}
                            error={inputs.value.mediaId.error}
                            onChange={(event) => {
                                inputs.value.mediaId.value =
                                    event?.media._id || '';
                            }}
                        />
                    );
                }
            }
            return '';
        }

        return () => (
            <ModalWrapper
                title={'Edit link'}
                handler={props.handler}
                doneText={'Update'}
            >
                <div class={`flex flex-col gap-4`}>
                    <Select
                        label={`Link type`}
                        selected={inputs.value.type.value}
                        options={[
                            {
                                label: 'URL',
                                value: 'url',
                            },
                            {
                                label: 'Entry pointer',
                                value: 'entry',
                            },
                            {
                                label: 'Media pointer',
                                value: 'media',
                            },
                        ]}
                        onChange={(option) => {
                            if (option) {
                                inputs.value.type.value =
                                    option.value as LinkType;
                            }
                        }}
                    />
                    {getActiveSection(inputs.value.type.value)}
                </div>
            </ModalWrapper>
        );
    },
});

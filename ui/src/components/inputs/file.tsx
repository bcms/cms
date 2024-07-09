import { defineComponent, onMounted, type PropType, ref } from 'vue';
import {DefaultComponentProps} from "@thebcms/selfhosted-ui/components/default";
import {Icon} from "@thebcms/selfhosted-ui/components/icon";
import {prettyFileSize} from "@thebcms/selfhosted-ui/util/file";
import {Dropdown} from "@thebcms/selfhosted-ui/components/dropdown";

export interface FileInputListItem {
    id: string;
    file: File;
    name: string;
    src?: string;
    altText?: string;
    caption?: string;
    progress?: number;
}

export const FileInput = defineComponent({
    props: {
        ...DefaultComponentProps,
        withAuth: Boolean,
        name: String,
        src: String,
        placeholder: String,
        accept: String,
        label: String,
        list: Array as PropType<FileInputListItem[]>,
    },
    emits: {
        input: (_files: File[]) => {
            return true;
        },
        removeListItem: (_item: FileInputListItem) => {
            return true;
        },
        editListItem: (_item: FileInputListItem) => {
            return true;
        },
    },
    setup(props, ctx) {
        const sdk = window.bcms.sdk;
        const loading = ref(false);

        onMounted(async () => {
            if (props.withAuth) {
                await sdk.isLoggedIn();
            }
            loading.value = true;
        });

        return () => (
            <div>
                <label
                    id={props.id}
                    style={props.style}
                    class={`relative ${props.class || ''}`}
                >
                    {props.label && (
                        <div class="font-normal not-italic text-xs leading-normal tracking-0.06 uppercase select-none mb-1.25 block">
                            {props.label}
                        </div>
                    )}
                    <div class="flex items-center justify-center">
                        <div class="group w-full flex p-2.5 rounded-3.5 border border-gray dark:border-darkGray bg-white dark:bg-gray cursor-pointer">
                            {props.name || props.src ? (
                                <div class="flex items-center text-dark text-sm leading-tight flex-grow text-left h-20">
                                    {loading.value && props.src && (
                                        <div class="flex mr-5 flex-shrink-0 w-20 h-20">
                                            <img
                                                class="w-full h-full object-cover fill-current rounded-2.5 text-grey"
                                                src={props.src}
                                                alt="Logo"
                                            />
                                        </div>
                                    )}
                                    <div class="flex flex-col items-start justify-center">
                                        <div class="font-medium text-base leading-normal text-left line-clamp-2 -tracking-0.01 text-brand-700 group-hover:underline">
                                            {props.name && (
                                                <>
                                                    {props.name} <br />
                                                </>
                                            )}
                                            Select another file
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div class="flex flex-grow">
                                    <div class="font-medium text-base leading-normal text-center -tracking-0.01 w-full self-center text-brand-700 group-hover:underline py-4 px-6">
                                        {props.placeholder || (
                                            <div
                                                class={`flex flex-col gap-2 items-center`}
                                            >
                                                <div
                                                    class={`p-[10px] rounded-2.5 border border-gray-200 shadow`}
                                                >
                                                    <Icon
                                                        src={'/plus'}
                                                        class={`text-dark dark:text-white fill-current w-4 h-4 `}
                                                    />
                                                </div>
                                                <div
                                                    class={`text-black font-normal`}
                                                >
                                                    <span
                                                        class={`font-medium text-brand-600`}
                                                    >
                                                        Click to upload
                                                    </span>{' '}
                                                    or drag and drop a file
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <input
                        class="sr-only absolute top-0 left-0 w-full h-full"
                        type="file"
                        accept={props.accept}
                        multiple
                        onChange={(event) => {
                            const target = event.target as HTMLInputElement;

                            if (target.files && target.files.length > 0) {
                                const files: File[] = [];
                                for (let i = 0; i < target.files.length; i++) {
                                    files.push(target.files[i]);
                                }
                                ctx.emit('input', files);
                            }
                        }}
                    />
                </label>
                {props.list && props.list.length > 0 ? (
                    <div class={`flex flex-col gap-2 mt-2`}>
                        {props.list.map((item) => {
                            return (
                                <div
                                    class={`flex gap-2 p-4 bg-light dark:bg-gray rounded-2.5 border border-gray dark:border-gray/50`}
                                >
                                    <div
                                        class={`flex items-center justify-center w-10 h-10 rounded-2.5 overflow-hidden my-auto flex-shrink-0`}
                                    >
                                        {item.src ? (
                                            <img
                                                class={`object-cover w-full h-full`}
                                                src={item.src}
                                                alt={item.file.name}
                                            />
                                        ) : (
                                            <Icon
                                                class={`w-5 h-5 text-dark dark:text-white fill-current`}
                                                src={'/file'}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <div>{item.file.name}</div>
                                        <div>
                                            {prettyFileSize(item.file.size)}
                                        </div>
                                        {typeof item.progress === 'number' && (
                                            <div
                                                class={`w-full h-2 bg-gray-200 rounded-full overflow-hidden`}
                                            >
                                                <div
                                                    style={`width: ${item.progress}%;`}
                                                    class={`h-2 bg-green dark:bg-yellow`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        class={`flex flex-col items-end justify-center h-full ml-auto`}
                                    >
                                        <Dropdown
                                            items={[
                                                {
                                                    text: 'Edit',
                                                    icon: '/edit-03',
                                                    border: true,
                                                    onClick() {
                                                        // ModalService.mediaEditFile.show(
                                                        //     {
                                                        //         name: item.file
                                                        //             .name,
                                                        //         altText:
                                                        //             item.altText ||
                                                        //             '',
                                                        //         caption:
                                                        //             item.caption ||
                                                        //             '',
                                                        //         onDone(data) {
                                                        //             ctx.emit(
                                                        //                 'editListItem',
                                                        //                 {
                                                        //                     ...item,
                                                        //                     ...data,
                                                        //                 },
                                                        //             );
                                                        //         },
                                                        //     },
                                                        // );
                                                    },
                                                },
                                                {
                                                    text: 'Remove',
                                                    icon: '/trash-01',
                                                    danger: true,
                                                    onClick() {
                                                        ctx.emit(
                                                            'removeListItem',
                                                            item,
                                                        );
                                                    },
                                                },
                                            ]}
                                        />
                                        {typeof item.progress === 'number' && (
                                            <div class={`mt-auto`}>
                                                {item.progress}%
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    ''
                )}
            </div>
        );
    },
});

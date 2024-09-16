import { computed, defineComponent, onMounted, type PropType } from 'vue';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import { Tag } from '@thebcms/selfhosted-ui/components/tag';
import {
    Dropdown,
    type DropdownItem,
} from '@thebcms/selfhosted-ui/components/dropdown';
import { confirm } from '@thebcms/selfhosted-ui/services/confirm';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import type { Backup } from '@thebcms/selfhosted-backend/backup/models/main';
import { downloadBuffer } from '@thebcms/selfhosted-ui/util/download';
import { millisToDateString } from '@thebcms/selfhosted-ui/util/date';

export const BackupListItem = defineComponent({
    props: {
        backup: {
            type: Object as PropType<Backup>,
            required: true,
        },
    },
    setup(props) {
        const sdk = window.bcms.sdk;
        const notification = window.bcms.notification;
        const throwable = window.bcms.throwable;

        function dropdownItem(
            title: string,
            description: string,
            titleClass?: string,
            descriptionClass?: string,
        ) {
            return (
                <div class={`flex flex-col gap-2 text-left`}>
                    <div class={`font-medium ${titleClass || ''}`}>{title}</div>
                    <div class={`text-xs ${descriptionClass || 'text-gray'}`}>
                        {description}
                    </div>
                </div>
            );
        }

        const dropdownOptions: DropdownItem[] = [
            {
                text: dropdownItem(
                    'Download',
                    `Download currently selected backup as a .zip file`,
                ),
                icon: '/edit-03',
                async onClick() {
                    await throwable(async () => {
                        downloadBuffer({
                            data: await sdk.backup.download(props.backup._id),
                            mimetype: 'application/zip',
                            filename:
                                'bcms_backup_' + props.backup.name + '.zip',
                        });
                    });
                },
            },
            {
                text: dropdownItem(
                    'Remove',
                    'Delete file from the server',
                    undefined,
                    'text-darkGray',
                ),
                icon: '/trash',
                danger: true,
                async onClick() {
                    if (
                        await confirm(
                            'Remove backup',
                            'Are you sure that you want to delete the backup? This action is irreversible.',
                        )
                    ) {
                        await throwable(
                            async () => {
                                await sdk.backup.deleteById(props.backup._id);
                            },
                            async () => {
                                notification.success(
                                    'Backup successfully removed',
                                );
                            },
                        );
                    }
                },
            },
        ];

        return () => (
            <li
                class={`flex flex-col xs:flex-row gap-4 items-center px-5 py-3 rounded-2.5 border bg-white border-gray/50 dark:bg-darkGray`}
            >
                <div class={`text-sm font-bold`}>{props.backup.name}</div>
                <div class={`text-xs`}>
                    {millisToDateString(props.backup.createdAt)}
                </div>
                <div class={`flex gap-2 items-center xs:ml-auto`}>
                    <Tag>
                        {props.backup.inQueue
                            ? 'Queue'
                            : props.backup.ready
                            ? 'Ready'
                            : 'Waiting'}
                    </Tag>
                </div>
                {props.backup.ready && <Dropdown items={dropdownOptions} />}
            </li>
        );
    },
});

export const BackupList = defineComponent({
    props: {
        ...DefaultComponentProps,
    },
    setup(props) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const notification = window.bcms.notification;
        const modal = window.bcms.modalService;

        const backups = computed(() =>
            sdk.store.backup.items().sort((a, b) => b.createdAt - a.createdAt),
        );

        onMounted(async () => {
            await throwable(async () => {
                await sdk.user.getAll();
                await sdk.backup.getAll();
            });
        });

        function list() {
            return (
                <ul class={`flex flex-col gap-3 mt-8`}>
                    {backups.value.length === 0 ? (
                        <li>There are no backups yet</li>
                    ) : (
                        <>
                            {backups.value.map((user) => {
                                return <BackupListItem backup={user} />;
                            })}
                        </>
                    )}
                </ul>
            );
        }

        return () => (
            <div id={props.id} style={props.style} class={props.class}>
                <div class={`flex gap-4 items-center`}>
                    <div class={`text-3xl`}>Backups</div>
                    <div class={`ml-auto flex gap-2 items-center`}>
                        <Button
                            kind={`ghost`}
                            onClick={async () => {
                                modal.handlers.backupRestore.open();
                            }}
                        >
                            Restore
                        </Button>
                        <Button
                            onClick={async () => {
                                await throwable(
                                    async () => {
                                        await sdk.backup.create();
                                    },
                                    async () => {
                                        notification.success(
                                            'Backup creation started',
                                        );
                                    },
                                );
                            }}
                        >
                            Create new backup
                        </Button>
                    </div>
                </div>
                {list()}
            </div>
        );
    },
});

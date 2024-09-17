import { computed, defineComponent, onMounted } from 'vue';
import { UserList } from '@bcms/selfhosted-ui/components/user-list';
import { BackupList } from '@bcms/selfhosted-ui/components/backup-list';
import {
    Select,
    type SelectOption,
} from '@bcms/selfhosted-ui/components/inputs/select/main';
import { Languages } from '@bcms/selfhosted-ui/data/language';
import { Icon } from '@bcms/selfhosted-ui/components/icon';
import type { Language } from '@bcms/selfhosted-backend/language/models/main';

export const SettingsView = defineComponent({
    setup() {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const notification = window.bcms.notification;
        const confirm = window.bcms.confirm;

        const languages = computed(() => sdk.store.language.items());
        const languageOptions = computed<SelectOption[]>(() => {
            const output: SelectOption[] = [];
            const isoLngs = Languages.toArray();
            for (let i = 0; i < isoLngs.length; i++) {
                const isoLng = isoLngs[i];
                if (!languages.value.find((e) => e.code === isoLng.code)) {
                    output.push({
                        label: isoLng.name + ' - ' + isoLng.nativeName,
                        value: isoLng.code,
                        slot: () => (
                            <div class={`flex items-center gap-4`}>
                                <img
                                    class={`w-6 h-6 rounded-full`}
                                    src={`/assets/flags/${isoLng.code}.jpg`}
                                    alt={isoLng.name}
                                />
                                <div>{isoLng.name}</div>
                                <div class={`ml-auto text-gray-400 truncate`}>
                                    {isoLng.nativeName}
                                </div>
                            </div>
                        ),
                    });
                }
            }
            return output;
        });

        onMounted(async () => {
            await throwable(async () => {
                await sdk.language.getAll();
            });
        });

        async function addLanguage(code: string) {
            const isoLng = Languages.toArray().find((e) => e.code === code);
            if (!isoLng) {
                notification.error(
                    `Failed to find language with code "${code}"`,
                );
                return;
            }
            await throwable(
                async () => {
                    await sdk.language.create({
                        code: isoLng.code,
                        name: isoLng.name,
                        nativeName: isoLng.nativeName,
                    });
                },
                async () => {
                    notification.success('Notification created successfully');
                },
            );
        }
        async function removeLanguage(lngId: string) {
            if (
                !(await confirm(
                    'Delete language',
                    'Are you sure you want to' + ' delete this language?',
                ))
            ) {
                return;
            }
            await throwable(
                async () => {
                    await sdk.language.deleteById({
                        languageId: lngId,
                    });
                },
                async () => {
                    notification.success('Language deleted successfully');
                },
            );
        }

        function lngCard(lng: Language) {
            return (
                <div
                    class={`relative flex flex-col gap-2 items-center justify-center px-7 py-6 border border-gray rounded-2xl bg-light dark:bg-darkGray`}
                >
                    <img
                        class={`w-6 rounded-full`}
                        src={`/assets/flags/${lng.code}.jpg`}
                        alt={lng.name}
                    />
                    <div class={`text-xs uppercase`}>{lng.name}</div>
                    {lng.code !== 'en' && (
                        <button
                            class={`absolute top-2 right-2`}
                            onClick={async () => {
                                await removeLanguage(lng._id);
                            }}
                        >
                            <Icon
                                class={`w-5 h-5 text-dark dark:text-white hover:text-red dark:hover:text-red fill-current`}
                                src={'/close'}
                            />
                        </button>
                    )}
                </div>
            );
        }

        return () => (
            <div class={`flex flex-col gap-10 max-w-[640px]`}>
                <h1 class={`font-medium text-xl`}>Settings</h1>
                <div class={`flex flex-col gap-2`}>
                    <div class={`flex gap-2`}>
                        <div class={`text-2xl`}>Languages</div>
                    </div>
                    <div class={`flex flex-col gap-2`}>
                        <div class={`flex flex-wrap gap-3`}>
                            {languages.value.map((lng) => {
                                return lngCard(lng);
                            })}
                        </div>
                        <div>
                            <Select
                                searchable
                                options={languageOptions.value}
                                placeholder="Add language"
                                onChange={async (option) => {
                                    if (option) {
                                        await addLanguage(option.value);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
                <UserList />
                <BackupList />
            </div>
        );
    },
});
export default SettingsView;

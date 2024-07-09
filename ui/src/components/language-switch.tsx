import { computed, defineComponent, onMounted } from 'vue';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import type { Language } from '@thebcms/selfhosted-backend/language/models/main';
import { Select } from '@thebcms/selfhosted-ui/components/inputs/select/main';

export const LanguageSwitch = defineComponent({
    props: {
        ...DefaultComponentProps,
        fixed: Boolean,
    },
    emits: {
        change: (_lng: Language) => {
            return true;
        },
    },
    setup(props, ctx) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const [lng, setLng] = window.bcms.useLanguage();

        const lngs = computed(() => sdk.store.language.items());

        onMounted(async () => {
            await throwable(async () => {
                await sdk.language.getAll();
            });
        });

        return () => (
            <Select
                id={props.id}
                style={props.style}
                class={props.class}
                fixed={props.fixed}
                placeholder="Change a language"
                selected={lng.value}
                options={lngs.value.map((item) => {
                    return {
                        label: item.name,
                        slot: () => (
                            <div class={`flex items-center gap-4`}>
                                <img
                                    class={`w-6 h-6 rounded-full`}
                                    src={`/assets/flags/${item.code}.jpg`}
                                    alt={item.name}
                                />
                                <div>{item.name}</div>
                                <div class={`text-gray`}>{item.nativeName}</div>
                            </div>
                        ),
                        value: item.code,
                    };
                })}
                onChange={(option) => {
                    if (option) {
                        const targetLng = lngs.value.find(
                            (e) => e.code === option.value,
                        );
                        if (targetLng && targetLng.code !== lng.value) {
                            setLng(targetLng.code);
                            ctx.emit('change', targetLng);
                        }
                    }
                }}
            />
        );
    },
});

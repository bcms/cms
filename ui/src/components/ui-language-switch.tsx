import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { DefaultComponentProps } from '@bcms/selfhosted-ui/components/default';
import {
    getUiLanguage,
    setUiLanguage,
    UI_LANGUAGES,
} from '@bcms/selfhosted-ui/i18n';

export const UiLanguageSwitch = defineComponent({
    props: {
        ...DefaultComponentProps,
    },
    setup(props) {
        const { t } = useI18n();

        return () => (
            <div
                id={props.id}
                style={props.style}
                class={`inline-flex items-center rounded-full border border-gray dark:border-darkGray bg-white/70 dark:bg-dark/70 p-1 text-sm ${
                    props.class || ''
                }`}
            >
                {UI_LANGUAGES.map((language) => {
                    const active = getUiLanguage() === language;
                    return (
                        <button
                            type={'button'}
                            aria-pressed={active}
                            class={`px-3 py-1 rounded-full transition-colors duration-200 ${
                                active
                                    ? 'bg-green text-white dark:bg-yellow dark:text-dark'
                                    : 'text-darkGray dark:text-gray hover:text-dark dark:hover:text-white'
                            }`}
                            onClick={() => {
                                setUiLanguage(language);
                            }}
                        >
                            {t(
                                language === 'zh-CN'
                                    ? 'language.zhCN'
                                    : 'language.en',
                            )}
                        </button>
                    );
                })}
            </div>
        );
    },
});

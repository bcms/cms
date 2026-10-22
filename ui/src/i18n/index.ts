import { createI18n } from 'vue-i18n';
import { en } from '@bcms/selfhosted-ui/i18n/locales/en';
import { zhCN } from '@bcms/selfhosted-ui/i18n/locales/zh-CN';

export const UI_LANGUAGES = ['en', 'zh-CN'] as const;

export type UiLanguage = (typeof UI_LANGUAGES)[number];

export const UI_LANGUAGE_STORAGE_KEY = '__ui_language';

export function isUiLanguage(value: unknown): value is UiLanguage {
    return value === 'en' || value === 'zh-CN';
}

function readStoredLanguage(): string | null {
    try {
        return localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);
    } catch {
        return null;
    }
}

function writeStoredLanguage(language: UiLanguage): void {
    try {
        localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, language);
    } catch {
        // Ignore private mode or storage quota errors.
    }
}

export function detectUiLanguage(): UiLanguage {
    const stored = readStoredLanguage();
    if (isUiLanguage(stored)) {
        return stored;
    }
    const navigatorLanguage = (
        navigator.languages?.[0] ||
        navigator.language ||
        'en'
    ).toLowerCase();
    return navigatorLanguage.startsWith('zh') ? 'zh-CN' : 'en';
}

export const i18n = createI18n({
    legacy: false,
    locale: detectUiLanguage(),
    fallbackLocale: 'en',
    messages: {
        en,
        'zh-CN': zhCN,
    },
    missingWarn: import.meta.env.DEV,
    fallbackWarn: false,
    pluralizationRules: {
        'zh-CN': () => 0,
    },
});

export function getUiLanguage(): UiLanguage {
    return i18n.global.locale.value as UiLanguage;
}

export function setUiLanguage(language: UiLanguage): void {
    i18n.global.locale.value = language;
    writeStoredLanguage(language);
    document.documentElement.lang = language;
    // The head meta service is created after this module is imported, so guard
    // the access and refresh the current title once it becomes available.
    (window as unknown as { bcms?: { meta?: { refresh?(): void } } }).bcms?.meta?.refresh?.();
}

/**
 * Translate outside of a component setup scope.
 * In TSX components prefer `const { t } = useI18n()` so locale changes trigger
 * a re-render automatically.
 */
export function t(
    key: string,
    named?: Record<string, unknown>,
    plural?: number,
): string {
    return (i18n.global.t as any)(key, named ?? {}, plural) as string;
}

document.documentElement.lang = getUiLanguage();

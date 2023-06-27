import {
  apiErrorsApiKeyTranslationsEn,
  apiErrorsAuthTranslationsEn,
  apiErrorsBackupTranslationsEn,
  apiErrorsChangesTranslationsEn,
  apiErrorsColorTranslationsEn,
  apiErrorsEntryTranslationsEn,
  apiErrorsFunctionTranslationsEn,
  apiErrorsGeneralTranslationsEn,
  apiErrorsGroupTranslationsEn,
  apiErrorsLanguageTranslationsEn,
  apiErrorsMediaTranslationsEn,
  apiErrorsStatusTranslationsEn,
  apiErrorsTagTranslationsEn,
  apiErrorsTemplateTranslationsEn,
  apiErrorsTempOrgTranslationsEn,
  apiErrorTemplateTranslationsResolved,
  apiErrorsTypeConverterTranslationsEn,
  apiErrorsUserTranslationsEn,
  apiErrorsWidgetTranslationsEn,
} from './api-errors';
import { inputTranslationsEn } from './input';
import { layoutTranslationsEn } from './layout';
import { modalTranslationsEn } from './modal';
import { pageTranslationsEn } from './pages';
import { propTranslationsEn } from './prop';

type BCMSUILanguages = 'en' | 'de';

const EnTranslations = {
  modal: modalTranslationsEn,
  layout: layoutTranslationsEn,
  page: pageTranslationsEn,
  input: inputTranslationsEn,
  prop: propTranslationsEn,
  apiError: {
    ...apiErrorsApiKeyTranslationsEn,
    ...apiErrorsAuthTranslationsEn,
    ...apiErrorsBackupTranslationsEn,
    ...apiErrorsChangesTranslationsEn,
    ...apiErrorsColorTranslationsEn,
    ...apiErrorsEntryTranslationsEn,
    ...apiErrorsFunctionTranslationsEn,
    ...apiErrorsGeneralTranslationsEn,
    ...apiErrorsGroupTranslationsEn,
    ...apiErrorsLanguageTranslationsEn,
    ...apiErrorsMediaTranslationsEn,
    ...apiErrorsStatusTranslationsEn,
    ...apiErrorsTagTranslationsEn,
    ...apiErrorsTempOrgTranslationsEn,
    ...apiErrorsTemplateTranslationsEn,
    ...apiErrorsTypeConverterTranslationsEn,
    ...apiErrorsUserTranslationsEn,
    ...apiErrorsWidgetTranslationsEn,
  },
};
type TranslationsType = typeof EnTranslations;

const Root: {
  [lng: string]: any;
} = {
  en: EnTranslations,
};

export function useTranslation(): TranslationsType {
  const lng: BCMSUILanguages = 'en';
  return Root[lng || 'en'];
}

export function apiErrorTranslation(
  code: string,
  originalMessage: string
): string | null {
  if (code.startsWith('tmp')) {
    return apiErrorTemplateTranslationsResolved(code, originalMessage);
  }

  return null;
}

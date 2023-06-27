export const apiErrorsLanguageTranslationsEn = {
  lng001: 'Language with ID "%id%" does not exist',
  lng002: 'Language with code "%code%" already exist',
  lng003: 'Failed to add Language to the database',
  lng004: 'Changes to prop "%prop%" are not valid --> %msg%.',
  lng005: 'Failed to update Language in the database',
  lng006: 'Failed to delete Language from the database',
  lng007: 'Default Language cannot be deleted',
  lng008: 'Cannot perform request since there will be no languages left',
};

export function apiErrorLanguageTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'lng001': {
      return apiErrorsLanguageTranslationsEn.lng001.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'lng002': {
      return apiErrorsLanguageTranslationsEn.lng002.replace(
        '%code%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'lng003': {
      return apiErrorsLanguageTranslationsEn.lng003;
    }
    case 'lng004': {
      return apiErrorsLanguageTranslationsEn.lng004
        .replace(
          '%prop%',
          window.bcms.util.string.textBetween(originalMessage, 'prop ', ' are')
        )
        .replace(
          '%msg%',
          window.bcms.util.string.textBetween(originalMessage, '--> ', '.')
        );
    }
    case 'lng005': {
      return apiErrorsLanguageTranslationsEn.lng005;
    }
    case 'lng006': {
      return apiErrorsLanguageTranslationsEn.lng006;
    }
    case 'lng007': {
      return apiErrorsLanguageTranslationsEn.lng007;
    }
    case 'lng008': {
      return apiErrorsLanguageTranslationsEn.lng008;
    }
  }

  return null;
}

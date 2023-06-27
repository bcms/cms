export const apiErrorsChangesTranslationsEn = {
  chg001: 'Change with ID "%id%" does not exist',
  chg002: 'Change with name "%name%" already exist',
  chg003: 'Failed to add Change to the database',
};

export function apiErrorChangesTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'chg001': {
      return apiErrorsChangesTranslationsEn.chg001.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'chg002': {
      return apiErrorsChangesTranslationsEn.chg002.replace(
        '%name%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'chg003': {
      return apiErrorsChangesTranslationsEn.chg003;
    }
  }

  return null;
}

export const apiErrorsAuthTranslationsEn = {
  a001: 'Missing authorization',
  a002: 'Bad authorization encoding',
  a003: 'Invalid email and/or password',
  a004: 'Failed to update User in the database',
  a005: 'Invalid authorization',
  a006: 'No permission to access "%path%.',
  a007: 'You do not have permission to access "%resource%"',
};

export function apiErrorAuthTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'ak001': {
      return apiErrorsAuthTranslationsEn.a001;
    }
    case 'ak002': {
      return apiErrorsAuthTranslationsEn.a002;
    }
    case 'ak003': {
      return apiErrorsAuthTranslationsEn.a003;
    }
    case 'ak004': {
      return apiErrorsAuthTranslationsEn.a004;
    }
    case 'ak005': {
      return apiErrorsAuthTranslationsEn.a005;
    }
    case 'ak006': {
      return apiErrorsAuthTranslationsEn.a006.replace(
        '%path%',
        window.bcms.util.string.textBetween(originalMessage, 'access ', '.')
      );
    }
    case 'ak007': {
      return apiErrorsAuthTranslationsEn.a007.replace(
        '%resource%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
  }

  return null;
}

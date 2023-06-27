export const apiErrorsTypeConverterTranslationsEn = {
  tc001: 'Item type "%itemType%" is not allowed',
  tc002: 'Item with ID "%itemId%" does not exist',
  tc003: 'Item cannot be converted to "%type%"',
};

export function apiErrorTypeConverterTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'tc001': {
      return apiErrorsTypeConverterTranslationsEn.tc001.replace(
        '%itemType%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'tc002': {
      return apiErrorsTypeConverterTranslationsEn.tc002.replace(
        '%itemId%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'tc003': {
      return apiErrorsTypeConverterTranslationsEn.tc003.replace(
        '%type%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
  }

  return null;
}

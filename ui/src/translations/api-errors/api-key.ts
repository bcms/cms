export const apiErrorsApiKeyTranslationsEn = {
  ak001: 'API Key with ID "%id%" does not exist',
  ak003: 'Failed to add API Key to the database',
  ak004: 'Changes to prop "%prop%" are not valid --> %msg%.',
  ak005: 'Failed to update API Key in the database',
  ak006: 'Failed to delete API Key from the database',
  ak007: "'%msg%'",
};

export function apiErrorApiKeyTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'ak001': {
      return apiErrorsApiKeyTranslationsEn.ak001.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'ak003': {
      return apiErrorsApiKeyTranslationsEn.ak003;
    }
    case 'ak004': {
      return apiErrorsApiKeyTranslationsEn.ak004
        .replace(
          '%prop%',
          window.bcms.util.string.textBetween(
            originalMessage,
            'prop "',
            '" are'
          )
        )
        .replace(
          '%msg%',
          window.bcms.util.string.textBetween(originalMessage, '--> ', '.')
        );
    }
    case 'ak005': {
      return apiErrorsApiKeyTranslationsEn.ak005;
    }
    case 'ak006': {
      return apiErrorsApiKeyTranslationsEn.ak006;
    }
    case 'ak007': {
      return apiErrorsApiKeyTranslationsEn.ak007.replace(
        '%msg%',
        window.bcms.util.string.textBetween(originalMessage, "'", "'")
      );
    }
  }

  return null;
}

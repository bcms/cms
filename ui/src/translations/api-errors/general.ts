export const apiErrorsGeneralTranslationsEn = {
  g001: "'%msg%'",
  g002: "'%msg%'",
  g003: 'Nothing to update',
  g004: 'Invalid ID "%id%" was provided',
  g005: 'Prop of type "%type%" is not allowed',
  g006: 'Failed to create Props schema with error: %error%.',
  g007: 'Prop check failed with: %msg%.',
  g008: "'%msg%'",
  g009: 'Failed to update props. %msg%.',
  g010: 'Missing parameter "%param%"',
};

export function apiErrorGeneralTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'g001': {
      return apiErrorsGeneralTranslationsEn.g001.replace(
        '%msg%',
        window.bcms.util.string.textBetween(originalMessage, "'", "'")
      );
    }
    case 'g002': {
      return apiErrorsGeneralTranslationsEn.g002.replace(
        '%msg%',
        window.bcms.util.string.textBetween(originalMessage, "'", "'")
      );
    }
    case 'g003': {
      return apiErrorsGeneralTranslationsEn.g003;
    }
    case 'g004': {
      return apiErrorsGeneralTranslationsEn.g004.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'g005': {
      return apiErrorsGeneralTranslationsEn.g005.replace(
        '%type%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'g006': {
      return apiErrorsGeneralTranslationsEn.g006.replace(
        '%error%',
        window.bcms.util.string.textBetween(originalMessage, 'error: ', '.')
      );
    }
    case 'g007': {
      return apiErrorsGeneralTranslationsEn.g007.replace(
        '%msg%',
        window.bcms.util.string.textBetween(originalMessage, 'with: ', '.')
      );
    }
    case 'g008': {
      return apiErrorsGeneralTranslationsEn.g008.replace(
        '%msg%',
        window.bcms.util.string.textBetween(originalMessage, "'", "'")
      );
    }
    case 'g009': {
      return apiErrorsGeneralTranslationsEn.g009.replace(
        '%msg%',
        window.bcms.util.string.textBetween(originalMessage, 'props. ', '.')
      );
    }
    case 'g010': {
      return apiErrorsGeneralTranslationsEn.g010.replace(
        '%param%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
  }

  return null;
}

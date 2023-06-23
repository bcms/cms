export const apiErrorsTemplateTranslationsEn = {
  tmp001: 'Template with ID "%id%" does not exist.',
  tmp002: 'Template with name "%name%" already exist',
  tmp003: 'Failed to add Template to the database',
  tmp004: 'Changes to prop "%prop%" are not valid --> %msg%.',
  tmp005: 'Failed to update Template in the database',
  tmp006: 'Failed to delete Template from the database',
  tmp007: 'Invalid propChange was provided as position "%pos%"',
  tmp008: 'Failed to update Entries after Template update. %msg%.',
  tmp009: 'Property with name "%name%" is reserved and cannot me modified',
};

export function apiErrorTemplateTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'tmp001': {
      return apiErrorsTemplateTranslationsEn.tmp001.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'tmp002': {
      return apiErrorsTemplateTranslationsEn.tmp002.replace(
        '%name%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'tmp003': {
      return apiErrorsTemplateTranslationsEn.tmp003;
    }
    case 'tmp004': {
      return apiErrorsTemplateTranslationsEn.tmp004
        .replace(
          '%prop%',
          window.bcms.util.string.textBetween(originalMessage, '"', '"')
        )
        .replace(
          '%msg%',
          window.bcms.util.string.textBetween(originalMessage, '--> ', '.')
        );
    }
    case 'tmp005': {
      return apiErrorsTemplateTranslationsEn.tmp005;
    }
    case 'tmp006': {
      return apiErrorsTemplateTranslationsEn.tmp006;
    }
    case 'tmp007': {
      return apiErrorsTemplateTranslationsEn.tmp007.replace(
        '%pos%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'tmp008': {
      return apiErrorsTemplateTranslationsEn.tmp008.replace(
        '%msg%',
        window.bcms.util.string.textBetween(originalMessage, 'update. ', '.')
      );
    }
    case 'tmp009': {
      return apiErrorsTemplateTranslationsEn.tmp009.replace(
        '%name%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
  }

  return null;
}

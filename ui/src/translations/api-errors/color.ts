export const apiErrorsColorTranslationsEn = {
  col001: 'Color with ID "%id%" does not exist',
  col002: 'Color with name "%name%" already exist',
  col003: 'Failed to add Color to the database',
  col004: 'Changes to prop "%prop%" are not valid --> %msg.',
  col005: 'Failed to update Color in the database',
  col006: 'Failed to delete Color from the database',
  col007: 'Invalid propChange was provided as position "%pos%"',
  col008: 'Failed to update Entries after Color update. %msg%.',
  col009: 'Property with name "%name%" is reserved and cannot be modified',
  col010: 'Color value does not have valid format, HEX value expected',
};

export function apiErrorColorTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'col001': {
      return apiErrorsColorTranslationsEn.col001.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'col002': {
      return apiErrorsColorTranslationsEn.col002.replace(
        '%name%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'col003': {
      return apiErrorsColorTranslationsEn.col003;
    }
    case 'col004': {
      return apiErrorsColorTranslationsEn.col004
        .replace(
          '%prop%',
          window.bcms.util.string.textBetween(originalMessage, 'prop ', ' are')
        )
        .replace(
          '%msg%',
          window.bcms.util.string.textBetween(originalMessage, '--> ', '.')
        );
    }
    case 'col005': {
      return apiErrorsColorTranslationsEn.col005;
    }
    case 'col006': {
      return apiErrorsColorTranslationsEn.col006;
    }
    case 'col007': {
      return apiErrorsColorTranslationsEn.col007.replace(
        '%pos%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'col008': {
      return apiErrorsColorTranslationsEn.col008.replace(
        '%msg%',
        window.bcms.util.string.textBetween(originalMessage, '. ', '.')
      );
    }
    case 'col009': {
      return apiErrorsColorTranslationsEn.col009.replace(
        '%name%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'col010': {
      return apiErrorsColorTranslationsEn.col010;
    }
  }

  return null;
}

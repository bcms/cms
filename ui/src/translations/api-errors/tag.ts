export const apiErrorsTagTranslationsEn = {
  tag001: 'Tag with ID "%id%" does not exist',
  tag002: 'Tag with value "%value%" already exist',
  tag003: 'Failed to add Tag to the database',
  tag004: 'Changes to prop "%prop%" are not valid --> %msg%.',
  tag005: 'Failed to update Tag in the database',
  tag006: 'Failed to delete Tag from the database',
  tag007: 'Invalid propChange was provided as position "%pos%"',
  tag008: 'Failed to update Entries after Tag update. %msg%.',
  tag009: 'Tag property value cannot be empty string',
  tag010: 'Tag with value "%value%" does not exist',
};

export function apiErrorTagTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'tag001': {
      return apiErrorsTagTranslationsEn.tag001.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'tag002': {
      return apiErrorsTagTranslationsEn.tag002.replace(
        '%value%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'tag003': {
      return apiErrorsTagTranslationsEn.tag003;
    }
    case 'tag004': {
      return apiErrorsTagTranslationsEn.tag004
        .replace(
          '%prop%',
          window.bcms.util.string.textBetween(originalMessage, 'prop ', ' are')
        )
        .replace(
          '%msg%',
          window.bcms.util.string.textBetween(originalMessage, '--> ', '.')
        );
    }
    case 'tag005': {
      return apiErrorsTagTranslationsEn.tag005;
    }
    case 'tag006': {
      return apiErrorsTagTranslationsEn.tag006;
    }
    case 'tag007': {
      return apiErrorsTagTranslationsEn.tag007.replace(
        '%pos%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'tag008': {
      return apiErrorsTagTranslationsEn.tag008.replace(
        '%msg%',
        window.bcms.util.string.textBetween(originalMessage, 'update. ', '.')
      );
    }
    case 'tag009': {
      return apiErrorsTagTranslationsEn.tag009;
    }
    case 'tag010': {
      return apiErrorsTagTranslationsEn.tag010.replace(
        '%value%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
  }

  return null;
}

export const apiErrorsEntryTranslationsEn = {
  etr001: 'Entry with ID "%id%" does not exist',
  etr002: 'Entry is missing language "%lng%" in "%prop%"',
  etr003: 'Entry "%prop%" check failed with %error%.',
  etr004: 'Failed to add Entry to the database',
  etr005: 'Failed to update Entry in the database',
  etr006: 'Failed to delete Entry from the database',
};

export function apiErrorEntryTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'etr001': {
      return apiErrorsEntryTranslationsEn.etr001.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'etr002': {
      return apiErrorsEntryTranslationsEn.etr002
        .replace(
          '%lng%',
          window.bcms.util.string.textBetween(
            originalMessage,
            'language "',
            '" in'
          )
        )
        .replace(
          '%prop%',
          window.bcms.util.string.textBetween(originalMessage, 'in "', '"')
        );
    }
    case 'etr003': {
      return apiErrorsEntryTranslationsEn.etr003
        .replace(
          '%prop%',
          window.bcms.util.string.textBetween(
            originalMessage,
            'Entry "',
            '" check'
          )
        )
        .replace(
          '%error%',
          window.bcms.util.string.textBetween(originalMessage, 'with ', '.')
        );
    }
    case 'etr004': {
      return apiErrorsEntryTranslationsEn.etr004;
    }
    case 'etr005': {
      return apiErrorsEntryTranslationsEn.etr005;
    }
    case 'etr006': {
      return apiErrorsEntryTranslationsEn.etr006;
    }
  }

  return null;
}

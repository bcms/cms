export const apiErrorsMediaTranslationsEn = {
  mda001: 'Media with ID "%id%" does not exist',
  mda002: 'Media with name "%name%" already exist',
  mda003: 'Failed to add Media to the database',
  mda004: 'Changes to prop "%prop%" are not valid --> %msg%.',
  mda005: 'Failed to update Media in the database',
  mda006: 'Failed to delete Media from the database',
  mda007:
    'Media with ID "%id%" is a directory and it cannot be returned as a binary',
  mda008:
    'Media with ID "%id%" is indexed in database but cannot be wound in FS. Please contact a support',
  mda009: 'Missing file',
  mda010: 'Invalid Media ID "%id%" was provided',
  mda011: 'Missing "act" query',
  mda012: 'Unauthorized',
  mda013: 'Failed to set dimensions on image',
};

export function apiErrorMediaTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'mda001': {
      return apiErrorsMediaTranslationsEn.mda001.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'mda002': {
      return apiErrorsMediaTranslationsEn.mda002.replace(
        '%name%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'mda003': {
      return apiErrorsMediaTranslationsEn.mda003;
    }
    case 'mda004': {
      return apiErrorsMediaTranslationsEn.mda004
        .replace(
          '%prop%',
          window.bcms.util.string.textBetween(originalMessage, 'prop ', ' are')
        )
        .replace(
          '%msg%',
          window.bcms.util.string.textBetween(originalMessage, '--> ', '.')
        );
    }
    case 'mda005': {
      return apiErrorsMediaTranslationsEn.mda005;
    }
    case 'mda006': {
      return apiErrorsMediaTranslationsEn.mda006;
    }
    case 'mda007': {
      return apiErrorsMediaTranslationsEn.mda007.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'mda008': {
      return apiErrorsMediaTranslationsEn.mda008.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'mda009': {
      return apiErrorsMediaTranslationsEn.mda009;
    }
    case 'mda010': {
      return apiErrorsMediaTranslationsEn.mda010.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'mda011': {
      return apiErrorsMediaTranslationsEn.mda011;
    }
    case 'mda012': {
      return apiErrorsMediaTranslationsEn.mda012;
    }
    case 'mda013': {
      return apiErrorsMediaTranslationsEn.mda013;
    }
  }

  return null;
}

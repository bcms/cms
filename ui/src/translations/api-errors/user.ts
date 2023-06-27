export const apiErrorsUserTranslationsEn = {
  u001: 'Failed to find a User in database',
  u002: 'User with ID "%id%" does not exist',
  u003: 'You do not have permission to edit other Users',
  u004: 'Failed to find a User in database',
  u005: 'Failed to delete User form database',
  u006: 'User with email "%email%" already exist',
  u007: 'Invalid current password',
  u008: 'You do not have permission to change users policy',
  u009: 'Nothing to update',
  u010: 'Failed to update the User in database',
  u011: 'Failed to add User to the database',
  u012: 'Invalid security code',
  u013: 'Invalid ID "%id%" was provided',
  u014: 'You do not have permission to delete other users',
  u015: 'Admin exist',
};

export function apiErrorUserTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'u001': {
      return apiErrorsUserTranslationsEn.u001;
    }
    case 'u002': {
      return apiErrorsUserTranslationsEn.u002.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'u003': {
      return apiErrorsUserTranslationsEn.u003;
    }
    case 'u004': {
      return apiErrorsUserTranslationsEn.u004;
    }
    case 'u005': {
      return apiErrorsUserTranslationsEn.u005;
    }
    case 'u006': {
      return apiErrorsUserTranslationsEn.u006.replace(
        '%email%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'u007': {
      return apiErrorsUserTranslationsEn.u007;
    }
    case 'u008': {
      return apiErrorsUserTranslationsEn.u008;
    }
    case 'u009': {
      return apiErrorsUserTranslationsEn.u009;
    }
    case 'u010': {
      return apiErrorsUserTranslationsEn.u010;
    }
    case 'u011': {
      return apiErrorsUserTranslationsEn.u011;
    }
    case 'u012': {
      return apiErrorsUserTranslationsEn.u012;
    }
    case 'u013': {
      return apiErrorsUserTranslationsEn.u013.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'u014': {
      return apiErrorsUserTranslationsEn.u014;
    }
    case 'u015': {
      return apiErrorsUserTranslationsEn.u015;
    }
  }

  return null;
}

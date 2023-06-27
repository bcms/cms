export const apiErrorsGroupTranslationsEn = {
  grp001: 'Group with ID "%id%" does not exist',
  grp002: 'Group with name "%name%" already exist',
  grp003: 'Failed to add Group to the database',
  grp004: 'Prop check failed with: %msg%.',
  grp005: 'Failed to update Group in the database',
  grp006: 'Failed to delete Group from the database',
  grp007:
    'Failed to update Entries, Groups, Widgets or Templates after Groups update. %msg%.',
};

export function apiErrorGroupTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'grp001': {
      return apiErrorsGroupTranslationsEn.grp001.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'grp002': {
      return apiErrorsGroupTranslationsEn.grp002.replace(
        '%name%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'grp003': {
      return apiErrorsGroupTranslationsEn.grp003;
    }
    case 'grp004': {
      return apiErrorsGroupTranslationsEn.grp004.replace(
        '%msg%',
        window.bcms.util.string.textBetween(originalMessage, 'with: ', '.')
      );
    }
    case 'grp005': {
      return apiErrorsGroupTranslationsEn.grp005;
    }
    case 'grp006': {
      return apiErrorsGroupTranslationsEn.grp006;
    }
    case 'grp007': {
      return apiErrorsGroupTranslationsEn.grp007.replace(
        '%msg%',
        window.bcms.util.string.textBetween(originalMessage, 'update.  ', '.')
      );
    }
  }

  return null;
}

export const apiErrorsTempOrgTranslationsEn = {
  tpo001: 'Template organizer with ID "%id%" does not exist',
  tpo002: 'Failed to update template organizer in the database',
  tpo003: 'Failed to add template organizer to the database',
  tpo004: 'Failed to remove template organizer from the database',
};

export function apiErrorTempOrgTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'tpo001': {
      return apiErrorsTempOrgTranslationsEn.tpo001.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'tpo002': {
      return apiErrorsTempOrgTranslationsEn.tpo002;
    }
    case 'tpo003': {
      return apiErrorsTempOrgTranslationsEn.tpo003;
    }
    case 'tpo004': {
      return apiErrorsTempOrgTranslationsEn.tpo004;
    }
  }

  return null;
}

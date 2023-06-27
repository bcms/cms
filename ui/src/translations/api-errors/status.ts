export const apiErrorsStatusTranslationsEn = {
  sts001: 'Status with ID "%id%" does not exist',
  sts002: 'Status with name "%name%" already exist',
  sts003: 'Failed to add Status to the database',
  sts004: 'Failed to update Status in the database',
  sts005: 'Failed to delete Status from the database',
  sts006: 'Invalid color value "%color%" was provided',
};

export function apiErrorStatusTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'sts001': {
      return apiErrorsStatusTranslationsEn.sts001.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'sts002': {
      return apiErrorsStatusTranslationsEn.sts002.replace(
        '%name%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'sts003': {
      return apiErrorsStatusTranslationsEn.sts003;
    }
    case 'sts004': {
      return apiErrorsStatusTranslationsEn.sts004;
    }
    case 'sts005': {
      return apiErrorsStatusTranslationsEn.sts005;
    }
    case 'sts006': {
      return apiErrorsStatusTranslationsEn.sts006.replace(
        '%color%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
  }

  return null;
}

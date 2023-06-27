export const apiErrorsBackupTranslationsEn = {
  bak001: 'Fail to ZIP uploads',
  bak002: 'Backup "%hash%" does not exist',
};

export function apiErrorBackupTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'bak001': {
      return apiErrorsBackupTranslationsEn.bak001;
    }
    case 'bak002': {
      return apiErrorsBackupTranslationsEn.bak002.replace(
        '%hash%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
  }

  return null;
}

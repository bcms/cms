export const apiErrorsWidgetTranslationsEn = {
  wid001: 'Widget with ID "%id%" does not exist',
  wid002: 'Widget with name "%name%" already exist',
  wid003: 'Failed to add Widget to the database',
  wid004: 'Changes to prop "%prop%" are not valid --> %msg%.',
  wid005: 'Failed to update Widget in the database',
  wid006: 'Failed to delete widget from the database',
  wid007: 'Failed to update Entries after Widget update. %msg%.',
};

export function apiErrorWidgetTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'wid001': {
      return apiErrorsWidgetTranslationsEn.wid001.replace(
        '%id%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'wid002': {
      return apiErrorsWidgetTranslationsEn.wid002.replace(
        '%name%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
    case 'wid003': {
      return apiErrorsWidgetTranslationsEn.wid003;
    }
    case 'wid004': {
      return apiErrorsWidgetTranslationsEn.wid004
        .replace(
          '%prop%',
          window.bcms.util.string.textBetween(originalMessage, 'prop ', ' are')
        )
        .replace(
          '%msg%',
          window.bcms.util.string.textBetween(originalMessage, '--> ', '.')
        );
    }
    case 'wid005': {
      return apiErrorsWidgetTranslationsEn.wid005;
    }
    case 'wid006': {
      return apiErrorsWidgetTranslationsEn.wid006;
    }
    case 'wid007': {
      return apiErrorsWidgetTranslationsEn.wid007.replace(
        '%msg%',
        window.bcms.util.string.textBetween(originalMessage, 'update. ', '.')
      );
    }
  }

  return null;
}

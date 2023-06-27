export const apiErrorsFunctionTranslationsEn = {
  fn001: 'Function with name "%name%" does not exist',
};

export function apiErrorFunctionTranslationsResolved(
  code: string,
  originalMessage: string
): string | null {
  switch (code) {
    case 'etr001': {
      return apiErrorsFunctionTranslationsEn.fn001.replace(
        '%name%',
        window.bcms.util.string.textBetween(originalMessage, '"', '"')
      );
    }
  }

  return null;
}

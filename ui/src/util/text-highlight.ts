export function textHighlight(text: string, searchVal: string) {
  const lowercasedText = text.toLowerCase();
  const search = searchVal.toLowerCase();
  const index = lowercasedText.indexOf(search);
  const endIndex = index + search.length;

  if (index === -1) {
    return text;
  }

  return (
    text.substring(0, index) +
    '<span class="bg-green text-white dark:bg-yellow dark:text-dark">' +
    text.substring(index, endIndex) +
    '</span>' +
    text.substring(endIndex)
  );
}

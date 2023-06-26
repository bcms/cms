export type BCMSClientTypeConverterLanguage = 'typescript' | 'jsDoc' | 'gql';

export interface BCMSTypeConverterResultItem {
  outputFile: string;
  content: string;
}
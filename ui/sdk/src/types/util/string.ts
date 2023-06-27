export interface BCMSStringUtility {
  toPretty(s: string): string;
  toSlug(s: string): string;
  toSlugUnderscore(s: string): string;
  toEnum(s: string): string;
  toShort(s: string, length: number): string;
  textBetween(src: string, begin: string, end: string): string;
  allTextBetween(src: string, begin: string, end: string): string[];
  addZerosAtBeginning(num: number, count?: number): string;
}

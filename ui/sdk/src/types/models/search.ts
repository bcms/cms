export type BCMSSearchResultType =
  | 'entry'
  | 'widget'
  | 'group'
  | 'template'
  | 'media'
  | 'user'
  | 'tag'
  | 'color'
  | 'apiKey';
export interface BCMSGetAllSearchResultItem {
  /**
   * - Role ADMIN: all
   * - Role USER: entry, media, user, tag, color
   */
  type: BCMSSearchResultType;
  id: string;
  templateId?: string;
  score: number;
  matches: number;
  positions: number[][];
}

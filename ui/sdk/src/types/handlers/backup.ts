export interface BCMSBackupListItem {
  _id: string;
  size: number;
  available: boolean;
}
export interface BCMSBackupHandler {
  list(): Promise<BCMSBackupListItem[]>;
  getDownloadHash(data: { fileName: string }): Promise<string>;
  create(data: { media?: boolean }): Promise<BCMSBackupListItem>;
  delete(data: { fileNames: string[] }): Promise<void>;
  restoreEntities(data: {
    type:
      | 'apiKey'
      | 'entry'
      | 'group'
      | 'idc'
      | 'language'
      | 'media'
      | 'status'
      | 'template'
      | 'templateOrganizer'
      | 'user'
      | 'widget'
      | 'color'
      | 'tag'
      | 'change';
    items: unknown[];
  }): Promise<void>;
  restoreMediaFile(data: {
    file: File | Buffer;
    name: string;
    id: string;
  }): Promise<void>;
}

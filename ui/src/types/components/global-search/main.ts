export interface BCMSGlobalSearchItem {
  label: string;
  url: string;
  imageUrl?: string;
  kind:
    | 'Template'
    | 'Group'
    | 'Widget'
    | 'Media'
    | 'API Key'
    | 'Entry'
    | 'User'
    | 'Tag'
    | 'Color';
}

import type { BCMSPluginPolicy } from './policy';

export interface BCMSPluginInfo {
  name: string;
  dirPath: string;
  policy(): Promise<BCMSPluginPolicy[]>;
}

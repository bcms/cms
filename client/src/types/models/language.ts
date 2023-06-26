import type { BCMSEntity } from './_entity';

export interface BCMSLanguage extends BCMSEntity {
  userId: string;
  code: string;
  name: string;
  nativeName: string;
  def: boolean;
}

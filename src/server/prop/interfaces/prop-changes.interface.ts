import { Prop } from './prop.interface';

export interface PropChanges {
  name: {
    old: string;
    new: string;
  };
  required: boolean;
  remove?: boolean;
  add?: Prop;
}

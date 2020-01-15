export interface PropChanges {
  name: {
    old: string;
    new: string;
  };
  required: boolean;
  remove?: boolean;
  add?: boolean;
}

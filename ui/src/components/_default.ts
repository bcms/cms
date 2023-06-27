export interface DefaultComponentPropsType {
  id?: string;
  style?: string;
  class?: string;
  cyTag?: string;
}
export const DefaultComponentProps = {
  id: String,
  style: String,
  class: {
    type: String,
    default: '',
  },
  cyTag: String,
};

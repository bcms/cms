export interface TemplateChanges {
  props: Array<{
    name: {
      old: string;
      new: string;
    };
    required: boolean;
  }>;
}

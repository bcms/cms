import type {
  BCMSAddPropModalInputData,
  BCMSAddPropModalOutputData,
  BCMSAddUpdateDirModalInputData,
  BCMSAddUpdateDirModalOutputData,
  BCMSAddUpdateGroupModalInputData,
  BCMSAddUpdateGroupModalOutputData,
  BCMSAddUpdateTemplateModalInputData,
  BCMSAddUpdateTemplateModalOutputData,
  BCMSAddUpdateWidgetModalInputData,
  BCMSAddUpdateWidgetModalOutputData,
  BCMSConfirmModalInputData,
  BCMSConfirmModalOutputData,
  BCMSContentEditorAddWidgetModalInputData,
  BCMSContentEditorAddWidgetModalOutputData,
  BCMSContentEditorLinkModalInputData,
  BCMSContentEditorLinkModalOutputData,
  BCMSEditPropModalInputData,
  BCMSEditPropModalOutputData,
  BCMSEntryStatusModalInputData,
  BCMSEntryStatusModalOutputData,
  BCMSMediaPickerModalInputData,
  BCMSMediaPickerModalOutputData,
  BCMSShowDescriptionExampleModalInputData,
  BCMSShowDescriptionExampleModalOutputData,
  BCMSTemplateOrganizerCreateModalInputData,
  BCMSTemplateOrganizerCreateModalOutputData,
  BCMSUploadMediaModalInputData,
  BCMSUploadMediaModalOutputData,
  BCMSViewEntryModelModalInputData,
  BCMSViewEntryModelModalOutputData,
  BCMSWhereIsItUsedModalInputData,
  BCMSWhereIsItUsedModalOutputData,
  BCMSAddUpdateApiKeyModalInputData,
  BCMSAddUpdateApiKeyModalOutputData,
  BCMSViewUserModalOutputData,
  BCMSViewUserModalInputData,
  BCMSMultiSelectModalOutputData,
  BCMSMultiSelectModalInputData,
  BCMSBackupModalOutputData,
  BCMSBackupModalInputData,
  BCMSViewEntryPointerModalInputData,
  BCMSViewEntryPointerModalOutputData,
} from '../components';

export interface BCMSModalInputDefaults<OutputData> {
  title?: string;
  onDone?(data: OutputData): void | Promise<void>;
  onCancel?(): void | Promise<void>;
}

export interface BCMSModalServiceItem<
  OutputData,
  InputData extends BCMSModalInputDefaults<OutputData>
> {
  show(data: InputData): void;
  hide(): void;
  subscribe?(eventName: string, handler: (event: Event) => void): () => void;
  triggerEvent?(eventName: string, event: Event): void;
}

export interface BCMSModalServiceExtended<CustomModals>
  extends BCMSModalService {
  custom: CustomModals;
}

export interface BCMSModalService {
  register(data: { name: string }): void;
  escape: {
    register(handler: () => void): () => void;
  };
  confirm: BCMSModalServiceItem<
    BCMSConfirmModalOutputData,
    BCMSConfirmModalInputData
  >;
  media: {
    addUpdateDir: BCMSModalServiceItem<
      BCMSAddUpdateDirModalOutputData,
      BCMSAddUpdateDirModalInputData
    >;
    upload: BCMSModalServiceItem<
      BCMSUploadMediaModalOutputData,
      BCMSUploadMediaModalInputData
    >;
    picker: BCMSModalServiceItem<
      BCMSMediaPickerModalOutputData,
      BCMSMediaPickerModalInputData
    >;
  };
  entry: {
    viewModel: BCMSModalServiceItem<
      BCMSViewEntryModelModalOutputData,
      BCMSViewEntryModelModalInputData
    >;
    status: BCMSModalServiceItem<
      BCMSEntryStatusModalOutputData,
      BCMSEntryStatusModalInputData
    >;
  };
  props: {
    add: BCMSModalServiceItem<
      BCMSAddPropModalOutputData,
      BCMSAddPropModalInputData
    >;
    edit: BCMSModalServiceItem<
      BCMSEditPropModalOutputData,
      BCMSEditPropModalInputData
    >;
    viewEntryPointer: BCMSModalServiceItem<
      BCMSViewEntryPointerModalOutputData,
      BCMSViewEntryPointerModalInputData
    >;
  };
  showDescriptionExample: BCMSModalServiceItem<
    BCMSShowDescriptionExampleModalOutputData,
    BCMSShowDescriptionExampleModalInputData
  >;
  whereIsItUsed: BCMSModalServiceItem<
    BCMSWhereIsItUsedModalOutputData,
    BCMSWhereIsItUsedModalInputData
  >;
  addUpdate: {
    group: BCMSModalServiceItem<
      BCMSAddUpdateGroupModalOutputData,
      BCMSAddUpdateGroupModalInputData
    >;
    template: BCMSModalServiceItem<
      BCMSAddUpdateTemplateModalOutputData,
      BCMSAddUpdateTemplateModalInputData
    >;
    widget: BCMSModalServiceItem<
      BCMSAddUpdateWidgetModalOutputData,
      BCMSAddUpdateWidgetModalInputData
    >;
  };
  content: {
    link: BCMSModalServiceItem<
      BCMSContentEditorLinkModalOutputData,
      BCMSContentEditorLinkModalInputData
    >;
    widget: BCMSModalServiceItem<
      BCMSContentEditorAddWidgetModalOutputData,
      BCMSContentEditorAddWidgetModalInputData
    >;
  };
  templateOrganizer: {
    create: BCMSModalServiceItem<
      BCMSTemplateOrganizerCreateModalOutputData,
      BCMSTemplateOrganizerCreateModalInputData
    >;
  };
  apiKey: {
    addUpdate: BCMSModalServiceItem<
      BCMSAddUpdateApiKeyModalOutputData,
      BCMSAddUpdateApiKeyModalInputData
    >;
  };
  settings: {
    view: BCMSModalServiceItem<
      BCMSViewUserModalOutputData,
      BCMSViewUserModalInputData
    >;
  };
  multiSelect: BCMSModalServiceItem<
    BCMSMultiSelectModalOutputData,
    BCMSMultiSelectModalInputData
  >;
  backup: BCMSModalServiceItem<
    BCMSBackupModalOutputData,
    BCMSBackupModalInputData
  >;
}

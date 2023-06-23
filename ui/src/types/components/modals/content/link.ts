import type { BCMSModalInputDefaults } from '../../../services';

export interface BCMSContentEditorLinkModalOutputData {
  href: string;
}
export interface BCMSContentEditorLinkModalInputData
  extends BCMSModalInputDefaults<BCMSContentEditorLinkModalOutputData> {
  href?: string;
}

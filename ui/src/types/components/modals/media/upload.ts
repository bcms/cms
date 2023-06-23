import type { UppyFile } from '@uppy/core';
import type { BCMSModalInputDefaults } from '../../../services';

export interface BCMSUploadMediaModalOutputData {
  files: UppyFile[];
}
export type BCMSUploadMediaModalInputData =
  BCMSModalInputDefaults<BCMSUploadMediaModalOutputData>;

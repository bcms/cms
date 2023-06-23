import type {
  BCMSProp,
  BCMSPropValue,
  BCMSSocketSyncChangeStringDelta,
} from '@becomes/cms-sdk/types';
import type { BCMSArrayPropMoveEventData } from '../components';
import type { BCMSPropValueExtended } from '../models';

export interface BCMSPropService {
  toPropValueExtended(data: {
    prop: BCMSProp;
    value?: BCMSPropValue | BCMSPropValueExtended;
    lang: string;
    groupRequired?: boolean;
  }): Promise<BCMSPropValueExtended | null>;
  fromPropValueExtended(data: {
    extended: BCMSPropValueExtended;
  }): BCMSPropValue;
  checker: {
    register(validate: () => boolean): () => void;
    validate(): boolean;
  };
  pathStrToArr(path: string): Array<string | number>;
  getValueFromPath<Value = unknown>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any,
    path: Array<string | number>
  ): Value;
  findLastDataPropFromPath(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any,
    path: Array<string | number>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any
  ): unknown;
  findSchemaFromPath(
    obj: any,
    schemaHolder: BCMSProp[],
    path: Array<string | number>,
    schema?: BCMSProp
  ): Promise<BCMSProp | undefined>;
  mutateValue: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any(obj: any, path: Array<string | number>, value: any): void;
    string(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj: any,
      path: Array<string | number>,
      diff: BCMSSocketSyncChangeStringDelta[]
    ): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeArrayItem(obj: any, path: Array<string | number>): void;
    reorderArrayItems(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj: any,
      path: Array<string | number>,
      info: BCMSArrayPropMoveEventData
    ): void;
    addArrayItem(
      obj: any,
      baseSchema: BCMSProp[],
      path: Array<string | number>,
      lang: string
    ): Promise<void>;
  };
}

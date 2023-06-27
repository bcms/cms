import type { BCMSColor } from './models';

export interface BCMSColorFactory {
  create(data: {
    cid?: string;
    label?: string;
    name?: string;
    value?: string;
    userId?: string;
    global?: boolean;
  }): BCMSColor;
}

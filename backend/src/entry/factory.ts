import { Types } from 'mongoose';
import {
  BCMSEntryFactory,
  BCMSEntryMeta,
  BCMSProp,
  BCMSPropType,
  BCMSPropValue,
} from '../types';

export function createBcmsEntryFactory(): BCMSEntryFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cid: data.cid ? data.cid : '',
        templateId: data.templateId ? data.templateId : '',
        userId: data.userId ? data.userId : '',
        status: data.status ? data.status : '',
        meta: data.meta ? data.meta : [],
        content: data.content ? data.content : [],
      };
    },
    toLite(entry, template) {
      const entryMeta: BCMSEntryMeta[] = [];
      for (let k = 0; k < entry.meta.length; k++) {
        const meta = entry.meta[k];
        let imageProp: BCMSPropValue | undefined;
        let textProp: BCMSPropValue | undefined;
        if (template) {
          let tProp = template.props.find(
            (e) => e.type === BCMSPropType.MEDIA,
          ) as BCMSProp;
          if (tProp) {
            imageProp = meta.props.find((e) => e.id === tProp.id);
          }
          tProp = template.props.find(
            (e, i) => i > 1 && e.type === BCMSPropType.STRING,
          ) as BCMSProp;
          if (tProp) {
            textProp = meta.props.find((e) => e.id === tProp.id);
          }
        }
        const props = meta.props.slice(0, 2);
        if (imageProp) {
          props.push(imageProp);
        }
        if (textProp) {
          textProp = JSON.parse(JSON.stringify(textProp)) as BCMSPropValue;
          if (
            (textProp.data as string[])[0] &&
            (textProp.data as string[])[0].length > 140
          ) {
            (textProp.data as string[])[0] =
              (textProp.data as string[])[0].slice(0, 140) + ' ...';
          }
          props.push(textProp);
        }
        entryMeta.push({
          lng: meta.lng,
          props: props,
        });
      }
      return {
        _id: entry._id,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        cid: entry.cid,
        templateId: entry.templateId,
        userId: entry.userId,
        status: entry.status,
        meta: entryMeta,
      };
    },
  };
}

import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import { BCMSPropGql, BCMSPropType, BCMSTemplateFactory } from '../types';
import { BCMSFactory } from '@backend/factory';

export function createBcmsTemplateFactory(): BCMSTemplateFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cid: data.cid ? data.cid : '',
        desc: data.desc ? data.desc : '',
        label: data.label ? data.label : '',
        name: data.name ? data.name : '',
        singleEntry: data.singleEntry ? data.singleEntry : false,
        userId: data.userId ? data.userId : '',
        props: data.props
          ? data.props
          : [
              {
                id: uuidv4(),
                label: 'Title',
                name: 'title',
                array: false,
                required: true,
                type: BCMSPropType.STRING,
                defaultData: [''],
              },
              {
                id: uuidv4(),
                label: 'Slug',
                name: 'slug',
                array: false,
                required: true,
                type: BCMSPropType.STRING,
                defaultData: [''],
              },
            ],
      };
    },
    toGql(template) {
      return {
        _id: template._id,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        cid: template.cid,
        desc: template.desc,
        label: template.label,
        name: template.name,
        singleEntry: template.singleEntry,
        userId: template.userId,
        props: BCMSFactory.prop.toGql(template.props) as BCMSPropGql[],
      };
    },
  };
}

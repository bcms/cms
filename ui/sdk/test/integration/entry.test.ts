import { expect } from 'chai';
import * as fs from 'fs/promises';
import path = require('path');
import { BCMSPropType } from '../../src/types';
// import { BCMSPropType } from '../../src/types';
import { Login, ObjectUtil, sdk } from '../util';

describe('Entry API', async () => {
  Login();
  let idTemplate: string;
  let idTemplate2: string;
  let idEntry: string;
  let idEntrySecond: string;
  let propIdFirst: string;
  let propIdSecond: string;
  it('should create an entry', async () => {
    const template = await sdk.template.create({
      label: 'Template',
      desc: 'Template',
      singleEntry: true,
    });

    idTemplate = template._id;
    expect(template).to.be.instanceOf(Object);
    expect(template).to.have.property('_id').to.be.a('string');
    expect(template).to.have.property('createdAt').to.be.a('number');
    expect(template).to.have.property('updatedAt').to.be.a('number');
    expect(template).to.have.property('cid').to.be.a('string');
    expect(template).to.have.property('props').to.be.a('array');
    expect(template.props[0]).to.have.property('id').to.be.a('string');
    expect(template.props[1]).to.have.property('id').to.be.a('string');
    ObjectUtil.eq(
      template,
      {
        name: 'template',
        label: 'Template',
        desc: 'Template',
        singleEntry: true,
        userId: '111111111111111111111111',
        props: [
          {
            label: 'Title',
            name: 'title',
            array: false,
            required: true,
            type: 'STRING',
            defaultData: [''],
          },
          {
            label: 'Slug',
            name: 'slug',
            array: false,
            required: true,
            type: 'STRING',
            defaultData: [''],
          },
        ],
      },
      'template',
    );
    const entry = await sdk.entry.create({
      templateId: idTemplate,
      status: '',
      meta: [
        {
          lng: 'en',
          props: [
            {
              id: template.props[0].id,
              data: ['Test'],
            },
            {
              id: template.props[1].id,
              data: ['Test2'],
            },
          ],
        },
      ],
      content: [{ lng: 'en', nodes: [] }],
    });
    idEntry = entry._id;
    propIdFirst = entry.meta[0].props[0].id;
    propIdSecond = entry.meta[0].props[1].id;
    expect(entry).to.be.instanceOf(Object);
    expect(entry).to.have.property('_id').to.be.a('string');
    expect(entry).to.have.property('createdAt').to.be.a('number');
    expect(entry).to.have.property('updatedAt').to.be.a('number');
    expect(entry).to.have.property('cid').to.be.a('string');
    expect(entry)
      .to.have.property('templateId')
      .to.be.a('string')
      .eq(idTemplate);
    expect(entry.meta[0]).to.have.property('props').to.be.a('array');
    expect(entry.meta[0].props[0])
      .to.have.property('id')
      .to.be.a('string')
      .eq(template.props[0].id);
    expect(entry.meta[0].props[1])
      .to.have.property('id')
      .to.be.a('string')
      .eq(template.props[1].id);
    ObjectUtil.eq(
      entry,
      {
        status: '',
        userId: '111111111111111111111111',
        meta: [
          {
            lng: 'en',
            props: [
              {
                data: ['Test'],
              },
              {
                data: ['Test2'],
              },
            ],
          },
        ],
        content: [{ lng: 'en', nodes: [] }],
      },
      'entry',
    );
    const entrySecond = await sdk.entry.create({
      templateId: idTemplate,
      status: '',
      meta: [
        {
          lng: 'en',
          props: [
            {
              id: template.props[0].id,
              data: ['Second'],
            },
            {
              id: template.props[1].id,
              data: ['Second'],
            },
          ],
        },
      ],
      content: [{ lng: 'en', nodes: [] }],
    });
    idEntrySecond = entrySecond._id;
    expect(entrySecond).to.be.instanceOf(Object);
    expect(entrySecond).to.have.property('_id').to.be.a('string');
    expect(entrySecond).to.have.property('createdAt').to.be.a('number');
    expect(entrySecond).to.have.property('updatedAt').to.be.a('number');
    expect(entrySecond).to.have.property('cid').to.be.a('string');
    expect(entrySecond)
      .to.have.property('templateId')
      .to.be.a('string')
      .eq(idTemplate);
    expect(entrySecond.meta[0]).to.have.property('props').to.be.a('array');
    expect(entrySecond.meta[0].props[0])
      .to.have.property('id')
      .to.be.a('string')
      .eq(template.props[0].id);
    expect(entrySecond.meta[0].props[1])
      .to.have.property('id')
      .to.be.a('string')
      .eq(template.props[1].id);
    ObjectUtil.eq(
      entrySecond,
      {
        status: '',
        userId: '111111111111111111111111',
        meta: [
          {
            lng: 'en',
            props: [
              {
                data: ['Second'],
              },
              {
                data: ['Second'],
              },
            ],
          },
        ],
        content: [{ lng: 'en', nodes: [] }],
      },
      'entry',
    );
  });
  it('should be able to update an entry', async () => {
    const updateEntry = await sdk.entry.update({
      _id: idEntry,
      templateId: idTemplate,
      status: '',
      meta: [
        {
          lng: 'en',
          props: [
            {
              id: propIdFirst,
              data: ['Update test'],
            },
            {
              id: propIdSecond,
              data: ['Test2'],
            },
          ],
        },
      ],
      content: [{ lng: 'en', nodes: [] }],
    });
    expect(updateEntry).to.be.instanceOf(Object);
    expect(updateEntry).to.have.property('_id').to.be.a('string');
    expect(updateEntry).to.have.property('createdAt').to.be.a('number');
    expect(updateEntry).to.have.property('updatedAt').to.be.a('number');
    expect(updateEntry).to.have.property('cid').to.be.a('string');
    expect(updateEntry)
      .to.have.property('templateId')
      .to.be.a('string')
      .eq(idTemplate);
    expect(updateEntry.meta[0]).to.have.property('props').to.be.a('array');
    expect(updateEntry.meta[0].props[0])
      .to.have.property('id')
      .to.be.a('string')
      .eq(propIdFirst);
    expect(updateEntry.meta[0].props[1])
      .to.have.property('id')
      .to.be.a('string')
      .eq(propIdSecond);
    ObjectUtil.eq(
      updateEntry,
      {
        status: '',
        userId: '111111111111111111111111',
        meta: [
          {
            lng: 'en',
            props: [
              {
                data: ['Update test'],
              },
              {
                data: ['Test2'],
              },
            ],
          },
        ],
        content: [{ lng: 'en', nodes: [] }],
      },
      'entry',
    );
  });
  it(' should get number of entries by template ID', async () => {
    const result = await sdk.entry.count({ templateId: idTemplate });
    expect(result).to.be.a('number');
  });
  it('should get an entry', async () => {
    const entry = await sdk.entry.get({
      templateId: idTemplate,
      entryId: idEntry,
    });
    expect(entry).to.be.instanceOf(Object);
    expect(entry).to.have.property('_id').to.be.a('string');
    expect(entry).to.have.property('createdAt').to.be.a('number');
    expect(entry).to.have.property('updatedAt').to.be.a('number');
    expect(entry).to.have.property('cid').to.be.a('string');
    expect(entry)
      .to.have.property('templateId')
      .to.be.a('string')
      .eq(idTemplate);
    expect(entry.meta[0]).to.have.property('props').to.be.a('array');
    expect(entry.meta[0].props[0])
      .to.have.property('id')
      .to.be.a('string')
      .eq(propIdFirst);
    expect(entry.meta[0].props[1])
      .to.have.property('id')
      .to.be.a('string')
      .eq(propIdSecond);
    ObjectUtil.eq(
      entry,
      {
        status: '',
        userId: '111111111111111111111111',
        meta: [
          {
            lng: 'en',
            props: [
              {
                data: ['Update test'],
              },
              {
                data: ['Test2'],
              },
            ],
          },
        ],
        content: [{ lng: 'en', nodes: [] }],
      },
      'entry',
    );
  });
  it('should get an entry with Lite model', async () => {
    const entryLite = await sdk.entry.getLite({
      templateId: idTemplate,
      entryId: idEntry,
    });
    expect(entryLite).to.be.instanceOf(Object);
    expect(entryLite).to.have.property('_id').to.be.a('string');
    expect(entryLite).to.have.property('createdAt').to.be.a('number');
    expect(entryLite).to.have.property('updatedAt').to.be.a('number');
    expect(entryLite).to.have.property('cid').to.be.a('string');
    expect(entryLite)
      .to.have.property('templateId')
      .to.be.a('string')
      .eq(idTemplate);
    expect(entryLite.meta[0]).to.have.property('props').to.be.a('array');
    expect(entryLite.meta[0].props[0])
      .to.have.property('id')
      .to.be.a('string')
      .eq(propIdFirst);
    expect(entryLite.meta[0].props[1])
      .to.have.property('id')
      .to.be.a('string')
      .eq(propIdSecond);
    ObjectUtil.eq(
      entryLite,
      {
        userId: '111111111111111111111111',
        meta: [
          {
            lng: 'en',
            props: [
              {
                data: ['Update test'],
              },
              {
                data: ['Test2'],
              },
            ],
          },
        ],
      },
      'entry',
    );
  });
  it('should get many entries with Lite models in 1 request', async () => {
    const entryLites = await sdk.entry.getManyLite({
      templateId: idTemplate,
      entryIds: [idEntry, idEntrySecond],
    });
    for (let i = 0; i < entryLites.length; i++) {
      const entryLite = entryLites[i];
      expect(entryLite).to.be.instanceOf(Object);
      expect(entryLite).to.have.property('_id').to.be.a('string');
      expect(entryLite).to.have.property('createdAt').to.be.a('number');
      expect(entryLite).to.have.property('updatedAt').to.be.a('number');
      expect(entryLite).to.have.property('cid').to.be.a('string');
      expect(entryLite)
        .to.have.property('templateId')
        .to.be.a('string')
        .eq(idTemplate);
      expect(entryLite)
        .to.have.property('userId')
        .to.be.a('string')
        .eq('111111111111111111111111');
      expect(entryLite).to.have.property('meta').to.be.a('array');
      expect(entryLite.meta[0]).to.have.property('props').to.be.a('array');
      expect(entryLite.meta[0].props[0])
        .to.have.property('id')
        .to.be.a('string');
      expect(entryLite.meta[0].props[0])
        .to.have.property('data')
        .to.be.a('array');
      expect(entryLite.meta[0].props[1])
        .to.have.property('id')
        .to.be.a('string');
      expect(entryLite.meta[0].props[1])
        .to.have.property('data')
        .to.be.a('array');
    }
  });
  it('should get all entries with Lite models by template ID', async () => {
    const entryLites = await sdk.entry.getAllLite({
      templateId: idTemplate,
    });
    for (let i = 0; i < entryLites.length; i++) {
      const entryLite = entryLites[i];
      expect(entryLite).to.be.instanceOf(Object);
      expect(entryLite).to.have.property('_id').to.be.a('string');
      expect(entryLite).to.have.property('createdAt').to.be.a('number');
      expect(entryLite).to.have.property('updatedAt').to.be.a('number');
      expect(entryLite).to.have.property('cid').to.be.a('string');
      expect(entryLite)
        .to.have.property('templateId')
        .to.be.a('string')
        .eq(idTemplate);
      expect(entryLite)
        .to.have.property('userId')
        .to.be.a('string')
        .eq('111111111111111111111111');
      expect(entryLite).to.have.property('meta').to.be.a('array');
      expect(entryLite.meta[0]).to.have.property('props').to.be.a('array');
      expect(entryLite.meta[0].props[0])
        .to.have.property('id')
        .to.be.a('string');
      expect(entryLite.meta[0].props[0])
        .to.have.property('data')
        .to.be.a('array');
      expect(entryLite.meta[0].props[1])
        .to.have.property('id')
        .to.be.a('string');
      expect(entryLite.meta[0].props[1])
        .to.have.property('data')
        .to.be.a('array');
    }
  });
  it('should be able to delete an entry', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idEntry).to.be.a('string');
    const result = await sdk.entry.deleteById({
      templateId: idTemplate,
      entryId: idEntry,
    });
    expect(result).eq('Success.');
    expect(idTemplate).to.be.a('string');
    const deleteTemplate = await sdk.template.deleteById(idTemplate);
    expect(deleteTemplate).eq('Success.');
  });
  let idGroup: string;
  let idGroupProp: string;
  let idWidget: string;
  let idWidgetProp: string;
  let stringFirstId: string;
  let stringSecondId: string;
  let numberPropId: string;
  let booleanPropId: string;
  let richTextPropId: string;
  let colorPickerPropId: string;
  let groupPointerPropId: string;
  let entryPointerPropId: string;
  let widgetPointerPropId: string;
  let datePointerPropId: string;
  let mediaPointerPropId: string;
  let enumPointerPropId: string;
  let tagPointerPropId: string;
  let idEntryTemplate2: string;
  let secondColorId: string;
  let idMedia: string;
  let idTag: string;
  it('should create a data which will be used in next tests', async () => {
    const group = await sdk.group.create({
      label: 'G1',
      desc: 'G1',
    });
    idGroup = group._id;
    expect(group).to.be.instanceOf(Object);
    expect(group).to.have.property('_id').to.be.a('string');
    expect(group).to.have.property('createdAt').to.be.a('number');
    expect(group).to.have.property('updatedAt').to.be.a('number');
    expect(group).to.have.property('cid').to.be.a('string');
    expect(group).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      group,
      {
        desc: 'G1',
        label: 'G1',
        name: 'g1',
      },
      'group',
    );
    const updateGroup = await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          add: {
            label: 'First string',
            type: BCMSPropType.STRING,
            required: true,
            array: false,
            defaultData: ['This is first string'],
          },
        },
      ],
    });
    idGroup = updateGroup._id;
    idGroupProp = updateGroup.props[0].id;
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', [
      'This is first string',
    ]);
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'G1',
        label: 'G1',
        name: 'g1',
        props: [
          {
            name: 'first_string',
            label: 'First string',
            array: false,
            required: true,
            type: 'STRING',
          },
        ],
      },
      'group',
    );
    const template2 = await sdk.template.create({
      label: 'T2',
      desc: 'T2',
      singleEntry: true,
    });

    idTemplate2 = template2._id;
    const file = await fs.readFile(
      path.join(__dirname, '..', 'assets', 'image.jpeg'),
    );
    const media = await sdk.media.createFile({
      file,
      fileName: 'image.jpeg',
    });
    idMedia = media._id;
    expect(template2).to.be.instanceOf(Object);
    expect(template2).to.have.property('_id').to.be.a('string');
    expect(template2).to.have.property('createdAt').to.be.a('number');
    expect(template2).to.have.property('updatedAt').to.be.a('number');
    expect(template2).to.have.property('cid').to.be.a('string');
    expect(template2).to.have.property('props').to.be.a('array');
    expect(template2.props[0]).to.have.property('id').to.be.a('string');
    expect(template2.props[1]).to.have.property('id').to.be.a('string');
    ObjectUtil.eq(
      template2,
      {
        name: 't2',
        label: 'T2',
        desc: 'T2',
        singleEntry: true,
        userId: '111111111111111111111111',
        props: [
          {
            label: 'Title',
            name: 'title',
            array: false,
            required: true,
            type: 'STRING',
            defaultData: [''],
          },
          {
            label: 'Slug',
            name: 'slug',
            array: false,
            required: true,
            type: 'STRING',
            defaultData: [''],
          },
        ],
      },
      'template',
    );
    const entryTemplate2 = await sdk.entry.create({
      templateId: idTemplate2,
      status: '',
      meta: [
        {
          lng: 'en',
          props: [
            {
              id: template2.props[0].id,
              data: ['Test'],
            },
            {
              id: template2.props[1].id,
              data: ['Test2'],
            },
          ],
        },
      ],
      content: [{ lng: 'en', nodes: [] }],
    });
    idEntryTemplate2 = entryTemplate2._id;
    const widget = await sdk.widget.create({
      label: 'W1',
      desc: 'W1',
      previewImage: 'old image',
      previewScript: 'old script',
      previewStyle: 'old style',
    });
    idWidget = widget._id;
    expect(widget).to.be.instanceOf(Object);
    expect(widget).to.have.property('_id').to.be.a('string');
    expect(widget).to.have.property('createdAt').to.be.a('number');
    expect(widget).to.have.property('updatedAt').to.be.a('number');
    expect(widget).to.have.property('cid').to.be.a('string');
    expect(widget).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      widget,
      {
        name: 'w1',
        label: 'W1',
        desc: 'W1',
        previewImage: 'old image',
        previewScript: 'old script',
        previewStyle: 'old style',
      },
      'widget',
    );
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          add: {
            label: 'First string',
            type: BCMSPropType.STRING,
            required: true,
            array: false,
            defaultData: ['This is first string'],
          },
        },
      ],
    });
    idWidgetProp = updateWidget.props[0].id;
    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');
    expect(updateWidget.props[0]).to.have.deep.property('defaultData', [
      'This is first string',
    ]);
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'W1',
        label: 'W1',
        name: 'w1',
        previewImage: 'old image',
        previewScript: 'old script',
        previewStyle: 'old style',
        props: [
          {
            name: 'first_string',
            label: 'First string',
            array: false,
            required: true,
            type: 'STRING',
          },
        ],
      },
      'widget',
    );
    const tag = await sdk.tag.create({
      value: 'first',
    });
    idTag = tag._id;
    const template = await sdk.template.create({
      label: 'T1',
      desc: 'T1',
      singleEntry: true,
    });
    idTemplate = template._id;
    expect(template).to.be.instanceOf(Object);
    expect(template).to.have.property('_id').to.be.a('string');
    expect(template).to.have.property('createdAt').to.be.a('number');
    expect(template).to.have.property('updatedAt').to.be.a('number');
    expect(template).to.have.property('cid').to.be.a('string');
    expect(template).to.have.property('props').to.be.a('array');
    expect(template.props[0]).to.have.property('id').to.be.a('string');
    expect(template.props[1]).to.have.property('id').to.be.a('string');
    ObjectUtil.eq(
      template,
      {
        name: 't1',
        label: 'T1',
        desc: 'T1',
        singleEntry: true,
        userId: '111111111111111111111111',
        props: [
          {
            label: 'Title',
            name: 'title',
            array: false,
            required: true,
            type: 'STRING',
            defaultData: [''],
          },
          {
            label: 'Slug',
            name: 'slug',
            array: false,
            required: true,
            type: 'STRING',
            defaultData: [''],
          },
        ],
      },
      'template',
    );
    const secondColor = await sdk.color.create({
      label: 'black',
      value: '#030505',
      global: true,
    });
    secondColorId = secondColor._id;
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          add: {
            label: 'One number',
            type: BCMSPropType.NUMBER,
            required: true,
            array: false,
            defaultData: [2],
          },
        },
        {
          add: {
            label: 'One boolean prop',
            type: BCMSPropType.BOOLEAN,
            required: true,
            array: false,
            defaultData: [true],
          },
        },
        {
          add: {
            label: 'Color Picker',
            type: BCMSPropType.COLOR_PICKER,
            required: true,
            array: false,
            defaultData: {
              allowCustom: false,
              allowGlobal: false,
              selected: [secondColorId],
            },
          },
        },
        {
          add: {
            label: 'Rich text',
            type: BCMSPropType.RICH_TEXT,
            required: true,
            array: false,
            defaultData: [
              {
                nodes: [],
              },
            ],
          },
        },
        {
          add: {
            label: 'group pointer',
            type: BCMSPropType.GROUP_POINTER,
            required: true,
            array: false,
            defaultData: {
              _id: idGroup,
            },
          },
        },
        {
          add: {
            label: 'Entry pointer',
            type: BCMSPropType.ENTRY_POINTER,
            required: true,
            array: false,
            defaultData: [
              {
                templateId: idTemplate2,
                entryIds: [idEntryTemplate2],
                displayProp: 'title',
              },
            ],
          },
        },
        {
          add: {
            label: 'Date',
            type: BCMSPropType.DATE,
            required: true,
            array: false,
            defaultData: ['619CD2FF', '619CD324'],
          },
        },
        {
          add: {
            label: 'Widget',
            type: BCMSPropType.WIDGET,
            required: true,
            array: false,
            defaultData: { _id: idWidget },
          },
        },
        {
          add: {
            label: 'Media',
            type: BCMSPropType.MEDIA,
            required: true,
            array: false,
            defaultData: [idMedia],
          },
        },
        {
          add: {
            label: 'Enum',
            type: BCMSPropType.ENUMERATION,
            required: true,
            array: false,
            defaultData: { items: ['one', 'two', 'six'], selected: 'one' },
          },
        },
        {
          add: {
            label: 'Tag',
            type: BCMSPropType.TAG,
            required: true,
            array: false,
            defaultData: [idTag],
          },
        },
      ],
    });
    stringFirstId = updateTemplate.props[0].id;
    stringSecondId = updateTemplate.props[1].id;
    numberPropId = updateTemplate.props[2].id;
    booleanPropId = updateTemplate.props[3].id;
    colorPickerPropId = updateTemplate.props[4].id;
    richTextPropId = updateTemplate.props[5].id;
    groupPointerPropId = updateTemplate.props[6].id;
    entryPointerPropId = updateTemplate.props[7].id;
    datePointerPropId = updateTemplate.props[8].id;
    widgetPointerPropId = updateTemplate.props[9].id;
    mediaPointerPropId = updateTemplate.props[10].id;
    enumPointerPropId = updateTemplate.props[11].id;
    tagPointerPropId = updateTemplate.props[12].id;
    expect(updateTemplate).to.be.instanceOf(Object);
    expect(updateTemplate)
      .to.have.property('_id')
      .to.be.a('string')
      .eq(idTemplate);
    expect(updateTemplate).to.have.property('createdAt').to.be.a('number');
    expect(updateTemplate).to.have.property('updatedAt').to.be.a('number');
    expect(updateTemplate).to.have.property('cid').to.be.a('string');
    expect(updateTemplate).to.have.property('props').to.be.a('array');
    expect(updateTemplate.props[0]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[1]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[2]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[3]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[4]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[5]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[6]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[7]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[8]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[9]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[10]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[11]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[12]).to.have.property('id').to.be.a('string');
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'T1',
        label: 'T1',
        name: 't1',
        singleEntry: true,
        userId: '111111111111111111111111',
        props: [
          {
            label: 'Title',
            name: 'title',
            array: false,
            required: true,
            type: 'STRING',
            defaultData: [''],
          },
          {
            label: 'Slug',
            name: 'slug',
            array: false,
            required: true,
            type: 'STRING',
            defaultData: [''],
          },
          {
            name: 'one_number',
            label: 'One number',
            array: false,
            required: true,
            type: 'NUMBER',
          },
          {
            name: 'one_boolean_prop',
            label: 'One boolean prop',
            array: false,
            required: true,
            type: 'BOOLEAN',
          },
          {
            name: 'color_picker',
            label: 'Color Picker',
            array: false,
            required: true,
            type: 'COLOR_PICKER',
          },
          {
            name: 'rich_text',
            label: 'Rich text',
            array: false,
            required: true,
            type: 'RICH_TEXT',
          },
          {
            name: 'group_pointer',
            label: 'group pointer',
            array: false,
            required: true,
            type: 'GROUP_POINTER',
          },
          {
            name: 'entry_pointer',
            label: 'Entry pointer',
            array: false,
            required: true,
            type: 'ENTRY_POINTER',
          },
          {
            name: 'date',
            label: 'Date',
            array: false,
            required: true,
            type: 'DATE',
          },
          {
            name: 'widget',
            label: 'Widget',
            array: false,
            required: true,
            type: 'WIDGET',
          },
          {
            name: 'media',
            label: 'Media',
            array: false,
            required: true,
            type: 'MEDIA',
          },
          {
            name: 'enum',
            label: 'Enum',
            array: false,
            required: true,
            type: 'ENUMERATION',
          },
          {
            name: 'tag',
            label: 'Tag',
            array: false,
            required: true,
            type: 'TAG',
          },
        ],
      },
      'template',
    );
  });

  it(' should create an entry with all props', async () => {
    const entry = await sdk.entry.create({
      templateId: idTemplate,
      status: '',
      meta: [
        {
          lng: 'en',
          props: [
            {
              id: stringFirstId,
              data: ['Test'],
            },
            {
              id: stringSecondId,
              data: ['Test2'],
            },
            {
              id: numberPropId,
              data: [6],
            },
            {
              id: booleanPropId,
              data: [false],
            },
            {
              id: colorPickerPropId,
              data: [secondColorId],
            },
            {
              id: richTextPropId,
              data: [
                {
                  nodes: [],
                },
              ],
            },
            {
              id: groupPointerPropId,
              data: {
                _id: idGroup,
                items: [
                  {
                    props: [
                      {
                        id: idGroupProp,
                        data: ['This is test'],
                      },
                    ],
                  },
                ],
              },
            },
            {
              id: entryPointerPropId,
              data: [idEntryTemplate2],
            },
            {
              id: datePointerPropId,
              data: ['619CD324'],
            },
            {
              id: widgetPointerPropId,
              data: {
                _id: idWidget,
                props: [
                  {
                    id: idWidgetProp,
                    data: ['ok'],
                  },
                ],
              },
            },
            {
              id: mediaPointerPropId,
              data: [idMedia],
            },
            {
              id: enumPointerPropId,
              data: ['one'],
            },
            {
              id: tagPointerPropId,
              data: [idTag],
            },
          ],
        },
      ],
      content: [{ lng: 'en', nodes: [] }],
    });
    idEntry = entry._id;
    expect(entry).to.be.instanceOf(Object);
    expect(entry).to.have.property('_id').to.be.a('string');
    expect(entry).to.have.property('createdAt').to.be.a('number');
    expect(entry).to.have.property('updatedAt').to.be.a('number');
    expect(entry).to.have.property('cid').to.be.a('string');
    expect(entry)
      .to.have.property('templateId')
      .to.be.a('string')
      .eq(idTemplate);
    expect(entry.meta[0]).to.have.property('props').to.be.a('array');
    expect(entry.meta[0].props[0]).to.have.property('id').to.be.a('string');
    expect(entry.meta[0].props[1]).to.have.property('id').to.be.a('string');
    expect(entry.meta[0].props[2]).to.have.property('id').to.be.a('string');
    expect(entry.meta[0].props[3]).to.have.property('id').to.be.a('string');
    expect(entry.meta[0].props[4]).to.have.property('id').to.be.a('string');
    expect(entry.meta[0].props[5]).to.have.property('id').to.be.a('string');
    expect(entry.meta[0].props[6]).to.have.property('id').to.be.a('string');
    expect(entry.meta[0].props[7]).to.have.property('id').to.be.a('string');
    expect(entry.meta[0].props[8]).to.have.property('id').to.be.a('string');
    expect(entry.meta[0].props[9]).to.have.property('id').to.be.a('string');
    expect(entry.meta[0].props[10]).to.have.property('id').to.be.a('string');
    expect(entry.meta[0].props[11]).to.have.property('id').to.be.a('string');
    expect(entry.meta[0].props[12]).to.have.property('id').to.be.a('string');
    ObjectUtil.eq(
      entry,
      {
        status: '',
        userId: '111111111111111111111111',
        meta: [
          {
            lng: 'en',
            props: [
              {
                data: ['Test'],
              },
              {
                data: ['Test2'],
              },
              {
                data: [6],
              },
              {
                data: [false],
              },
              {
                data: [secondColorId],
              },
              {
                data: [
                  {
                    nodes: [],
                  },
                ],
              },
              {
                data: {
                  _id: idGroup,
                  items: [
                    {
                      props: [
                        {
                          id: idGroupProp,
                          data: ['This is test'],
                        },
                      ],
                    },
                  ],
                },
              },

              {
                id: entryPointerPropId,
                data: [idEntryTemplate2],
              },
              {
                id: datePointerPropId,
                data: ['619CD324'],
              },
              {
                id: widgetPointerPropId,
                data: {
                  _id: idWidget,
                  props: [
                    {
                      id: idWidgetProp,
                      data: ['ok'],
                    },
                  ],
                },
              },
              {
                id: mediaPointerPropId,
                data: [idMedia],
              },
              {
                id: enumPointerPropId,
                data: ['one'],
              },
              {
                id: tagPointerPropId,
                data: [idTag],
              },
            ],
          },
        ],
        content: [{ lng: 'en', nodes: [] }],
      },
      'entry',
    );
  });
  it('should get all parsed entries by template ID', async () => {
    const entry = await sdk.entry.getAllParsed({ templateId: idTemplate });
    expect(entry[0].meta).to.have.deep.property('en', {
      title: 'Test',
      slug: 'Test2',
      date: '619CD324',
      one_number: 6,
      one_boolean_prop: false,
      color_picker: '#030505',
      entry_pointer: {
        en: {
          _id: idEntryTemplate2,
          slug: 'Test2',
          title: 'Test',
        },
      },
      group_pointer: {
        first_string: 'This is test',
      },
      media: {
        _id: idMedia,
        alt_text: '',
        caption: '',
        height: 700,
        name: 'image.jpeg',
        src: '/image.jpeg',
        width: 1120,
      },
      widget: {
        first_string: 'ok',
      },
      enum: {
        items: ['one', 'two', 'six'],
        selected: 'one',
      },
      tag: idTag,
    });
  });
  it('should get one parsed entry by template ID', async () => {
    const entry = await sdk.entry.getOneParsed({
      templateId: idTemplate,
      entryId: idEntry,
    });
    expect(entry.meta).to.have.deep.property('en', {
      title: 'Test',
      slug: 'Test2',
      date: '619CD324',
      one_number: 6,
      one_boolean_prop: false,
      color_picker: '#030505',
      entry_pointer: {
        en: {
          _id: idEntryTemplate2,
          slug: 'Test2',
          title: 'Test',
        },
      },
      group_pointer: {
        first_string: 'This is test',
      },
      media: {
        _id: idMedia,
        alt_text: '',
        caption: '',
        height: 700,
        name: 'image.jpeg',
        src: '/image.jpeg',
        width: 1120,
      },
      widget: {
        first_string: 'ok',
      },
      enum: {
        items: ['one', 'two', 'six'],
        selected: 'one',
      },
      tag: idTag,
    });
  });
  it('should clear test data', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idEntry).to.be.a('string');
    const result = await sdk.entry.deleteById({
      templateId: idTemplate,
      entryId: idEntry,
    });
    expect(result).eq('Success.');
    expect(idTemplate).to.be.a('string');
    const deleteTemplate = await sdk.template.deleteById(idTemplate);
    expect(deleteTemplate).eq('Success.');
  });
});

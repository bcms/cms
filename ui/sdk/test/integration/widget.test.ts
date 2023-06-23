import { expect } from 'chai';
import { BCMSPropType } from '../../src/types';
import { Login, ObjectUtil, sdk } from '../util';

describe('Widget API', async () => {
  Login();
  let idWidget: string;
  let idWidgetSecond: string;
  let cidWidget: string;
  let cidSecondWidget: string;
  it('should be able to create a widget', async () => {
    const widget = await sdk.widget.create({
      label: 'First Widget',
      desc: 'First Widget',
      previewImage: 'old image',
      previewScript: 'old script',
      previewStyle: 'old style',
    });
    idWidget = widget._id;
    cidWidget = widget.cid;
    expect(widget).to.be.instanceOf(Object);
    expect(widget).to.have.property('_id').to.be.a('string');
    expect(widget).to.have.property('createdAt').to.be.a('number');
    expect(widget).to.have.property('updatedAt').to.be.a('number');
    expect(widget).to.have.property('cid').to.be.a('string');
    expect(widget).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      widget,
      {
        name: 'first_widget',
        label: 'First Widget',
        desc: 'First Widget',
        previewImage: 'old image',
        previewScript: 'old script',
        previewStyle: 'old style',
      },
      'widget',
    );
    const secondWidget = await sdk.widget.create({
      label: 'Second Widget',
      desc: 'Second Widget',
      previewImage: 'old image',
      previewScript: 'old script',
      previewStyle: 'old style',
    });
    idWidgetSecond = secondWidget._id;
    cidSecondWidget = secondWidget.cid;
    expect(secondWidget).to.be.instanceOf(Object);
    expect(secondWidget).to.have.property('_id').to.be.a('string');
    expect(secondWidget).to.have.property('createdAt').to.be.a('number');
    expect(secondWidget).to.have.property('updatedAt').to.be.a('number');
    expect(secondWidget).to.have.property('cid').to.be.a('string');
    expect(secondWidget).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      secondWidget,
      {
        name: 'second_widget',
        label: 'Second Widget',
        desc: 'Second Widget',
        previewImage: 'old image',
        previewScript: 'old script',
        previewStyle: 'old style',
      },
      'widget',
    );
  });
  it('should be able to update widget', async () => {
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      label: 'Update Widget',
      desc: 'Update Widget',
      previewImage: 'new image',
      previewScript: 'new script',
      previewStyle: 'new style',
      propChanges: [],
    });
    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'Update Widget',
        label: 'Update Widget',
        name: 'update_widget',
        previewImage: 'new image',
        previewScript: 'new script',
        previewStyle: 'new style',
      },
      'widget',
    );
  });
  it('should show all widget', async () => {
    const results = await sdk.widget.getAll();
    expect(results).to.be.a('array');
    expect(results.length).gte(0);
    for (let i = 0; i < results.length; i++) {
      const widget = results[i];
      expect(widget).to.be.instanceOf(Object);
      expect(widget).to.have.property('_id').to.be.a('string');
      expect(widget).to.have.property('createdAt').to.be.a('number');
      expect(widget).to.have.property('updatedAt').to.be.a('number');
      expect(widget).to.have.property('cid').to.be.a('string');
      expect(widget).to.have.property('label').to.be.a('string');
      expect(widget).to.have.property('name').to.be.a('string');
      expect(widget).to.have.property('desc').to.be.a('string');
      expect(widget).to.have.property('previewImage').to.be.a('string');
      expect(widget).to.have.property('previewScript').to.be.a('string');
      expect(widget).to.have.property('previewStyle').to.be.a('string');
      expect(widget).to.have.property('props').to.be.a('array');
    }
  });
  it('should be able to get many widget in 1 request', async () => {
    const manyId = [cidWidget, cidSecondWidget];
    expect(manyId).to.be.a('array');
    const results = await sdk.widget.getMany(manyId);
    expect(results).to.be.a('array');
    expect(results.length).gte(0);
    for (let i = 0; i < results.length; i++) {
      const widget = results[i];
      expect(widget).to.be.instanceOf(Object);
      expect(widget).to.have.property('_id').to.be.a('string');
      expect(widget).to.have.property('createdAt').to.be.a('number');
      expect(widget).to.have.property('updatedAt').to.be.a('number');
      expect(widget).to.have.property('cid').to.be.a('string').eq(manyId[i]);
      expect(widget).to.have.property('label').to.be.a('string');
      expect(widget).to.have.property('name').to.be.a('string');
      expect(widget).to.have.property('desc').to.be.a('string');
      expect(widget).to.have.property('previewImage').to.be.a('string');
      expect(widget).to.have.property('previewScript').to.be.a('string');
      expect(widget).to.have.property('previewStyle').to.be.a('string');
      expect(widget).to.have.property('props').to.be.a('array');
    }
  });
  it('should get how many widget are available', async () => {
    const result = await sdk.widget.count();
    expect(result).to.be.a('number');
  });
  it('should be able to get a widget', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idWidgetSecond).to.be.a('string');
    const widget = await sdk.widget.get(idWidgetSecond);
    expect(widget).to.be.instanceOf(Object);
    expect(widget).to.have.property('_id').to.be.a('string').eq(idWidgetSecond);
    expect(widget).to.have.property('createdAt').to.be.a('number');
    expect(widget).to.have.property('updatedAt').to.be.a('number');
    expect(widget).to.have.property('cid').to.be.a('string');
    expect(widget).to.have.property('label').to.be.a('string');
    expect(widget).to.have.property('name').to.be.a('string');
    expect(widget).to.have.property('desc').to.be.a('string');
    expect(widget).to.have.property('previewImage').to.be.a('string');
    expect(widget).to.have.property('previewScript').to.be.a('string');
    expect(widget).to.have.property('previewStyle').to.be.a('string');
    expect(widget).to.have.property('props').to.be.a('array');
  });
  it('should fail when trying to get a widget that does not exist', async () => {
    try {
      const widget = await sdk.widget.get('6184f06acbf8c33bfe92b042');
      expect(widget).to.be.instanceOf(Object);
      expect(widget)
        .to.have.property('_id')
        .to.be.a('string')
        .eq(idWidgetSecond);
      expect(widget).to.have.property('createdAt').to.be.a('number');
      expect(widget).to.have.property('updatedAt').to.be.a('number');
      expect(widget).to.have.property('cid').to.be.a('string');
      expect(widget).to.have.property('label').to.be.a('string');
      expect(widget).to.have.property('name').to.be.a('string');
      expect(widget).to.have.property('desc').to.be.a('string');
      expect(widget).to.have.property('previewImage').to.be.a('string');
      expect(widget).to.have.property('previewScript').to.be.a('string');
      expect(widget).to.have.property('previewStyle').to.be.a('string');
      expect(widget).to.have.property('props').to.be.a('array');
    } catch (error) {
      expect(error).to.be.an('object').to.have.property('code').to.eq('wid001');
    }
  });
  it('should be able to add STRING prop to a widget', async () => {
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
        desc: 'Update Widget',
        label: 'Update Widget',
        name: 'update_widget',
        previewImage: 'new image',
        previewScript: 'new script',
        previewStyle: 'new style',
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
    await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          remove: updateWidget.props[0].id,
        },
      ],
    });
  });
  it('should be able to add STRING Array prop to a widget', async () => {
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          add: {
            label: 'Array string',
            type: BCMSPropType.STRING,
            required: true,
            array: true,
            defaultData: ['This is first string', 'This is second string'],
          },
        },
      ],
    });

    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');
    expect(updateWidget.props[0]).to.have.deep.property('defaultData', [
      'This is first string',
      'This is second string',
    ]);
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'Update Widget',
        label: 'Update Widget',
        name: 'update_widget',
        previewImage: 'new image',
        previewScript: 'new script',
        previewStyle: 'new style',
        props: [
          {
            name: 'array_string',
            label: 'Array string',
            array: true,
            required: true,
            type: 'STRING',
          },
        ],
      },
      'widget',
    );
    await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          remove: updateWidget.props[0].id,
        },
      ],
    });
  });
  it('should be able to add NUMBER prop to a widget', async () => {
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          add: {
            label: 'One number',
            type: BCMSPropType.NUMBER,
            required: true,
            array: false,
            defaultData: [5],
          },
        },
      ],
    });
    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');
    expect(updateWidget.props[0]).to.have.deep.property('defaultData', [5]);
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'Update Widget',
        label: 'Update Widget',
        name: 'update_widget',
        previewImage: 'new image',
        previewScript: 'new script',
        previewStyle: 'new style',
        props: [
          {
            name: 'one_number',
            label: 'One number',
            array: false,
            required: true,
            type: 'NUMBER',
          },
        ],
      },
      'widget',
    );
    await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          remove: updateWidget.props[0].id,
        },
      ],
    });
  });
  it('should be able to add NUMBER Array prop to a widget', async () => {
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          add: {
            label: 'Array number',
            type: BCMSPropType.NUMBER,
            required: true,
            array: true,
            defaultData: [5, 4, 7, 9],
          },
        },
      ],
    });
    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');
    expect(updateWidget.props[0]).to.have.deep.property(
      'defaultData',
      [5, 4, 7, 9],
    );
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'Update Widget',
        label: 'Update Widget',
        name: 'update_widget',
        previewImage: 'new image',
        previewScript: 'new script',
        previewStyle: 'new style',
        props: [
          {
            name: 'array_number',
            label: 'Array number',
            array: true,
            required: true,
            type: 'NUMBER',
          },
        ],
      },
      'widget',
    );
    await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          remove: updateWidget.props[0].id,
        },
      ],
    });
  });
  it('should be able to add BOOLEAN prop to a widget', async () => {
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          add: {
            label: 'One boolean prop',
            type: BCMSPropType.BOOLEAN,
            required: true,
            array: false,
            defaultData: [true],
          },
        },
      ],
    });
    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');
    expect(updateWidget.props[0]).to.have.deep.property('defaultData', [true]);
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'Update Widget',
        label: 'Update Widget',
        name: 'update_widget',
        previewImage: 'new image',
        previewScript: 'new script',
        previewStyle: 'new style',
        props: [
          {
            name: 'one_boolean_prop',
            label: 'One boolean prop',
            array: false,
            required: true,
            type: 'BOOLEAN',
          },
        ],
      },
      'widget',
    );
    await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          remove: updateWidget.props[0].id,
        },
      ],
    });
  });
  it('should be able to add BOOLEAN Array prop to a widget', async () => {
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          add: {
            label: 'Array boolean',
            type: BCMSPropType.BOOLEAN,
            required: true,
            array: true,
            defaultData: [true, false, true, true],
          },
        },
      ],
    });
    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');
    expect(updateWidget.props[0]).to.have.deep.property('defaultData', [
      true,
      false,
      true,
      true,
    ]);
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'Update Widget',
        label: 'Update Widget',
        name: 'update_widget',
        previewImage: 'new image',
        previewScript: 'new script',
        previewStyle: 'new style',
        props: [
          {
            name: 'array_boolean',
            label: 'Array boolean',
            array: true,
            required: true,
            type: 'BOOLEAN',
          },
        ],
      },
      'widget',
    );
    await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          remove: updateWidget.props[0].id,
        },
      ],
    });
  });
  //   it('should be able to add DATE prop to a widget', async () => {
  //     const updateWidget = await sdk.widget.update({
  //       _id: idWidget,
  //       propChanges: [
  //         {
  //           add: {
  //             label: 'Date',
  //             type: BCMSPropType.DATE,
  //             required: true,
  //             array: false,
  //             defaultData: [1636364095],
  //           },
  //         },
  //       ],
  //     });
  //     expect(updateWidget).to.be.instanceOf(Object);
  //     expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
  //     expect(updateWidget).to.have.property('createdAt').to.be.a('number');
  //     expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
  //     expect(updateWidget).to.have.property('cid').to.be.a('string');
  //     expect(updateWidget).to.have.property('props').to.be.a('array');
  //     expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');

  //     expect(updateWidget.props[0]).to.have.deep.property('defaultData', [
  //       1636364095,
  //     ]);

  //     ObjectUtil.eq(
  //       updateWidget,
  //       {
  //         desc: 'Update Widget',
  //         label: 'Update Widget',
  //         name: 'update_widget',
  //         previewImage: 'new image',
  //         previewScript: 'new script',
  //         previewStyle: 'new style',
  //         props: [
  //           {
  //             name: 'date',
  //             label: 'Date',
  //             array: false,
  //             required: true,
  //             type: 'DATE',
  //           },
  //         ],
  //       },
  //       'widget',
  //     );
  //     await sdk.widget.update({
  //       _id: idWidget,
  //       propChanges: [
  //         {
  //           remove: updateWidget.props[0].id,
  //         },
  //       ],
  //     });
  //   });
  let firstColorId: string;
  let secondColorId: string;
  let templateId: string;
  it('should be able to add COLOR_PICKER prop to a widget', async () => {
    const template = await sdk.template.create({
      label: 'Template',
      desc: 'Template',
      singleEntry: true,
    });
    templateId = template._id;
    expect(template).to.be.instanceOf(Object);
    expect(template).to.have.property('_id').to.be.a('string');
    expect(template).to.have.property('createdAt').to.be.a('number');
    expect(template).to.have.property('updatedAt').to.be.a('number');
    expect(template).to.have.property('cid').to.be.a('string');
    expect(template).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      template,
      {
        desc: 'Template',
        label: 'Template',
        name: 'template',
      },
      'template',
    );

    const firstColor = await sdk.color.create({
      label: 'red',
      value: '#030504',
      global: true,
    });
    firstColorId = firstColor._id;
    const secondColor = await sdk.color.create({
      label: 'black',
      value: '#030505',
      global: true,
    });
    secondColorId = secondColor._id;
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          add: {
            label: 'Color Picker',
            type: BCMSPropType.COLOR_PICKER,
            required: true,
            array: false,
            defaultData: {
              allowCustom: false,
              allowGlobal: false,
              selected: [secondColor._id],
            },
          },
        },
      ],
    });
    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');
    expect(updateWidget.props[0]).to.have.deep.property('defaultData', {
      allowCustom: false,
      options: [firstColor._id, secondColor._id],
      selected: [secondColor._id],
    });
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'Update Widget',
        label: 'Update Widget',
        name: 'update_widget',
        previewImage: 'new image',
        previewScript: 'new script',
        previewStyle: 'new style',
        props: [
          {
            name: 'color_picker',
            label: 'Color Picker',
            array: false,
            required: true,
            type: 'COLOR_PICKER',
          },
        ],
      },
      'widget',
    );
    await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          remove: updateWidget.props[0].id,
        },
      ],
    });
  });
  it('should be able to add COLOR_PICKER Array prop to a widget', async () => {
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          add: {
            label: 'Array Color Picker',
            type: BCMSPropType.COLOR_PICKER,
            required: true,
            array: true,
            defaultData: {
              allowCustom: true,
              allowGlobal: true,
              selected: [secondColorId, firstColorId],
            },
          },
        },
      ],
    });
    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');
    expect(updateWidget.props[0]).to.have.deep.property('defaultData', {
      allowCustom: true,
      options: [firstColorId],
      selected: [secondColorId, firstColorId],
    });
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'Update Widget',
        label: 'Update Widget',
        name: 'update_widget',
        previewImage: 'new image',
        previewScript: 'new script',
        previewStyle: 'new style',
        props: [
          {
            name: 'array_color_picker',
            label: 'Array Color Picker',
            array: true,
            required: true,
            type: 'COLOR_PICKER',
          },
        ],
      },
      'widget',
    );
    await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          remove: updateWidget.props[0].id,
        },
      ],
    });
    const deleteFirstColor = await sdk.color.deleteById(firstColorId);
    expect(deleteFirstColor).eq('Success.');
    const deleteSecondColor = await sdk.color.deleteById(secondColorId);
    expect(deleteSecondColor).eq('Success.');
    const deleteTemplate = await sdk.template.deleteById(templateId);
    expect(deleteTemplate).eq('Success.');
  });
  it('should be able to add RICH_TEXT prop to a widget', async () => {
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
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
      ],
    });
    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');
    expect(updateWidget.props[0]).to.have.deep.property('defaultData', [
      {
        nodes: [],
      },
    ]);
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'Update Widget',
        label: 'Update Widget',
        name: 'update_widget',
        previewImage: 'new image',
        previewScript: 'new script',
        previewStyle: 'new style',
        props: [
          {
            name: 'rich_text',
            label: 'Rich text',
            array: false,
            required: true,
            type: 'RICH_TEXT',
          },
        ],
      },
      'widget',
    );
    await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          remove: updateWidget.props[0].id,
        },
      ],
    });
  });
  it('should be able to add RICH_TEXT Array prop to a widget', async () => {
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          add: {
            label: 'Array rich text',
            type: BCMSPropType.RICH_TEXT,
            required: true,
            array: true,
            defaultData: [
              {
                nodes: [],
              },
              {
                nodes: [],
              },
            ],
          },
        },
      ],
    });
    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');
    expect(updateWidget.props[0]).to.have.deep.property('defaultData', [
      {
        nodes: [],
      },
      {
        nodes: [],
      },
    ]);
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'Update Widget',
        label: 'Update Widget',
        name: 'update_widget',
        previewImage: 'new image',
        previewScript: 'new script',
        previewStyle: 'new style',
        props: [
          {
            name: 'array_rich_text',
            label: 'Array rich text',
            array: true,
            required: true,
            type: 'RICH_TEXT',
          },
        ],
      },
      'widget',
    );
    await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          remove: updateWidget.props[0].id,
        },
      ],
    });
  });
  let idGroup: string;
  it('should be able to add GROUP_POINTER prop to a widget', async () => {
    const group = await sdk.group.create({
      label: 'group first',
      desc: 'group first',
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
        desc: 'group first',
        label: 'group first',
        name: 'group_first',
      },
      'group',
    );
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
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
      ],
    });
    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');
    expect(updateWidget.props[0]).to.have.deep.property('defaultData', {
      _id: idGroup,
    });
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'Update Widget',
        label: 'Update Widget',
        name: 'update_widget',
        previewImage: 'new image',
        previewScript: 'new script',
        previewStyle: 'new style',
        props: [
          {
            name: 'group_pointer',
            label: 'group pointer',
            array: false,
            required: true,
            type: 'GROUP_POINTER',
          },
        ],
      },
      'widget',
    );
    await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          remove: updateWidget.props[0].id,
        },
      ],
    });
  });
  it('should be able to add GROUP_POINTER Array prop to a widget', async () => {
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          add: {
            label: 'Array group pointer',
            type: BCMSPropType.GROUP_POINTER,
            required: true,
            array: true,
            defaultData: {
              _id: idGroup,
            },
          },
        },
      ],
    });
    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');
    expect(updateWidget.props[0]).to.have.deep.property('defaultData', {
      _id: idGroup,
    });
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'Update Widget',
        label: 'Update Widget',
        name: 'update_widget',
        previewImage: 'new image',
        previewScript: 'new script',
        previewStyle: 'new style',
        props: [
          {
            name: 'array_group_pointer',
            label: 'Array group pointer',
            array: true,
            required: true,
            type: 'GROUP_POINTER',
          },
        ],
      },
      'widget',
    );
    await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          remove: updateWidget.props[0].id,
        },
      ],
    });
    const result = await sdk.group.deleteById(idGroup);
    expect(result).eq('Success.');
  });
  it('should be able to delete a widget', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idWidget).to.be.a('string');
    const result = await sdk.widget.deleteById(idWidget);
    expect(result).eq('Success.');
    expect(idWidgetSecond).to.be.a('string');
    const secondResult = await sdk.widget.deleteById(idWidgetSecond);
    expect(secondResult).eq('Success.');
  });
  it('should check if GROUP_POINTER prop is removed if target group is deleted', async () => {
    const childGroup = await sdk.group.create({
      label: 'Child',
      desc: 'Child group',
    });
    idGroup = childGroup._id;
    expect(childGroup).to.be.instanceOf(Object);
    expect(childGroup).to.have.property('_id').to.be.a('string');
    expect(childGroup).to.have.property('createdAt').to.be.a('number');
    expect(childGroup).to.have.property('updatedAt').to.be.a('number');
    expect(childGroup).to.have.property('cid').to.be.a('string');
    expect(childGroup).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      childGroup,
      {
        desc: 'Child group',
        label: 'Child',
        name: 'child',
      },
      'group',
    );
    const parentWidget = await sdk.widget.create({
      label: 'Parent',
      desc: 'Parent Widget',
      previewImage: 'image',
      previewScript: 'script',
      previewStyle: 'style',
    });
    idWidget = parentWidget._id;
    expect(parentWidget).to.be.instanceOf(Object);
    expect(parentWidget).to.have.property('_id').to.be.a('string');
    expect(parentWidget).to.have.property('createdAt').to.be.a('number');
    expect(parentWidget).to.have.property('updatedAt').to.be.a('number');
    expect(parentWidget).to.have.property('cid').to.be.a('string');
    expect(parentWidget).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      parentWidget,
      {
        label: 'Parent',
        desc: 'Parent Widget',
        name: 'parent',
        previewImage: 'image',
        previewScript: 'script',
        previewStyle: 'style',
      },
      'widget',
    );
    const updateParentWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
        {
          add: {
            label: 'child group pointer',
            type: BCMSPropType.GROUP_POINTER,
            required: true,
            array: false,
            defaultData: {
              _id: idGroup,
            },
          },
        },
      ],
    });
    expect(updateParentWidget).to.be.instanceOf(Object);
    expect(updateParentWidget)
      .to.have.property('_id')
      .to.be.a('string')
      .eq(idWidget);
    expect(updateParentWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateParentWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateParentWidget).to.have.property('cid').to.be.a('string');
    expect(updateParentWidget).to.have.property('props').to.be.a('array');
    expect(updateParentWidget.props[0])
      .to.have.property('id')
      .to.be.a('string');
    expect(updateParentWidget.props[0]).to.have.deep.property('defaultData', {
      _id: idGroup,
    });
    ObjectUtil.eq(
      updateParentWidget,
      {
        label: 'Parent',
        desc: 'Parent Widget',
        name: 'parent',
        previewImage: 'image',
        previewScript: 'script',
        previewStyle: 'style',
        props: [
          {
            name: 'child_group_pointer',
            label: 'child group pointer',
            array: false,
            required: true,
            type: 'GROUP_POINTER',
          },
        ],
      },
      'widget',
    );
    const result = await sdk.group.deleteById(idGroup);
    expect(result).eq('Success.');
    const widget = await sdk.widget.get(idWidget);
    expect(widget).to.be.instanceOf(Object);
    expect(widget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(widget).to.have.property('createdAt').to.be.a('number');
    expect(widget).to.have.property('updatedAt').to.be.a('number');
    expect(widget).to.have.property('cid').to.be.a('string');
    expect(widget).to.have.property('label').to.be.a('string');
    expect(widget).to.have.property('name').to.be.a('string');
    expect(widget).to.have.property('desc').to.be.a('string');
    expect(widget).to.have.property('previewImage').to.be.a('string');
    expect(widget).to.have.property('previewScript').to.be.a('string');
    expect(widget).to.have.property('previewStyle').to.be.a('string');
    expect(widget).to.have.property('props').to.be.a('array').that.eql([]);
  });
  it(' should clear test data', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idWidget).to.be.a('string');
    const result = await sdk.widget.deleteById(idWidget);
    expect(result).eq('Success.');
  });
});

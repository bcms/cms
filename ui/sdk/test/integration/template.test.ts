import { expect } from 'chai';
import { BCMSPropType } from '../../src/types';
import { Login, ObjectUtil, sdk } from '../util';

describe('Template API', async () => {
  Login();
  let idTemplate: string;
  let idTemplateSecond: string;
  let cidTemplate: string;
  let cidTemplateSecond: string;
  it('should be able to create a template', async () => {
    const template = await sdk.template.create({
      label: 'First template',
      desc: 'First template',
      singleEntry: true,
    });

    idTemplate = template._id;
    cidTemplate = template.cid;
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
        name: 'first_template',
        label: 'First template',
        desc: 'First template',
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
    const secondTemplate = await sdk.template.create({
      label: 'Second template',
      desc: 'Second template',
      singleEntry: true,
    });
    idTemplateSecond = secondTemplate._id;
    cidTemplateSecond = secondTemplate.cid;
    expect(secondTemplate).to.be.instanceOf(Object);
    expect(secondTemplate).to.have.property('_id').to.be.a('string');
    expect(secondTemplate).to.have.property('createdAt').to.be.a('number');
    expect(secondTemplate).to.have.property('updatedAt').to.be.a('number');
    expect(secondTemplate).to.have.property('cid').to.be.a('string');
    expect(secondTemplate).to.have.property('props').to.be.a('array');
    expect(template.props[0]).to.have.property('id').to.be.a('string');
    expect(template.props[1]).to.have.property('id').to.be.a('string');
    ObjectUtil.eq(
      secondTemplate,
      {
        name: 'second_template',
        label: 'Second template',
        desc: 'Second template',
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
  });
  it('should be able to update template', async () => {
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
      label: 'Update template',
      desc: 'Update template',
      singleEntry: true,
    });
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
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Update template',
        label: 'Update template',
        name: 'update_template',
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
  });
  it('should show all template', async () => {
    const results = await sdk.template.getAll();
    expect(results).to.be.a('array');
    expect(results.length).gte(0);
    for (let i = 0; i < results.length; i++) {
      const template = results[i];
      expect(template).to.be.instanceOf(Object);
      expect(template).to.have.property('_id').to.be.a('string');
      expect(template).to.have.property('createdAt').to.be.a('number');
      expect(template).to.have.property('updatedAt').to.be.a('number');
      expect(template).to.have.property('cid').to.be.a('string');
      expect(template).to.have.property('label').to.be.a('string');
      expect(template).to.have.property('name').to.be.a('string');
      expect(template).to.have.property('desc').to.be.a('string');
      expect(template).to.have.property('singleEntry').to.be.a('boolean');
      expect(template).to.have.property('props').to.be.a('array');
      expect(template.props[0]).to.have.property('id').to.be.a('string');
      expect(template.props[1]).to.have.property('id').to.be.a('string');
      ObjectUtil.eq(
        template,
        {
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
    }
  });
  it('should be able to get many template in 1 request', async () => {
    const manyId = [cidTemplate, cidTemplateSecond];
    expect(manyId).to.be.a('array');
    const results = await sdk.template.getMany(manyId);
    expect(results).to.be.a('array');
    expect(results.length).gte(0);
    for (let i = 0; i < results.length; i++) {
      const template = results[i];
      expect(template).to.be.instanceOf(Object);
      expect(template).to.have.property('_id').to.be.a('string');
      expect(template).to.have.property('createdAt').to.be.a('number');
      expect(template).to.have.property('updatedAt').to.be.a('number');
      expect(template).to.have.property('cid').to.be.a('string').eq(manyId[i]);
      expect(template).to.have.property('label').to.be.a('string');
      expect(template).to.have.property('name').to.be.a('string');
      expect(template).to.have.property('desc').to.be.a('string');
      expect(template).to.have.property('singleEntry').to.be.a('boolean');
      expect(template).to.have.property('props').to.be.a('array');
      expect(template).to.have.property('singleEntry').to.be.a('boolean');
      expect(template).to.have.property('props').to.be.a('array');
      expect(template.props[0]).to.have.property('id').to.be.a('string');
      expect(template.props[1]).to.have.property('id').to.be.a('string');
      ObjectUtil.eq(
        template,
        {
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
    }
  });
  it('should get how many template are available', async () => {
    const result = await sdk.template.count();
    expect(result).to.be.a('number');
  });
  it('should be able to get a template', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idTemplateSecond).to.be.a('string');
    const template = await sdk.template.get(idTemplateSecond);
    expect(template).to.be.instanceOf(Object);
    expect(template)
      .to.have.property('_id')
      .to.be.a('string')
      .eq(idTemplateSecond);
    expect(template).to.have.property('createdAt').to.be.a('number');
    expect(template).to.have.property('updatedAt').to.be.a('number');
    expect(template).to.have.property('cid').to.be.a('string');
    expect(template).to.have.property('label').to.be.a('string');
    expect(template).to.have.property('name').to.be.a('string');
    expect(template).to.have.property('desc').to.be.a('string');
    expect(template).to.have.property('singleEntry').to.be.a('boolean');
    expect(template).to.have.property('props').to.be.a('array');
    expect(template.props[0]).to.have.property('id').to.be.a('string');
    expect(template.props[1]).to.have.property('id').to.be.a('string');
    ObjectUtil.eq(
      template,
      {
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
  });
  it('should fail when trying to get a template that does not exist', async () => {
    try {
      const template = await sdk.template.get('6184f06acbf8c33bfe92b042');
      expect(template).to.be.instanceOf(Object);
      expect(template)
        .to.have.property('_id')
        .to.be.a('string')
        .eq('6184f06acbf8c33bfe92b042');
      expect(template).to.have.property('createdAt').to.be.a('number');
      expect(template).to.have.property('updatedAt').to.be.a('number');
      expect(template).to.have.property('cid').to.be.a('string');
      expect(template).to.have.property('label').to.be.a('string');
      expect(template).to.have.property('name').to.be.a('string');
      expect(template).to.have.property('desc').to.be.a('string');
      expect(template).to.have.property('singleEntry').to.be.a('boolean');
      expect(template).to.have.property('props').to.be.a('array');
      expect(template.props[0]).to.have.property('id').to.be.a('string');
      expect(template.props[1]).to.have.property('id').to.be.a('string');
      ObjectUtil.eq(
        template,
        {
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
    } catch (error) {
      expect(error).to.be.an('object').to.have.property('code').to.eq('tmp001');
    }
  });
  it('should be able to add STRING prop to a template', async () => {
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', [
      'This is first string',
    ]);
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Update template',
        label: 'Update template',
        name: 'update_template',
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
            name: 'first_string',
            label: 'First string',
            array: false,
            required: true,
            type: 'STRING',
          },
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
  });
  it('should be able to add STRING Array prop to a template', async () => {
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          add: {
            label: 'First string',
            type: BCMSPropType.STRING,
            required: true,
            array: true,
            defaultData: ['This is first string', 'This is second string'],
          },
        },
      ],
    });
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', [
      'This is first string',
      'This is second string',
    ]);
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Update template',
        label: 'Update template',
        name: 'update_template',
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
            name: 'first_string',
            label: 'First string',
            array: true,
            required: true,
            type: 'STRING',
          },
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
  });
  it('should be able to add NUMBER prop to a template', async () => {
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
      ],
    });
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', [2]);
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Update template',
        label: 'Update template',
        name: 'update_template',
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
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
  });
  it('should be able to add NUMBER Array prop to a template', async () => {
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          add: {
            label: 'Array number',
            type: BCMSPropType.NUMBER,
            required: true,
            array: true,
            defaultData: [5, 4, 7, 8],
          },
        },
      ],
    });
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
    expect(updateTemplate.props[2]).to.have.deep.property(
      'defaultData',
      [5, 4, 7, 8],
    );
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Update template',
        label: 'Update template',
        name: 'update_template',
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
            name: 'array_number',
            label: 'Array number',
            array: true,
            required: true,
            type: 'NUMBER',
          },
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
  });
  it('should be able to add BOOLEAN prop to a template', async () => {
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', [
      true,
    ]);
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Update template',
        label: 'Update template',
        name: 'update_template',
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
            name: 'one_boolean_prop',
            label: 'One boolean prop',
            array: false,
            required: true,
            type: 'BOOLEAN',
          },
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
  });
  it('should be able to add BOOLEAN Array prop to a template', async () => {
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', [
      true,
      false,
      true,
      true,
    ]);
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Update template',
        label: 'Update template',
        name: 'update_template',
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
            name: 'array_boolean',
            label: 'Array boolean',
            array: true,
            required: true,
            type: 'BOOLEAN',
          },
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
  });
  //   it('should be able to add DATE prop to a template', async () => {
  //     const updateTemplate = await sdk.template.update({
  //       _id: idTemplate,
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
  //     expect(updateTemplate).to.be.instanceOf(Object);
  //     expect(updateTemplate)
  //       .to.have.property('_id')
  //       .to.be.a('string')
  //       .eq(idTemplate);
  //     expect(updateTemplate).to.have.property('createdAt').to.be.a('number');
  //     expect(updateTemplate).to.have.property('updatedAt').to.be.a('number');
  //     expect(updateTemplate).to.have.property('cid').to.be.a('string');
  //     expect(updateTemplate).to.have.property('props').to.be.a('array');
  //     expect(updateTemplate.props[0]).to.have.property('id').to.be.a('string');
  //     expect(updateTemplate.props[1]).to.have.property('id').to.be.a('string');
  //     expect(updateTemplate.props[2]).to.have.property('id').to.be.a('string');
  //     expect(updateTemplate.props[2]).to.have.deep.property('defaultData', [
  //       1636364095,
  //     ]);
  //     ObjectUtil.eq(
  //       updateTemplate,
  //       {
  //         desc: 'Update template',
  //         label: 'Update template',
  //         name: 'update_template',
  //         singleEntry: true,
  //         userId: '111111111111111111111111',
  //         props: [
  //           {
  //             label: 'Title',
  //             name: 'title',
  //             array: false,
  //             required: true,
  //             type: 'STRING',
  //             defaultData: [''],
  //           },
  //           {
  //             label: 'Slug',
  //             name: 'slug',
  //             array: false,
  //             required: true,
  //             type: 'STRING',
  //             defaultData: [''],
  //           },
  //           {
  //             name: 'date',
  //             label: 'Date',
  //             array: false,
  //             required: true,
  //             type: 'DATE',
  //           },
  //         ],
  //       },
  //       'template',
  //     );
  //     await sdk.template.update({
  //       _id: idTemplate,
  //       propChanges: [
  //         {
  //           remove: updateTemplate.props[2].id,
  //         },
  //       ],
  //     });
  //   });
  let firstColorId: string;
  let secondColorId: string;
  it('should be able to add COLOR_PICKER prop to a template', async () => {
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
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
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
              selected: [secondColorId],
            },
          },
        },
      ],
    });
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', {
      allowCustom: false,
      options: [firstColorId, secondColorId],
      selected: [secondColorId],
    });
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Update template',
        label: 'Update template',
        name: 'update_template',
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
            name: 'color_picker',
            label: 'Color Picker',
            array: false,
            required: true,
            type: 'COLOR_PICKER',
          },
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
  });
  it('should be able to add COLOR_PICKER Array prop to a template', async () => {
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          add: {
            label: 'Color Picker',
            type: BCMSPropType.COLOR_PICKER,
            required: true,
            array: true,
            defaultData: {
              allowCustom: false,
              allowGlobal: false,
              selected: [secondColorId],
            },
          },
        },
      ],
    });
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', {
      allowCustom: false,
      options: [firstColorId, secondColorId],
      selected: [secondColorId],
    });
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Update template',
        label: 'Update template',
        name: 'update_template',
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
            name: 'color_picker',
            label: 'Color Picker',
            array: true,
            required: true,
            type: 'COLOR_PICKER',
          },
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
    const deleteFirstColor = await sdk.color.deleteById(firstColorId);
    expect(deleteFirstColor).eq('Success.');
    const deleteSecondColor = await sdk.color.deleteById(secondColorId);
    expect(deleteSecondColor).eq('Success.');
  });
  it('should be able to add RICH_TEXT prop to a template', async () => {
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', [
      {
        nodes: [],
      },
    ]);
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Update template',
        label: 'Update template',
        name: 'update_template',
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
            name: 'rich_text',
            label: 'Rich text',
            array: false,
            required: true,
            type: 'RICH_TEXT',
          },
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
  });
  it('should be able to add RICH_TEXT Array prop to a template', async () => {
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', [
      {
        nodes: [],
      },
      {
        nodes: [],
      },
    ]);
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Update template',
        label: 'Update template',
        name: 'update_template',
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
            name: 'array_rich_text',
            label: 'Array rich text',
            array: true,
            required: true,
            type: 'RICH_TEXT',
          },
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
  });
  let idGroup: string;
  it('should be able to add GROUP_POINTER prop to a template', async () => {
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
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', {
      _id: idGroup,
    });
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Update template',
        label: 'Update template',
        name: 'update_template',
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
            name: 'group_pointer',
            label: 'group pointer',
            array: false,
            required: true,
            type: 'GROUP_POINTER',
          },
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
  });
  it('should be able to add GROUP_POINTER Array prop to a template', async () => {
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', {
      _id: idGroup,
    });
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Update template',
        label: 'Update template',
        name: 'update_template',
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
            name: 'array_group_pointer',
            label: 'Array group pointer',
            array: true,
            required: true,
            type: 'GROUP_POINTER',
          },
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
    const result = await sdk.group.deleteById(idGroup);
    expect(result).eq('Success.');
  });
  it('should be able to delete a template', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idTemplate).to.be.a('string');
    const result = await sdk.template.deleteById(idTemplate);
    expect(result).eq('Success.');
    expect(idTemplateSecond).to.be.a('string');
    const secondResult = await sdk.template.deleteById(idTemplateSecond);
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
    const template = await sdk.template.create({
      label: 'Parent template',
      desc: 'Parent template',
      singleEntry: true,
    });

    idTemplate = template._id;
    cidTemplate = template.cid;
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
        name: 'parent_template',
        label: 'Parent template',
        desc: 'Parent template',
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
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', {
      _id: idGroup,
    });
    ObjectUtil.eq(
      updateTemplate,
      {
        name: 'parent_template',
        label: 'Parent template',
        desc: 'Parent template',
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
            name: 'group_pointer',
            label: 'group pointer',
            array: false,
            required: true,
            type: 'GROUP_POINTER',
          },
        ],
      },
      'template',
    );
    const result = await sdk.group.deleteById(idGroup);
    expect(result).eq('Success.');
    const checkTemplate = await sdk.template.get(idTemplate);
    expect(checkTemplate).to.be.instanceOf(Object);
    expect(checkTemplate)
      .to.have.property('_id')
      .to.be.a('string')
      .eq(idTemplate);
    expect(checkTemplate).to.have.property('createdAt').to.be.a('number');
    expect(checkTemplate).to.have.property('updatedAt').to.be.a('number');
    expect(checkTemplate).to.have.property('cid').to.be.a('string');
    expect(checkTemplate).to.have.property('label').to.be.a('string');
    expect(checkTemplate).to.have.property('name').to.be.a('string');
    expect(checkTemplate).to.have.property('desc').to.be.a('string');
    expect(checkTemplate).to.have.property('singleEntry').to.be.a('boolean');
    expect(checkTemplate).to.have.property('props').to.be.a('array');
    expect(checkTemplate.props[0]).to.have.property('id').to.be.a('string');
    expect(checkTemplate.props[1]).to.have.property('id').to.be.a('string');
    // eslint-disable-next-line no-unused-expressions
    expect(checkTemplate.props[2]).to.not.exist;
    ObjectUtil.eq(
      checkTemplate,
      {
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
  });
  it('should be able to add ENTRY_POINTER prop to a template', async () => {
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          add: {
            label: 'Entry pointer',
            type: BCMSPropType.ENTRY_POINTER,
            required: true,
            array: false,
            defaultData: [
              {
                templateId: idTemplate,
                entryIds: [],
                displayProp: 'title',
              },
            ],
          },
        },
      ],
    });
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', {
      templateId: idTemplate,
      entryIds: [],
      displayProp: 'title',
    });
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Parent template',
        label: 'Parent template',
        name: 'parent_template',
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
            name: 'entry_pointer',
            label: 'Entry pointer',
            array: false,
            required: true,
            type: 'ENTRY_POINTER',
          },
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
  });
  it('should be able to add ENTRY_POINTER Array prop to a template', async () => {
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          add: {
            label: 'Array entry pointer',
            type: BCMSPropType.ENTRY_POINTER,
            required: true,
            array: true,
            defaultData: [
              {
                templateId: idTemplate,
                entryIds: [],
                displayProp: 'title',
              },
            ],
          },
        },
      ],
    });
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
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', {
      templateId: idTemplate,
      entryIds: [],
      displayProp: 'title',
    });
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Parent template',
        label: 'Parent template',
        name: 'parent_template',
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
            name: 'array_entry_pointer',
            label: 'Array entry pointer',
            array: true,
            required: true,
            type: 'ENTRY_POINTER',
          },
        ],
      },
      'template',
    );
    await sdk.template.update({
      _id: idTemplate,
      propChanges: [
        {
          remove: updateTemplate.props[2].id,
        },
      ],
    });
    const result = await sdk.template.deleteById(idTemplate);
    expect(result).eq('Success.');
  });
  let idTemplateChild: string;
  let idTemplateParent: string;
  it('should check if ENTRY_POINTER prop is removed if target template is deleted', async () => {
    const childTemplate = await sdk.template.create({
      label: 'Child template',
      desc: 'Child template',
      singleEntry: true,
    });

    idTemplateChild = childTemplate._id;
    expect(childTemplate).to.be.instanceOf(Object);
    expect(childTemplate).to.have.property('_id').to.be.a('string');
    expect(childTemplate).to.have.property('createdAt').to.be.a('number');
    expect(childTemplate).to.have.property('updatedAt').to.be.a('number');
    expect(childTemplate).to.have.property('cid').to.be.a('string');
    expect(childTemplate).to.have.property('props').to.be.a('array');
    expect(childTemplate.props[0]).to.have.property('id').to.be.a('string');
    expect(childTemplate.props[1]).to.have.property('id').to.be.a('string');
    ObjectUtil.eq(
      childTemplate,
      {
        name: 'child_template',
        label: 'Child template',
        desc: 'Child template',
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
    const parentTemplate = await sdk.template.create({
      label: 'Parent template',
      desc: 'Parent template',
      singleEntry: true,
    });
    idTemplateParent = parentTemplate._id;
    expect(parentTemplate).to.be.instanceOf(Object);
    expect(parentTemplate).to.have.property('_id').to.be.a('string');
    expect(parentTemplate).to.have.property('createdAt').to.be.a('number');
    expect(parentTemplate).to.have.property('updatedAt').to.be.a('number');
    expect(parentTemplate).to.have.property('cid').to.be.a('string');
    expect(parentTemplate).to.have.property('props').to.be.a('array');
    expect(parentTemplate.props[0]).to.have.property('id').to.be.a('string');
    expect(parentTemplate.props[1]).to.have.property('id').to.be.a('string');
    ObjectUtil.eq(
      parentTemplate,
      {
        name: 'parent_template',
        label: 'Parent template',
        desc: 'Parent template',
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
    const updateTemplate = await sdk.template.update({
      _id: idTemplateParent,
      propChanges: [
        {
          add: {
            label: 'Child entry pointer',
            type: BCMSPropType.ENTRY_POINTER,
            required: true,
            array: false,
            defaultData: [
              {
                templateId: idTemplateChild,
                entryIds: [],
                displayProp: 'title',
              },
            ],
          },
        },
      ],
    });
    expect(updateTemplate).to.be.instanceOf(Object);
    expect(updateTemplate)
      .to.have.property('_id')
      .to.be.a('string')
      .eq(idTemplateParent);
    expect(updateTemplate).to.have.property('createdAt').to.be.a('number');
    expect(updateTemplate).to.have.property('updatedAt').to.be.a('number');
    expect(updateTemplate).to.have.property('cid').to.be.a('string');
    expect(updateTemplate).to.have.property('props').to.be.a('array');
    expect(updateTemplate.props[0]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[1]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[2]).to.have.property('id').to.be.a('string');
    expect(updateTemplate.props[2]).to.have.deep.property('defaultData', {
      templateId: idTemplateChild,
      entryIds: [],
      displayProp: 'title',
    });
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 'Parent template',
        label: 'Parent template',
        name: 'parent_template',
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
            name: 'child_entry_pointer',
            label: 'Child entry pointer',
            array: false,
            required: true,
            type: 'ENTRY_POINTER',
          },
        ],
      },
      'template',
    );
    const result = await sdk.template.deleteById(idTemplateChild);
    expect(result).eq('Success.');
    const checkTemplate = await sdk.template.get(idTemplateParent);
    expect(checkTemplate).to.be.instanceOf(Object);
    expect(checkTemplate)
      .to.have.property('_id')
      .to.be.a('string')
      .eq(idTemplateParent);
    expect(checkTemplate).to.have.property('createdAt').to.be.a('number');
    expect(checkTemplate).to.have.property('updatedAt').to.be.a('number');
    expect(checkTemplate).to.have.property('cid').to.be.a('string');
    expect(checkTemplate).to.have.property('label').to.be.a('string');
    expect(checkTemplate).to.have.property('name').to.be.a('string');
    expect(checkTemplate).to.have.property('desc').to.be.a('string');
    expect(checkTemplate).to.have.property('singleEntry').to.be.a('boolean');
    expect(checkTemplate).to.have.property('props').to.be.a('array');
    expect(checkTemplate.props[0]).to.have.property('id').to.be.a('string');
    expect(checkTemplate.props[1]).to.have.property('id').to.be.a('string');
    // eslint-disable-next-line no-unused-expressions
    expect(checkTemplate.props[2]).to.not.exist;
    ObjectUtil.eq(
      checkTemplate,
      {
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
  });
  it('should clear test data', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idTemplateParent).to.be.a('string');
    const result = await sdk.template.deleteById(idTemplateParent);
    expect(result).eq('Success.');
  });
});

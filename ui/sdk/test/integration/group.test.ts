import { expect } from 'chai';
import { BCMSPropType } from '../../src/types';
import { Login, ObjectUtil, sdk } from '../util';

describe('Group API', async () => {
  Login();
  let idGroup: string;
  let idGroupSecond: string;
  let cidGroup: string;
  let cidGroupSecond: string;
  it('should be able to create a group', async () => {
    const group = await sdk.group.create({
      label: 'group first',
      desc: 'group first',
    });
    idGroup = group._id;
    cidGroup = group.cid;
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
    const secondGroup = await sdk.group.create({
      label: 'group second',
      desc: 'group second',
    });
    idGroupSecond = secondGroup._id;
    cidGroupSecond = secondGroup.cid;
    expect(secondGroup).to.be.instanceOf(Object);
    expect(secondGroup).to.have.property('_id').to.be.a('string');
    expect(secondGroup).to.have.property('createdAt').to.be.a('number');
    expect(secondGroup).to.have.property('updatedAt').to.be.a('number');
    expect(secondGroup).to.have.property('cid').to.be.a('string');
    expect(secondGroup).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      secondGroup,
      {
        desc: 'group second',
        label: 'group second',
        name: 'group_second',
      },
      'group',
    );
  });
  it('should be able to update group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
      label: 'group testing',
      desc: 'group testing',
      propChanges: [],
    });
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
      },
      'group',
    );
  });
  it('should show all groups', async () => {
    const results = await sdk.group.getAll();
    expect(results).to.be.a('array');
    expect(results.length).gte(0);
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      expect(result).to.be.instanceOf(Object);
      expect(result).to.have.property('_id').to.be.a('string');
      expect(result).to.have.property('createdAt').to.be.a('number');
      expect(result).to.have.property('updatedAt').to.be.a('number');
      expect(result).to.have.property('cid').to.be.a('string');
      expect(result).to.have.property('label').to.be.a('string');
      expect(result).to.have.property('name').to.be.a('string');
      expect(result).to.have.property('desc').to.be.a('string');
      expect(result).to.have.property('props').to.be.a('array');
    }
  });
  it('should be able to get many groups in 1 request', async () => {
    const manyId = [cidGroup, cidGroupSecond];
    expect(manyId).to.be.a('array');
    const groups = await sdk.group.getMany(manyId);
    expect(groups).to.be.a('array');
    expect(groups.length).gte(0);
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      expect(group).to.be.instanceOf(Object);
      expect(group).to.have.property('_id').to.be.a('string');
      expect(group).to.have.property('createdAt').to.be.a('number');
      expect(group).to.have.property('updatedAt').to.be.a('number');
      expect(group).to.have.property('cid').to.be.a('string').eq(manyId[i]);
      expect(group).to.have.property('label').to.be.a('string');
      expect(group).to.have.property('name').to.be.a('string');
      expect(group).to.have.property('desc').to.be.a('string');
      expect(group).to.have.property('props').to.be.a('array');
    }
  });
  it('should get how many groups are available', async () => {
    const result = await sdk.group.count();
    expect(result).to.be.a('number');
  });
  it('should get where is use group', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idGroup).to.be.a('string');
    const whereUseGroup = await sdk.group.whereIsItUsed(idGroup);
    expect(whereUseGroup).to.be.instanceOf(Object);
    expect(whereUseGroup).to.have.property('templateIds').to.be.a('array');
    expect(whereUseGroup).to.have.property('groupIds').to.be.a('array');
    expect(whereUseGroup).to.have.property('widgetIds').to.be.a('array');
  });
  it('should be able to get a group', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idGroup).to.be.a('string');
    const group = await sdk.group.get(idGroup);
    expect(group).to.be.instanceOf(Object);
    expect(group).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(group).to.have.property('createdAt').to.be.a('number');
    expect(group).to.have.property('updatedAt').to.be.a('number');
    expect(group).to.have.property('cid').to.be.a('string');
    expect(group).to.have.property('label').to.be.a('string');
    expect(group).to.have.property('name').to.be.a('string');
    expect(group).to.have.property('desc').to.be.a('string');
    expect(group).to.have.property('props').to.be.a('array');
  });
  it('should be able to get a lite group', async () => {
    // eslint-disable-next-line no-unused-expressions
    const groups = await sdk.group.getAllLite();
    expect(groups).to.be.a('array');
    expect(groups.length).gte(0);
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      expect(group).to.be.instanceOf(Object);
      expect(group).to.have.property('cid').to.be.a('string');
      expect(group).to.have.property('label').to.be.a('string');
      expect(group).to.have.property('name').to.be.a('string');
      expect(group).to.have.property('desc').to.be.a('string');
      expect(group).to.have.property('propsCount').to.be.a('number');
    }
  });
  it('should be able to add STRING prop to a group', async () => {
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
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
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
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add STRING Array prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
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

    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', [
      'This is first string',
      'This is second string',
    ]);
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
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
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add NUMBER prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
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
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', [5]);
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
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
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add NUMBER Array prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
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
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property(
      'defaultData',
      [5, 4, 7, 9],
    );
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
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
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add BOOLEAN prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
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
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', [true]);
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
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
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add BOOLEAN Array prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
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
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', [
      true,
      false,
      true,
      true,
    ]);
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
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
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add DATE prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          add: {
            label: 'Date',
            type: BCMSPropType.DATE,
            required: true,
            array: false,
            defaultData: [1636364095],
          },
        },
      ],
    });

    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');

    expect(updateGroup.props[0]).to.have.deep.property('defaultData', [
      1636364095,
    ]);

    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
        props: [
          {
            name: 'date',
            label: 'Date',
            array: false,
            required: true,
            type: 'DATE',
          },
        ],
      },
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add DATE Array prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          add: {
            label: 'Array date',
            type: BCMSPropType.DATE,
            required: true,
            array: true,
            defaultData: [1636364095, 1636364966, 1635845695],
          },
        },
      ],
    });

    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property(
      'defaultData',
      [1636364095, 1636364966, 1635845695],
    );
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
        props: [
          {
            name: 'array_date',
            label: 'Array date',
            array: true,
            required: true,
            type: 'DATE',
          },
        ],
      },
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add ENUM prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          add: {
            label: 'One enum',
            type: BCMSPropType.ENUMERATION,
            required: true,
            array: false,
            defaultData: {
              items: ['km', 'm', 'dm', 'cm', 'mm'],
              selected: 'm',
            },
          },
        },
      ],
    });
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', {
      items: ['km', 'm', 'dm', 'cm', 'mm'],
      selected: 'm',
    });
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
        props: [
          {
            name: 'one_enum',
            label: 'One enum',
            array: false,
            required: true,
            type: 'ENUMERATION',
          },
        ],
      },
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add ENUM Array prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          add: {
            label: 'Array enum',
            type: BCMSPropType.ENUMERATION,
            required: true,
            array: true,
            defaultData: {
              items: ['km', 'm', 'dm', 'cm', 'mm'],
              selected: 'm',
            },
          },
        },
      ],
    });
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', {
      items: ['km', 'm', 'dm', 'cm', 'mm'],
      selected: 'm',
    });
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
        props: [
          {
            name: 'array_enum',
            label: 'Array enum',
            array: true,
            required: true,
            type: 'ENUMERATION',
          },
        ],
      },
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add MEDIA prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          add: {
            label: 'Media',
            type: BCMSPropType.MEDIA,
            required: true,
            array: false,
            defaultData: ['618921a9838150fb59f13e32'],
          },
        },
      ],
    });
    console.log(updateGroup);
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', [
      //  true,
      // false
      // true,
      //  true
    ]);
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
        props: [
          {
            name: 'media',
            label: 'Media',
            array: false,
            required: true,
            type: 'MEDIA',
          },
        ],
      },
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  let firstColorId: string;
  let secondColorId: string;
  let templateId: string;
  it('should be able to add COLOR_PICKER prop to a group', async () => {
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
    const updateGroup = await sdk.group.update({
      _id: idGroup,
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
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', {
      allowCustom: false,
      options: [firstColor._id, secondColor._id],
      selected: [secondColor._id],
    });
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
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
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add COLOR_PICKER Array prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
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
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', {
      allowCustom: true,
      options: [firstColorId],
      selected: [secondColorId, firstColorId],
    });
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
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
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
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
  it('should be able to add RICH_TEXT prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
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
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', [
      {
        nodes: [],
      },
    ]);
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
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
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add RICH_TEXT Array prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
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
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', [
      {
        nodes: [],
      },
      {
        nodes: [],
      },
    ]);
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
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
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add GROUP_POINTER prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          add: {
            label: 'Group pointer',
            type: BCMSPropType.GROUP_POINTER,
            required: true,
            array: false,
            defaultData: {
              _id: idGroupSecond,
            },
          },
        },
      ],
    });
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', {
      _id: idGroupSecond,
    });
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
        props: [
          {
            name: 'group_pointer',
            label: 'Group pointer',
            array: false,
            required: true,
            type: 'GROUP_POINTER',
          },
        ],
      },
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to add GROUP_POINTER Array prop to a group', async () => {
    const updateGroup = await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          add: {
            label: 'Array group pointer',
            type: BCMSPropType.GROUP_POINTER,
            required: true,
            array: true,
            defaultData: {
              _id: idGroupSecond,
            },
          },
        },
      ],
    });
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', {
      _id: idGroupSecond,
    });
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'group testing',
        label: 'group testing',
        name: 'group_testing',
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
      'group',
    );
    await sdk.group.update({
      _id: idGroup,
      propChanges: [
        {
          remove: updateGroup.props[0].id,
        },
      ],
    });
  });
  it('should be able to delete a group', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idGroup).to.be.a('string');
    const result = await sdk.group.deleteById(idGroup);
    expect(result).eq('Success.');
    expect(idGroupSecond).to.be.a('string');
    const secondResult = await sdk.group.deleteById(idGroupSecond);
    expect(secondResult).eq('Success.');
  });
  let idChildGroup: string;
  let idParentGroup: string;
  it('should check if GROUP_POINTER prop is removed if target group is deleted', async () => {
    const childGroup = await sdk.group.create({
      label: 'Child',
      desc: 'Child',
    });
    idChildGroup = childGroup._id;
    expect(childGroup).to.be.instanceOf(Object);
    expect(childGroup).to.have.property('_id').to.be.a('string');
    expect(childGroup).to.have.property('createdAt').to.be.a('number');
    expect(childGroup).to.have.property('updatedAt').to.be.a('number');
    expect(childGroup).to.have.property('cid').to.be.a('string');
    expect(childGroup).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      childGroup,
      {
        desc: 'Child',
        label: 'Child',
        name: 'child',
      },
      'group',
    );
    const parentGroup = await sdk.group.create({
      label: 'Parent',
      desc: 'Parent',
    });
    idParentGroup = parentGroup._id;
    expect(parentGroup).to.be.instanceOf(Object);
    expect(parentGroup).to.have.property('_id').to.be.a('string');
    expect(parentGroup).to.have.property('createdAt').to.be.a('number');
    expect(parentGroup).to.have.property('updatedAt').to.be.a('number');
    expect(parentGroup).to.have.property('cid').to.be.a('string');
    expect(parentGroup).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      parentGroup,
      {
        desc: 'Parent',
        label: 'Parent',
        name: 'parent',
      },
      'group',
    );
    const updateParentGroup = await sdk.group.update({
      _id: idParentGroup,
      propChanges: [
        {
          add: {
            label: 'Pointer to child',
            type: BCMSPropType.GROUP_POINTER,
            required: true,
            array: false,
            defaultData: {
              _id: idChildGroup,
            },
          },
        },
      ],
    });
    expect(updateParentGroup).to.be.instanceOf(Object);
    expect(updateParentGroup)
      .to.have.property('_id')
      .to.be.a('string')
      .eq(idParentGroup);
    expect(updateParentGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateParentGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateParentGroup).to.have.property('cid').to.be.a('string');
    expect(updateParentGroup).to.have.property('props').to.be.a('array');
    expect(updateParentGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateParentGroup.props[0]).to.have.deep.property('defaultData', {
      _id: idChildGroup,
    });
    ObjectUtil.eq(
      updateParentGroup,
      {
        desc: 'Parent',
        label: 'Parent',
        name: 'parent',
        props: [
          {
            name: 'pointer_to_child',
            label: 'Pointer to child',
            array: false,
            required: true,
            type: 'GROUP_POINTER',
          },
        ],
      },
      'group',
    );
    const childDelete = await sdk.group.deleteById(idChildGroup);
    expect(childDelete).eq('Success.');
    const group = await sdk.group.get(idParentGroup);
    expect(group).to.be.instanceOf(Object);
    expect(group).to.have.property('_id').to.be.a('string').eq(idParentGroup);
    expect(group).to.have.property('createdAt').to.be.a('number');
    expect(group).to.have.property('updatedAt').to.be.a('number');
    expect(group).to.have.property('cid').to.be.a('string');
    expect(group).to.have.property('label').to.be.a('string');
    expect(group).to.have.property('name').to.be.a('string');
    expect(group).to.have.property('desc').to.be.a('string');
    expect(group).to.have.property('props').to.be.a('array').that.eql([]);
    const parentGroupDelete = await sdk.group.deleteById(idParentGroup);
    expect(parentGroupDelete).eq('Success.');
  });
  it('should check where is a group used', async () => {
    const childGroup = await sdk.group.create({
      label: 'Child',
      desc: 'Child',
    });
    idChildGroup = childGroup._id;
    expect(childGroup).to.be.instanceOf(Object);
    expect(childGroup).to.have.property('_id').to.be.a('string');
    expect(childGroup).to.have.property('createdAt').to.be.a('number');
    expect(childGroup).to.have.property('updatedAt').to.be.a('number');
    expect(childGroup).to.have.property('cid').to.be.a('string');
    expect(childGroup).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      childGroup,
      {
        desc: 'Child',
        label: 'Child',
        name: 'child',
      },
      'group',
    );
    const parentGroup = await sdk.group.create({
      label: 'Parent',
      desc: 'Parent',
    });
    idParentGroup = parentGroup._id;
    expect(parentGroup).to.be.instanceOf(Object);
    expect(parentGroup).to.have.property('_id').to.be.a('string');
    expect(parentGroup).to.have.property('createdAt').to.be.a('number');
    expect(parentGroup).to.have.property('updatedAt').to.be.a('number');
    expect(parentGroup).to.have.property('cid').to.be.a('string');
    expect(parentGroup).to.have.property('props').to.be.a('array');
    ObjectUtil.eq(
      parentGroup,
      {
        desc: 'Parent',
        label: 'Parent',
        name: 'parent',
      },
      'group',
    );
    const updateParentGroup = await sdk.group.update({
      _id: idParentGroup,
      propChanges: [
        {
          add: {
            label: 'Pointer to child',
            type: BCMSPropType.GROUP_POINTER,
            required: true,
            array: false,
            defaultData: {
              _id: idChildGroup,
            },
          },
        },
      ],
    });
    expect(updateParentGroup).to.be.instanceOf(Object);
    expect(updateParentGroup)
      .to.have.property('_id')
      .to.be.a('string')
      .eq(idParentGroup);
    expect(updateParentGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateParentGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateParentGroup).to.have.property('cid').to.be.a('string');
    expect(updateParentGroup).to.have.property('props').to.be.a('array');
    expect(updateParentGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateParentGroup.props[0]).to.have.deep.property('defaultData', {
      _id: idChildGroup,
    });
    ObjectUtil.eq(
      updateParentGroup,
      {
        desc: 'Parent',
        label: 'Parent',
        name: 'parent',
        props: [
          {
            name: 'pointer_to_child',
            label: 'Pointer to child',
            array: false,
            required: true,
            type: 'GROUP_POINTER',
          },
        ],
      },
      'group',
    );
    const checkChild = await sdk.group.whereIsItUsed(idChildGroup);
    expect(checkChild).to.be.instanceOf(Object);
    expect(checkChild.groupIds[0]._id).to.be.eq(idParentGroup);
  });
  it('should clear test data', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idParentGroup).to.be.a('string');
    const result = await sdk.group.deleteById(idParentGroup);
    expect(result).eq('Success.');
    expect(idChildGroup).to.be.a('string');
    const secondResult = await sdk.group.deleteById(idChildGroup);
    expect(secondResult).eq('Success.');
  });
});

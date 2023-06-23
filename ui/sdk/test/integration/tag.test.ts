import { expect } from 'chai';
import { BCMSPropType } from '../../src/types';
import { Login, ObjectUtil, sdk } from '../util';

describe('Color API', async () => {
  Login();
  let idTag: string;
  let valueTag: string;
  let cidTag: string;
  it('should create new tag', async () => {
    const tag = await sdk.tag.create({
      value: 'first',
    });
    idTag = tag._id;
    cidTag = tag.cid;
    expect(tag).to.be.instanceOf(Object);
    expect(tag).to.have.property('_id').to.be.a('string');
    expect(tag).to.have.property('createdAt').to.be.a('number');
    expect(tag).to.have.property('updatedAt').to.be.a('number');
    expect(tag).to.have.property('cid').to.be.a('string');
    ObjectUtil.eq(
      tag,
      {
        value: 'first',
      },
      'tag',
    );
  });
  it('should be able to update tag', async () => {
    const updateTag = await sdk.tag.update({
      _id: idTag,
      value: 'update',
    });
    valueTag = updateTag.value;
    expect(updateTag).to.be.instanceOf(Object);
    expect(updateTag).to.have.property('_id').to.be.a('string').eq(idTag);
    expect(updateTag).to.have.property('createdAt').to.be.a('number');
    expect(updateTag).to.have.property('updatedAt').to.be.a('number');
    expect(updateTag).to.have.property('cid').to.be.a('string');
    ObjectUtil.eq(
      updateTag,
      {
        value: 'update',
      },
      'tag',
    );
  });
  it('should be to get all tags', async () => {
    const results = await sdk.tag.getAll();
    expect(results).to.be.a('array');
    expect(results.length).gte(0);
    for (let i = 0; i < results.length; i++) {
      const tag = results[i];
      expect(tag).to.be.instanceOf(Object);
      expect(tag).to.have.property('_id').to.be.a('string');
      expect(tag).to.have.property('createdAt').to.be.a('number');
      expect(tag).to.have.property('updatedAt').to.be.a('number');
      expect(tag).to.have.property('cid').to.be.a('string');
      expect(tag).to.have.property('value').to.be.a('string');
    }
  });
  it('should get many tags in 1 request', async () => {
    const manyTags = [cidTag];
    const results = await sdk.tag.getMany(manyTags);
    expect(results).to.be.a('array');
    expect(results.length).gte(0);
    for (let i = 0; i < results.length; i++) {
      const tag = results[i];
      expect(tag).to.be.instanceOf(Object);
      expect(tag).to.have.property('_id').to.be.a('string');
      expect(tag).to.have.property('createdAt').to.be.a('number');
      expect(tag).to.have.property('updatedAt').to.be.a('number');
      expect(tag).to.have.property('cid').to.be.a('string').eq(manyTags[i]);
      expect(tag).to.have.property('value').to.be.a('string');
    }
  });
  it('should get a tag by ID', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idTag).to.be.a('string');
    const tag = await sdk.tag.get(idTag);
    expect(tag).to.be.instanceOf(Object);
    expect(tag).to.have.property('_id').to.be.a('string').eq(idTag);
    expect(tag).to.have.property('createdAt').to.be.a('number');
    expect(tag).to.have.property('updatedAt').to.be.a('number');
    expect(tag).to.have.property('cid').to.be.a('string');
    expect(tag).to.have.property('value').to.be.a('string');
  });
  it('should get a tag by value', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(valueTag).to.be.a('string');
    const tag = await sdk.tag.getByValue(valueTag);
    expect(tag).to.be.instanceOf(Object);
    expect(tag).to.have.property('_id').to.be.a('string');
    expect(tag).to.have.property('createdAt').to.be.a('number');
    expect(tag).to.have.property('updatedAt').to.be.a('number');
    expect(tag).to.have.property('cid').to.be.a('string');
    expect(tag).to.have.property('value').to.be.a('string').eq(valueTag);
  });
  it('should fail when trying to get a tag which does not exist', async () => {
    try {
      const tag = await sdk.tag.getByValue('the');
      expect(tag).to.be.instanceOf(Object);
      expect(tag).to.have.property('_id').to.be.a('string');
      expect(tag).to.have.property('createdAt').to.be.a('number');
      expect(tag).to.have.property('updatedAt').to.be.a('number');
      expect(tag).to.have.property('cid').to.be.a('string');
      expect(tag).to.have.property('value').to.be.a('string').eq(valueTag);
    } catch (error) {
      expect(error).to.be.an('object').to.have.property('code').to.eq('tag010');
    }
  });
  it('should be able to delete a tag', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idTag).to.be.a('string');
    const result = await sdk.tag.deleteById(idTag);
    expect(result).eq('Success.');
  });
  let idTemplate: string;
  let idGroup: string;
  let idWidget: string;
  it('should check if groups, templates and widgets are updated after deleting a tag.', async () => {
    const tag = await sdk.tag.create({
      value: 'test-tag',
    });
    idTag = tag._id;
    const template = await sdk.template.create({
      label: 't3',
      desc: 't3',
      singleEntry: true,
    });
    idTemplate = template._id;
    const updateTemplate = await sdk.template.update({
      _id: idTemplate,
      propChanges: [
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
      idTag,
    ]);
    ObjectUtil.eq(
      updateTemplate,
      {
        desc: 't3',
        label: 't3',
        name: 't3',
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
    const group = await sdk.group.create({
      label: 'g2',
      desc: 'g2',
    });
    idGroup = group._id;
    const updateGroup = await sdk.group.update({
      _id: idGroup,
      propChanges: [
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
    expect(updateGroup).to.be.instanceOf(Object);
    expect(updateGroup).to.have.property('_id').to.be.a('string').eq(idGroup);
    expect(updateGroup).to.have.property('createdAt').to.be.a('number');
    expect(updateGroup).to.have.property('updatedAt').to.be.a('number');
    expect(updateGroup).to.have.property('cid').to.be.a('string');
    expect(updateGroup).to.have.property('props').to.be.a('array');
    expect(updateGroup.props[0]).to.have.property('id').to.be.a('string');
    expect(updateGroup.props[0]).to.have.deep.property('defaultData', [idTag]);
    ObjectUtil.eq(
      updateGroup,
      {
        desc: 'g2',
        label: 'g2',
        name: 'g2',
        props: [
          {
            name: 'tag',
            label: 'Tag',
            array: false,
            required: true,
            type: 'TAG',
          },
        ],
      },
      'group',
    );
    const widget = await sdk.widget.create({
      label: 'w2',
      desc: 'w2',
      previewImage: 'image',
      previewScript: 'script',
      previewStyle: 'style',
    });
    idWidget = widget._id;
    const updateWidget = await sdk.widget.update({
      _id: idWidget,
      propChanges: [
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
    expect(updateWidget).to.be.instanceOf(Object);
    expect(updateWidget).to.have.property('_id').to.be.a('string').eq(idWidget);
    expect(updateWidget).to.have.property('createdAt').to.be.a('number');
    expect(updateWidget).to.have.property('updatedAt').to.be.a('number');
    expect(updateWidget).to.have.property('cid').to.be.a('string');
    expect(updateWidget).to.have.property('props').to.be.a('array');
    expect(updateWidget.props[0]).to.have.property('id').to.be.a('string');
    expect(updateWidget.props[0]).to.have.deep.property('defaultData', [idTag]);
    ObjectUtil.eq(
      updateWidget,
      {
        desc: 'w2',
        label: 'w2',
        name: 'w2',
        previewImage: 'image',
        previewScript: 'script',
        previewStyle: 'style',
        props: [
          {
            name: 'tag',
            label: 'Tag',
            array: false,
            required: true,
            type: 'TAG',
          },
        ],
      },
      'widget',
    );
    const result = await sdk.tag.deleteById(idTag);
    expect(result).eq('Success.');
    const checkTemplate = await sdk.template.get(idTemplate);
    expect(checkTemplate.props[2]).to.have.deep.property('defaultData', []);
    const checkGroup = await sdk.group.get(idGroup);
    expect(checkGroup.props[0]).to.have.deep.property('defaultData', []);
    const checkWidget = await sdk.widget.get(idWidget);
    expect(checkWidget.props[0]).to.have.deep.property('defaultData', []);
  });
  it('should clear test data', async () => {
    const deleteTemplate = await sdk.template.deleteById(idTemplate);
    expect(deleteTemplate).eq('Success.');
    const deleteGroup = await sdk.group.deleteById(idGroup);
    expect(deleteGroup).eq('Success.');
    const deleteWidget = await sdk.widget.deleteById(idWidget);
    expect(deleteWidget).eq('Success.');
  });
});

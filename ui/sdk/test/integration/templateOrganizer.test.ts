import { expect } from 'chai';
import { Login, ObjectUtil, sdk } from '../util';

describe('Template Organizer API', async () => {
  Login();
  let idTemplate: string;
  let idTemplateOrganizer: string;
  let idTemplateOrganizerSecond: string;

  it('should create new TO (template organizer)', async () => {
    const template = await sdk.template.create({
      label: 'First template',
      desc: 'First template',
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
    const templateOrganizer = await sdk.templateOrganizer.create({
      label: 'First template organizer',
      templateIds: [template._id],
      parentId: '',
    });

    idTemplateOrganizer = templateOrganizer._id;
    expect(templateOrganizer).to.be.instanceOf(Object);
    expect(templateOrganizer).to.have.property('_id').to.be.a('string');
    expect(templateOrganizer).to.have.property('createdAt').to.be.a('number');
    expect(templateOrganizer).to.have.property('updatedAt').to.be.a('number');
    ObjectUtil.eq(
      templateOrganizer,
      {
        name: 'first_template_organizer',
        label: 'First template organizer',
        templateIds: [template._id],
        parentId: '',
      },
      'templateOrganizer',
    );
    const secondTemplateOrganizer = await sdk.templateOrganizer.create({
      label: 'Second template organizer',
      templateIds: [template._id],
      parentId: '',
    });
    idTemplateOrganizerSecond = secondTemplateOrganizer._id;
    expect(secondTemplateOrganizer).to.be.instanceOf(Object);
    expect(secondTemplateOrganizer).to.have.property('_id').to.be.a('string');
    expect(secondTemplateOrganizer)
      .to.have.property('createdAt')
      .to.be.a('number');
    expect(secondTemplateOrganizer)
      .to.have.property('updatedAt')
      .to.be.a('number');
    ObjectUtil.eq(
      secondTemplateOrganizer,
      {
        name: 'second_template_organizer',
        label: 'Second template organizer',
        templateIds: [template._id],
        parentId: '',
      },
      'templateOrganizer',
    );
  });
  it('should update TO', async () => {
    const updateTemplateOrganizer = await sdk.templateOrganizer.update({
      _id: idTemplateOrganizer,
      label: 'Update template organizer',
      templateIds: [],
    });
    expect(updateTemplateOrganizer).to.be.instanceOf(Object);
    expect(updateTemplateOrganizer)
      .to.have.property('_id')
      .to.be.a('string')
      .eq(idTemplateOrganizer);
    expect(updateTemplateOrganizer)
      .to.have.property('createdAt')
      .to.be.a('number');
    expect(updateTemplateOrganizer)
      .to.have.property('updatedAt')
      .to.be.a('number');
    expect(updateTemplateOrganizer)
      .to.have.property('templateIds')
      .to.be.a('array')
      .eql([]);
    ObjectUtil.eq(
      updateTemplateOrganizer,
      {
        name: 'update_template_organizer',
        label: 'Update template organizer',
        parentId: '',
      },
      'templateOrganizer',
    );
  });
  it('should get all TOs', async () => {
    const results = await sdk.templateOrganizer.getAll();
    expect(results).to.be.a('array');
    expect(results.length).gte(0);
    for (let i = 0; i < results.length; i++) {
      const templateOrganizer = results[i];
      expect(templateOrganizer).to.be.instanceOf(Object);
      expect(templateOrganizer).to.have.property('_id').to.be.a('string');
      expect(templateOrganizer).to.have.property('createdAt').to.be.a('number');
      expect(templateOrganizer).to.have.property('updatedAt').to.be.a('number');
      expect(templateOrganizer).to.have.property('label').to.be.a('string');
      expect(templateOrganizer).to.have.property('name').to.be.a('string');
      expect(templateOrganizer).to.have.property('parentId').to.be.a('string');
      expect(templateOrganizer)
        .to.have.property('templateIds')
        .to.be.a('array');
    }
  });
  it('should get how many TOs are available', async () => {
    const result = await sdk.templateOrganizer.count();
    expect(result).to.be.a('number');
  });
  it('should be able to get a TO', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idTemplateOrganizerSecond).to.be.a('string');
    const templateOrganizer = await sdk.templateOrganizer.get(
      idTemplateOrganizerSecond,
    );
    expect(templateOrganizer).to.be.instanceOf(Object);
    expect(templateOrganizer)
      .to.have.property('_id')
      .to.be.a('string')
      .eq(idTemplateOrganizerSecond);
    expect(templateOrganizer).to.have.property('createdAt').to.be.a('number');
    expect(templateOrganizer).to.have.property('updatedAt').to.be.a('number');
    ObjectUtil.eq(
      templateOrganizer,
      {
        name: 'second_template_organizer',
        label: 'Second template organizer',
        templateIds: [idTemplate],
        parentId: '',
      },
      'templateOrganizer',
    );
  });
  it('should fail when trying to get a TO which does not exist', async () => {
    try {
      const templateOrganizer = await sdk.templateOrganizer.get(
        '6184f06acbf8c33bfe92b042',
      );
      expect(templateOrganizer).to.be.instanceOf(Object);
      expect(templateOrganizer)
        .to.have.property('_id')
        .to.be.a('string')
        .eq(idTemplateOrganizerSecond);
      expect(templateOrganizer).to.have.property('createdAt').to.be.a('number');
      expect(templateOrganizer).to.have.property('updatedAt').to.be.a('number');
      ObjectUtil.eq(
        templateOrganizer,
        {
          name: 'second_template_organizer',
          label: 'Second template organizer',
          templateIds: [idTemplate],
          parentId: '',
        },
        'templateOrganizer',
      );
    } catch (error) {
      expect(error).to.be.an('object').to.have.property('code').to.eq('tpo001');
    }
  });
  it('should delete a TO', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idTemplateOrganizer).to.be.a('string');
    const result1 = await sdk.templateOrganizer.deleteById(idTemplateOrganizer);
    expect(result1).eq('Success.');
    expect(idTemplateOrganizerSecond).to.be.a('string');
    const result2 = await sdk.templateOrganizer.deleteById(
      idTemplateOrganizerSecond,
    );
    expect(result2).eq('Success.');
    expect(idTemplate).to.be.a('string');
    const result3 = await sdk.template.deleteById(idTemplate);
    expect(result3).eq('Success.');
  });
  //   it('should check if TO is updated after deleting a template', async () => {
  //     const templateOrganizer = await sdk.templateOrganizer.create({
  //       label: 'Test',
  //       templateIds: [],
  //       parentId: '',
  //     });
  //     expect(templateOrganizer).to.be.instanceOf(Object);
  //     expect(templateOrganizer).to.have.property('_id').to.be.a('string');
  //     expect(templateOrganizer).to.have.property('createdAt').to.be.a('number');
  //     expect(templateOrganizer).to.have.property('updatedAt').to.be.a('number');
  //     ObjectUtil.eq(
  //       templateOrganizer,
  //       {
  //         name: 'test',
  //         label: 'Test',
  //         templateIds: [],
  //         parentId: '',
  //       },
  //       'templateOrganizer',
  //     );
  //     const template = await sdk.template.create({
  //       label: 'Temp',
  //       desc: 'Temp',
  //       singleEntry: true,
  //     });
  //     expect(template).to.be.instanceOf(Object);
  //     expect(template).to.have.property('_id').to.be.a('string');
  //     expect(template).to.have.property('createdAt').to.be.a('number');
  //     expect(template).to.have.property('updatedAt').to.be.a('number');
  //     expect(template).to.have.property('cid').to.be.a('string');
  //     expect(template).to.have.property('props').to.be.a('array');
  //     expect(template.props[0]).to.have.property('id').to.be.a('string');
  //     expect(template.props[1]).to.have.property('id').to.be.a('string');
  //     ObjectUtil.eq(
  //       template,
  //       {
  //         name: 'temp',
  //         label: 'Temp',
  //         desc: 'Temp',
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
  //         ],
  //       },
  //       'template',
  //     );
  //     const updateTemplateOrganizer = await sdk.templateOrganizer.update({
  //       _id: templateOrganizer._id,
  //       templateIds: [template._id],
  //     });
  //     expect(updateTemplateOrganizer).to.be.instanceOf(Object);
  //     expect(updateTemplateOrganizer)
  //       .to.have.property('_id')
  //       .to.be.a('string')
  //       .eq(templateOrganizer._id);
  //     expect(updateTemplateOrganizer)
  //       .to.have.property('createdAt')
  //       .to.be.a('number');
  //     expect(updateTemplateOrganizer)
  //       .to.have.property('updatedAt')
  //       .to.be.a('number');
  //     ObjectUtil.eq(
  //       updateTemplateOrganizer,
  //       {
  //         name: 'test',
  //         label: 'Test',
  //         parentId: '',
  //         templateIds: [template._id],
  //       },
  //       'templateOrganizer',
  //     );
  //     const result = await sdk.template.deleteById(template._id);
  //     expect(result).eq('Success.');
  //     const checkTemplateOrganizer = await sdk.templateOrganizer.get(
  //       templateOrganizer._id,
  //     );
  //     console.log(checkTemplateOrganizer);
  //     expect(checkTemplateOrganizer).to.be.instanceOf(Object);
  //     expect(checkTemplateOrganizer)
  //       .to.have.property('_id')
  //       .to.be.a('string')
  //       .eq(templateOrganizer._id);
  //     expect(checkTemplateOrganizer)
  //       .to.have.property('createdAt')
  //       .to.be.a('number');
  //     expect(checkTemplateOrganizer)
  //       .to.have.property('updatedAt')
  //       .to.be.a('number');
  //     expect(checkTemplateOrganizer)
  //       .to.have.property('templateIds')
  //       .to.be.a('array')
  //       .eql([]);
  //     ObjectUtil.eq(
  //       checkTemplateOrganizer,
  //       {
  //         name: 'test',
  //         label: 'test',
  //         parentId: '',
  //       },
  //       'templateOrganizer',
  //     );
  //     const deleteOrganizer = await sdk.templateOrganizer.deleteById(
  //       checkTemplateOrganizer._id,
  //     );
  //     expect(deleteOrganizer).eq('Success.');
  //   });
});

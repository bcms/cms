import { expect } from 'chai';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Login, ObjectUtil, sdk } from '../util';

const mediaId: string[] = [];
let dirId: string;
describe('Media API', async () => {
  Login();
  it('should create upload image.jpeg', async () => {
    const file = await fs.readFile(
      path.join(__dirname, '..', 'assets', 'image.jpeg'),
    );
    const media = await sdk.media.createFile({
      file,
      fileName: 'image.jpeg',
    });
    mediaId.push(media._id);
    expect(media).to.be.instanceOf(Object);
    expect(media).to.have.property('_id').to.be.a('string');
    expect(media).to.have.property('createdAt').to.be.a('number');
    expect(media).to.have.property('updatedAt').to.be.a('number');
    expect(media).to.have.property('name').to.be.a('string');
    ObjectUtil.eq(
      media,
      {
        hasChildren: false,
        isInRoot: true,
        mimetype: 'image/jpeg',
        parentId: '',
        size: 63655,
        type: 'IMG',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: 700,
        width: 1120,
      },
      'media',
    );
  });
  it('should create upload again image.jpeg', async () => {
    const file = await fs.readFile(
      path.join(__dirname, '..', 'assets', 'image.jpeg'),
    );
    const media = await sdk.media.createFile({
      file,
      fileName: 'image.jpeg',
    });
    mediaId.push(media._id);
    expect(media).to.be.instanceOf(Object);
    expect(media).to.have.property('_id').to.be.a('string');
    expect(media).to.have.property('createdAt').to.be.a('number');
    expect(media).to.have.property('updatedAt').to.be.a('number');
    expect(media).to.have.property('name').to.be.a('string').not.eq(mediaId[0]);

    ObjectUtil.eq(
      media,
      {
        hasChildren: false,
        isInRoot: true,
        mimetype: 'image/jpeg',
        parentId: '',
        size: 63655,
        type: 'IMG',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: 700,
        width: 1120,
      },
      'media',
    );
  });
  it('should delete media from previous steps', async () => {
    for (let i = 0; i < mediaId.length; i++) {
      await sdk.media.deleteById(mediaId[i]);
      try {
        await sdk.media.getById(mediaId[i]);
        throw Error('Media is still available after deleting it.');
      } catch (error) {
        expect(error)
          .to.be.an('object')
          .to.have.property('code')
          .to.eq('mda001');
      }
    }
  });
  it('should create DIR called "p1" in root', async () => {
    const media = await sdk.media.createDir({
      name: 'p1',
      parentId: '',
    });
    dirId = media._id;
    expect(media).to.be.instanceOf(Object);
    expect(media).to.have.property('_id').to.be.a('string');
    expect(media).to.have.property('createdAt').to.be.a('number');
    expect(media).to.have.property('updatedAt').to.be.a('number');
    expect(media).to.have.property('name').to.be.a('string');
    ObjectUtil.eq(
      media,
      {
        hasChildren: true,
        isInRoot: true,
        mimetype: 'dir',
        parentId: '',
        size: 0,
        type: 'DIR',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: -1,
        width: -1,
      },
      'media',
    );
  });

  it('should delete DIR called "p1"', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(dirId).to.be.a('string');
    await sdk.media.deleteById(dirId);
    try {
      await sdk.media.getById(dirId);
      throw Error('Media is still available after deleting it.');
    } catch (error) {
      expect(error).to.be.an('object').to.have.property('code').to.eq('mda001');
    }
  });

  let imageName: string;
  let imageId: string;
  let videoName: string;
  let videoId: string;
  it('should create DIR called "p1" and upload "image.jpeg" and "video.mp4" to it', async () => {
    const media = await sdk.media.createDir({
      name: 'p1',
      parentId: '',
    });
    dirId = media._id;
    expect(media).to.be.instanceOf(Object);
    expect(media).to.have.property('_id').to.be.a('string');
    expect(media).to.have.property('createdAt').to.be.a('number');
    expect(media).to.have.property('updatedAt').to.be.a('number');
    expect(media).to.have.property('name').to.be.a('string');
    ObjectUtil.eq(
      media,
      {
        hasChildren: true,
        isInRoot: true,
        mimetype: 'dir',
        parentId: '',
        size: 0,
        type: 'DIR',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: -1,
        width: -1,
      },
      'media',
    );
    const file = await fs.readFile(
      path.join(__dirname, '..', 'assets', 'image.jpeg'),
    );
    const mediaImage = await sdk.media.createFile({
      file,
      fileName: 'image.jpeg',
      parentId: dirId,
    });
    imageId = mediaImage._id;
    imageName = mediaImage.name;
    expect(mediaImage).to.be.instanceOf(Object);
    expect(mediaImage).to.have.property('_id').to.be.a('string');
    expect(mediaImage).to.have.property('createdAt').to.be.a('number');
    expect(mediaImage).to.have.property('updatedAt').to.be.a('number');
    expect(mediaImage).to.have.property('name').to.be.a('string');

    ObjectUtil.eq(
      mediaImage,
      {
        hasChildren: false,
        isInRoot: false,
        mimetype: 'image/jpeg',
        parentId: dirId,
        size: 63655,
        type: 'IMG',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: 700,
        width: 1120,
      },
      'media',
    );
    const fileVideo = await fs.readFile(
      path.join(__dirname, '..', 'assets', 'video.mp4'),
    );
    const mediaVideo = await sdk.media.createFile({
      file: fileVideo,
      fileName: 'video.mp4',
      parentId: dirId,
    });
    videoName = mediaVideo.name;
    expect(mediaVideo).to.be.instanceOf(Object);
    expect(mediaVideo).to.have.property('_id').to.be.a('string');
    expect(mediaVideo).to.have.property('createdAt').to.be.a('number');
    expect(mediaVideo).to.have.property('updatedAt').to.be.a('number');
    expect(mediaVideo).to.have.property('name').to.be.a('string');
    ObjectUtil.eq(
      mediaVideo,
      {
        hasChildren: false,
        isInRoot: false,
        mimetype: 'video/mp4',
        parentId: dirId,
        size: 58799,
        type: 'VID',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: -1,
        width: -1,
      },
      'media',
    );
    expect(mediaImage).to.have.property('parentId').to.be.a('string').eq(dirId);

    const getDir = await sdk.media.getById(dirId);
    expect(getDir).to.be.instanceOf(Object);
    expect(getDir).to.have.property('_id').to.be.a('string');
    expect(getDir).to.have.property('createdAt').to.be.a('number');
    expect(getDir).to.have.property('updatedAt').to.be.a('number');
    expect(getDir).to.have.property('name').to.be.a('string');
    ObjectUtil.eq(
      getDir,
      {
        hasChildren: true,
        isInRoot: true,
        mimetype: 'dir',
        parentId: '',
        size: 0,
        type: 'DIR',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: -1,
        width: -1,
      },
      'media',
    );
  });
  it('should get all media from "p1" DIR', async () => {
    const getAllDir = await sdk.media.getAllByParentId(dirId);
    expect(getAllDir).to.be.a('array');
    expect(getAllDir.length).to.be.eq(2);
    expect(getAllDir[0]).to.have.property('name').eq(imageName);
    expect(getAllDir[1]).to.have.property('name').eq(videoName);
  });

  it('should delete "image.jpeg"', async () => {
    expect(imageId).to.be.a('string');
    await sdk.media.deleteById(imageId);
    try {
      await sdk.media.getById(imageId);
      throw Error('Media is still available after deleting it.');
    } catch (error) {
      expect(error).to.be.an('object').to.have.property('status').to.eq(404);
    }
    const getAllDir = await sdk.media.getAllByParentId(dirId);
    expect(getAllDir).to.be.a('array');
    expect(getAllDir.length).to.be.eq(1);
    expect(getAllDir[0]).to.have.property('name').eq(videoName);
  });

  it('should delete "p1" DIR', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(dirId).to.be.a('string');
    await sdk.media.deleteById(dirId);
    try {
      await sdk.media.getById(dirId);
      throw Error('Media is still available after deleting it.');
    } catch (error) {
      expect(error).to.be.an('object').to.have.property('code').to.eq('mda001');
    }
  });
  it('should check if Image thumbnail is created', async () => {
    const file = await fs.readFile(
      path.join(__dirname, '..', 'assets', 'image.jpeg'),
    );
    const media = await sdk.media.createFile({
      file,
      fileName: 'image.jpeg',
    });
    expect(media).to.be.instanceOf(Object);
    expect(media).to.have.property('_id').to.be.a('string');
    expect(media).to.have.property('createdAt').to.be.a('number');
    expect(media).to.have.property('updatedAt').to.be.a('number');
    expect(media).to.have.property('name').to.be.a('string');
    ObjectUtil.eq(
      media,
      {
        hasChildren: false,
        isInRoot: true,
        mimetype: 'image/jpeg',
        parentId: '',
        size: 63655,
        type: 'IMG',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: 700,
        width: 1120,
      },
      'media',
    );

    const binaryMedia = await sdk.media.getBinary(media._id, 'small');
    expect(binaryMedia).to.be.instanceOf(Buffer);
    await sdk.media.deleteById(media._id);
    try {
      await sdk.media.getById(media._id);
    } catch (error) {
      expect(error).to.be.an('object').to.have.property('code').to.eq('mda001');
    }
  });
  it('should check if Video thumbnail is created', async () => {
    const file = await fs.readFile(
      path.join(__dirname, '..', 'assets', 'video.mp4'),
    );
    const media = await sdk.media.createFile({
      file,
      fileName: 'video.mp4',
    });
    expect(media).to.be.instanceOf(Object);
    expect(media).to.have.property('_id').to.be.a('string');
    expect(media).to.have.property('createdAt').to.be.a('number');
    expect(media).to.have.property('updatedAt').to.be.a('number');
    expect(media).to.have.property('name').to.be.a('string');
    ObjectUtil.eq(
      media,
      {
        hasChildren: false,
        isInRoot: true,
        mimetype: 'video/mp4',
        parentId: '',
        size: 58799,
        type: 'VID',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: -1,
        width: -1,
      },
      'media',
    );

    const binaryVideoThumbnail = await sdk.media.getVideoThumbnail(media._id);
    expect(binaryVideoThumbnail).to.be.instanceOf(Buffer);

    await sdk.media.deleteById(media._id);
    try {
      await sdk.media.getById(media._id);
    } catch (error) {
      expect(error).to.be.an('object').to.have.property('code').to.eq('mda001');
    }
  });

  it('should get many media by IDs', async () => {
    const fileImage = await fs.readFile(
      path.join(__dirname, '..', 'assets', 'image.jpeg'),
    );
    const mediaImage = await sdk.media.createFile({
      file: fileImage,
      fileName: 'image.jpeg',
    });
    imageId = mediaImage._id;
    expect(mediaImage).to.be.instanceOf(Object);
    expect(mediaImage).to.have.property('_id').to.be.a('string');
    expect(mediaImage).to.have.property('createdAt').to.be.a('number');
    expect(mediaImage).to.have.property('updatedAt').to.be.a('number');
    expect(mediaImage).to.have.property('name').to.be.a('string');
    ObjectUtil.eq(
      mediaImage,
      {
        hasChildren: false,
        isInRoot: true,
        mimetype: 'image/jpeg',
        parentId: '',
        size: 63655,
        type: 'IMG',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: 700,
        width: 1120,
      },
      'media',
    );
    const fileVideo = await fs.readFile(
      path.join(__dirname, '..', 'assets', 'video.mp4'),
    );
    const mediaVideo = await sdk.media.createFile({
      file: fileVideo,
      fileName: 'video.mp4',
    });
    videoId = mediaVideo._id;
    expect(mediaVideo).to.be.instanceOf(Object);
    expect(mediaVideo).to.have.property('_id').to.be.a('string');
    expect(mediaVideo).to.have.property('createdAt').to.be.a('number');
    expect(mediaVideo).to.have.property('updatedAt').to.be.a('number');
    expect(mediaVideo).to.have.property('name').to.be.a('string');
    ObjectUtil.eq(
      mediaVideo,
      {
        hasChildren: false,
        isInRoot: true,
        mimetype: 'video/mp4',
        parentId: '',
        size: 58799,
        type: 'VID',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: -1,
        width: -1,
      },
      'media',
    );
    const results = await sdk.media.getMany([imageId, videoId]);
    expect(results).to.be.a('array');
    expect(results.length).gte(0);
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      expect(result).to.be.instanceOf(Object);
      expect(result).to.have.property('_id').to.be.a('string');
      expect(result).to.have.property('createdAt').to.be.a('number');
      expect(result).to.have.property('updatedAt').to.be.a('number');
      expect(result)
        .to.have.property('mimetype')
        .to.be.a('string')
        .oneOf(['image/jpeg', 'video/mp4']);
      expect(result).to.have.property('name').to.be.a('string');
      expect(result).to.have.property('size').to.be.a('number');
      expect(result).to.have.property('type').to.be.a('string');
      expect(result).to.have.property('height').to.be.a('number');
      expect(result).to.have.property('width').to.be.a('number');
      ObjectUtil.eq(result, {
        hasChildren: false,
        isInRoot: true,
        parentId: '',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
      });
    }
  });
  it('should update "image.jpeg" to have name "new-image.jpeg"', async () => {
    expect(imageId).to.be.a('string');
    const updateMedia = await sdk.media.updateFile({
      _id: imageId,
      name: 'new-image',
    });
    expect(updateMedia).to.be.instanceOf(Object);
    expect(updateMedia).to.have.property('_id').to.be.a('string').eq(imageId);
    expect(updateMedia).to.have.property('createdAt').to.be.a('number');
    expect(updateMedia).to.have.property('updatedAt').to.be.a('number');
    expect(updateMedia)
      .to.have.property('name')
      .to.be.a('string')
      .eq('new-image.jpeg');
    ObjectUtil.eq(
      updateMedia,
      {
        hasChildren: false,
        isInRoot: true,
        mimetype: 'image/jpeg',
        parentId: '',
        size: 63655,
        type: 'IMG',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: 700,
        width: 1120,
      },
      'media',
    );
  });
  it('should duplicate "video.mp4" to "p1" DIR', async () => {
    const media = await sdk.media.createDir({
      name: 'p1',
      parentId: '',
    });
    dirId = media._id;
    expect(media).to.be.instanceOf(Object);
    expect(media).to.have.property('_id').to.be.a('string');
    expect(media).to.have.property('createdAt').to.be.a('number');
    expect(media).to.have.property('updatedAt').to.be.a('number');
    expect(media).to.have.property('name').to.be.a('string');
    ObjectUtil.eq(
      media,
      {
        hasChildren: true,
        isInRoot: true,
        mimetype: 'dir',
        parentId: '',
        size: 0,
        type: 'DIR',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: -1,
        width: -1,
      },
      'media',
    );
    const newDuplicateMedia = await sdk.media.duplicateFile({
      _id: videoId,
      duplicateTo: dirId,
    });
    expect(newDuplicateMedia).to.be.instanceOf(Object);
    expect(newDuplicateMedia).to.have.property('_id').to.be.a('string');
    expect(newDuplicateMedia).to.have.property('createdAt').to.be.a('number');
    expect(newDuplicateMedia).to.have.property('updatedAt').to.be.a('number');
    expect(newDuplicateMedia)
      .to.have.property('name')
      .to.be.a('string')
      .to.have.string('copyof-');
    ObjectUtil.eq(
      newDuplicateMedia,
      {
        hasChildren: false,
        isInRoot: false,
        mimetype: 'video/mp4',
        parentId: dirId,
        size: 58799,
        type: 'VID',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: -1,
        width: -1,
      },
      'media',
    );
  });
  let moveDirId: string;
  it('should move "new-image.jpeg" to "p2" DIR', async () => {
    const media = await sdk.media.createDir({
      name: 'p2',
      parentId: '',
    });
    moveDirId = media._id;
    expect(media).to.be.instanceOf(Object);
    expect(media).to.have.property('_id').to.be.a('string');
    expect(media).to.have.property('createdAt').to.be.a('number');
    expect(media).to.have.property('updatedAt').to.be.a('number');
    expect(media).to.have.property('name').to.be.a('string');
    ObjectUtil.eq(
      media,
      {
        hasChildren: true,
        isInRoot: true,
        mimetype: 'dir',
        parentId: '',
        size: 0,
        type: 'DIR',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: -1,
        width: -1,
      },
      'media',
    );
    const moveMediaAll = await sdk.media.moveFile({
      _id: imageId,
      moveTo: moveDirId,
    });
    expect(moveMediaAll).to.be.instanceOf(Object);
    expect(moveMediaAll).to.have.property('_id').to.be.a('string').eq(imageId);
    expect(moveMediaAll).to.have.property('createdAt').to.be.a('number');
    expect(moveMediaAll).to.have.property('updatedAt').to.be.a('number');
    expect(moveMediaAll)
      .to.have.property('name')
      .to.be.a('string')
      .eq('new-image.jpeg');
    ObjectUtil.eq(
      moveMediaAll,
      {
        hasChildren: false,
        isInRoot: false,
        mimetype: 'image/jpeg',
        parentId: moveDirId,
        size: 63655,
        type: 'IMG',
        userId: '111111111111111111111111',
        altText: '',
        caption: '',
        height: 700,
        width: 1120,
      },
      'media',
    );
  });
  it('should clear data from media tests', async () => {
    const allMedia: string[] = [imageId, videoId, dirId, moveDirId];
    for (let i = 0; i < allMedia.length; i++) {
      await sdk.media.deleteById(allMedia[i]);
      try {
        await sdk.media.getById(allMedia[i]);
        throw Error('Media is still available after deleting it.');
      } catch (error) {
        expect(error)
          .to.be.an('object')
          .to.have.property('code')
          .to.eq('mda001');
      }
    }
  });
});

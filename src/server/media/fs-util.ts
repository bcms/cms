import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as uuid from 'uuid';
import { FolderTree, FolderTreeType } from './interfaces/folder-tree.interface';

export class FSUtil {
  private static base = path.join(process.env.PROJECT_ROOT, 'uploads');

  public static async save(
    data: string | Buffer,
    root: string,
  ) {
    const parts = root.split('/');
    let base: string = `${FSUtil.base}`;
    // tslint:disable-next-line: prefer-for-of
    for (let j = 0; j < parts.length; j = j + 1) {
      if (parts[j].indexOf('.') === -1) {
        base = path.join(base, parts[j]);
        try {
          if ((await util.promisify(fs.exists)(base)) === false) {
            await util.promisify(fs.mkdir)(base);
          }
        } catch (error) {
          // tslint:disable-next-line:no-console
          console.log(`Failed to create directory '${base}'`);
        }
      }
    }
    await util.promisify(fs.writeFile)(
      path.join(base, parts[parts.length - 1]),
      data,
    );
  }

  public static async mkdir(root: string, isAbsolute?: boolean) {
    const parts = root.split('/');
    let base: string = `${FSUtil.base}`;
    // tslint:disable-next-line: prefer-for-of
    for (let j = 0; j < parts.length; j = j + 1) {
      if (parts[j].indexOf('.') === -1) {
        base = path.join(base, parts[j]);
        try {
          if ((await util.promisify(fs.exists)(base)) === false) {
            await util.promisify(fs.mkdir)(base);
          }
        } catch (error) {
          // tslint:disable-next-line:no-console
          console.log(`Failed to create directory '${base}'`);
        }
      }
    }
  }

  public static async read(root: string) {
    return await util.promisify(fs.readFile)(
      path.join(FSUtil.base, root),
    );
  }

  public static async exist(root: string) {
    return await util.promisify(fs.exists)(
      path.join(FSUtil.base, root),
    );
  }

  public static async deleteFile(root: string) {
    await util.promisify(fs.unlink)(path.join(FSUtil.base, root));
  }

  public static async deleteDir(root: string) {
    await fsExtra.remove(path.join(FSUtil.base, root));
  }

  public static async rename(oldRoot: string, newRoot: string) {
    await util.promisify(fs.rename)(
      path.join(FSUtil.base, oldRoot),
      path.join(FSUtil.base, newRoot),
    );
  }

  public static async folderTree(
    p: string,
    relativePath?: string,
  ): Promise<FolderTree[]> {
    if (!relativePath) {
      relativePath = '';
    }
    const folderTree: FolderTree[] = [];
    try {
      const result = await util.promisify(fs.readdir)(p);
      for (const i in result) {
        if (result[i].indexOf('.') === -1) {
          folderTree.push({
            id: uuid.v4(),
            name: result[i],
            path: `${relativePath}/${result[i]}`,
            type: FolderTreeType.DIR,
            children: await FSUtil.folderTree(
              path.join(p, result[i]),
              `${relativePath}/${result[i]}`,
            ),
            state: false,
          });
        } else {
          const entity = {
            id: uuid.v4(),
            name: result[i],
            type: FolderTreeType.DIR,
            path: `${relativePath}/${result[i]}`,
            state: false,
          };
          const extParts = result[i].split('.');
          const ext = extParts[extParts.length - 1];
          if (
            ext === 'png' ||
            ext === 'jpg' ||
            ext === 'jpeg' ||
            ext === 'svg'
          ) {
            entity.type = FolderTreeType.IMG;
          } else if (
            ext === 'mov' ||
            ext === 'mp4' ||
            ext === 'mpeg' ||
            ext === 'avi' ||
            ext === 'mkv' ||
            ext === 'wmv' ||
            ext === 'mpg' ||
            ext === 'm2v' ||
            ext === 'm4v'
          ) {
            entity.type = FolderTreeType.VID;
          } else if (ext === 'PDF') {
            entity.type = FolderTreeType.PDF;
          } else if (ext === 'gif') {
            entity.type = FolderTreeType.GIF;
          } else if (ext === 'ts' || ext === 'sh' || ext === 'go') {
            entity.type = FolderTreeType.CODE;
          } else if (ext === 'js') {
            entity.type = FolderTreeType.JS;
          } else if (ext === 'html') {
            entity.type = FolderTreeType.HTML;
          } else if (ext === 'css') {
            entity.type = FolderTreeType.CSS;
          } else if (ext === 'java') {
            entity.type = FolderTreeType.JAVA;
          } else if (ext === 'php') {
            entity.type = FolderTreeType.PHP;
          } else if (ext === 'ttf' || ext === 'woff' || ext === 'woff2' || ext === 'eot') {
            entity.type = FolderTreeType.FONT;
          } else {
            entity.type = FolderTreeType.OTH;
          }
          folderTree.push(entity);
        }
      }
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(`'${p}' does not exist.`);
    }
    return folderTree;
  }

  public static composeFolderTree(folderTree: FolderTree[]): string[] {
    const roots: string[] = [];
    folderTree.forEach(ft => {
      const root = ft.name;
      let childRoots: string[] = [];
      if (ft.children) {
        childRoots = FSUtil.composeFolderTree(ft.children);
        if (childRoots.length === 0) {
          roots.push(root);
        } else {
          childRoots.forEach(cr => {
            roots.push(`${root}/${cr}`);
          });
        }
      }
    });
    return roots;
  }
}

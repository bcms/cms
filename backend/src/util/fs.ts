import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';

export async function bcmsGetDirFileTree(
  startingLocation: string,
  location: string,
): Promise<
  Array<{
    rel: string;
    abs: string;
  }>
> {
  const output: Array<{
    rel: string;
    abs: string;
  }> = [];
  const basePath = path.join(startingLocation, location);
  const files = await util.promisify(fs.readdir)(basePath);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(basePath, file);
    const stat = await util.promisify(fs.lstat)(filePath);
    if (stat.isDirectory()) {
      const children = await bcmsGetDirFileTree(
        startingLocation,
        path.join(location, file),
      );
      for (let j = 0; j < children.length; j++) {
        const child = children[j];
        output.push(child);
      }
    } else {
      output.push({
        abs: filePath,
        rel: location,
      });
    }
  }
  return output;
}

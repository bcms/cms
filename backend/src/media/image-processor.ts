import * as path from 'path';
import * as sharp from 'sharp';
import {
  BCMSImageProcessorProcessOptions,
  BCMSMedia,
  BCMSMediaType,
} from '@backend/types';
import { useFS, useLogger } from '@becomes/purple-cheetah';

const defaultSizeMap: Array<{ width: number; height?: number }> = [
  {
    width: 350,
  },
  {
    width: 650,
  },
  {
    width: 900,
  },
  {
    width: 1200,
  },
  {
    width: 1920,
  },
];
const mimetypeMap: {
  jpg: string[];
  png: string[];
} = {
  jpg: ['image/jpeg', 'image/pjpeg', 'image/jpg'],
  png: ['image/png'],
};

export class BCMSImageProcessor {
  private static readonly logger = useLogger({
    name: 'Image processor',
  });
  private static readonly fs = useFS({
    base: path.join(process.cwd(), 'uploads'),
  });

  static optionsToString(options: BCMSImageProcessorProcessOptions): string {
    const ops: string[] = [];
    if (options.position) {
      ops.push(`_p${options.position}`);
    }
    if (options.quality) {
      ops.push(`_q${options.quality}`);
    }
    if (options.sizes) {
      if (options.sizes.auto) {
        ops.push('_sa');
      } else if (options.sizes.exec) {
        ops.push(
          `_se${options.sizes.exec
            .map((e) => `${e.width}x${e.height ? e.height : 'a'}`)
            .join('-')}`,
        );
      } else if (options.sizes.steps) {
        ops.push(`_ss${options.sizes.steps}`);
      }
    }
    return ops.join('');
  }

  static stringToOptions(options: string): BCMSImageProcessorProcessOptions {
    const ops: BCMSImageProcessorProcessOptions = {};
    const segments = options.split('_');
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (seg.startsWith('p')) {
        ops.position = seg.substring(1) as never;
      } else if (seg.startsWith('q')) {
        const quality = parseInt(seg.substring(1));
        if (!isNaN(quality)) {
          ops.quality = quality;
        }
      } else if (seg.startsWith('sa')) {
        ops.sizes = {
          auto: true,
        };
      } else if (seg.startsWith('ss')) {
        const stepSize = parseInt(seg.substring(2));
        if (!isNaN(stepSize)) {
          ops.sizes = { steps: stepSize };
        }
      } else if (seg.startsWith('se')) {
        const sizes: Array<{
          width: number;
          height?: number;
        }> = [];
        const sizeSegments = seg.substring(2).split('-');
        for (let j = 0; j < sizeSegments.length; j++) {
          const sizeSeg = sizeSegments[j];
          const [widthS, heightS] = sizeSeg.split('x');
          let width = -1;
          let height: number | undefined = undefined;
          if (widthS) {
            width = parseInt(widthS);
          }
          if (heightS && heightS !== 'a') {
            height = parseInt(heightS);
            if (isNaN(height)) {
              height = undefined;
            }
          }
          if (width !== -1 && !isNaN(width)) {
            sizes.push({
              width,
              height,
            });
          }
        }
        ops.sizes = {
          exec: sizes,
        };
      }
    }
    return ops;
  }

  static async process({
    media,
    pathToSrc,
    options,
  }: {
    media: BCMSMedia;
    pathToSrc: string;
    options: BCMSImageProcessorProcessOptions;
  }): Promise<void> {
    if (media.type !== BCMSMediaType.IMG) {
      throw Error(`Input file is of type ${media.type} is not IMG.`);
    }
    if (!(await BCMSImageProcessor.fs.exist(pathToSrc, true))) {
      throw Error(`File does not exist at path: ${pathToSrc}`);
    }
    const inputFile = await BCMSImageProcessor.fs.read(pathToSrc);
    let sizes: Array<{
      width: number;
      height?: number;
    }> = [];
    if (options.sizes) {
      if (options.sizes.auto) {
        sizes = defaultSizeMap;
      } else if (options.sizes.exec) {
        sizes = options.sizes.exec;
      } else if (options.sizes.steps) {
        const widthStep = media.width / options.sizes.steps;
        const heightStep = media.height / options.sizes.steps;
        for (let i = 0; i <= options.sizes; i++) {
          sizes.push({
            width: widthStep + widthStep * i,
            height: heightStep + heightStep * i,
          });
        }
      }
    }
    let createWebP = false;
    const fileNameParts = media.name.split('.');
    const fileName = fileNameParts.slice(0, fileNameParts.length - 1);
    const fileExt = fileNameParts[fileNameParts.length - 1];
    const outputBasePath = path.join(
      process.cwd(),
      'uploads',
      media._id,
      BCMSImageProcessor.optionsToString(options),
    );
    if (mimetypeMap.jpg.includes(media.mimetype)) {
      createWebP = true;
      for (let i = 0; i < sizes.length; i++) {
        const outputFilePath = path.join(
          outputBasePath,
          `${fileName.join('.')}_${i}.${fileExt}`,
        );
        if (!(await BCMSImageProcessor.fs.exist(outputFilePath, true))) {
          const size = sizes[i];
          const file = await sharp(inputFile)
            .resize({
              fit: options.position ? options.position : 'cover',
              width: size.width,
              height: size.height,
              withoutEnlargement: false,
            })
            .jpeg({
              quality: options.quality ? options.quality : 70,
            })
            .toBuffer();
          await BCMSImageProcessor.fs.save(outputFilePath, file);
        }
      }
    } else if (mimetypeMap.png.includes(media.mimetype)) {
      createWebP = true;
      for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        const outputFilePath = path.join(
          outputBasePath,
          `${fileName.join('.')}_${i}.${fileExt}`,
        );
        if (!(await BCMSImageProcessor.fs.exist(outputFilePath, true))) {
          const file = await sharp(inputFile)
            .resize({
              fit: options.position ? options.position : 'cover',
              width: size.width,
              height: size.height,
              withoutEnlargement: false,
            })
            .png({
              quality: options.quality ? options.quality : 70,
            })
            .toBuffer();
          await BCMSImageProcessor.fs.save(outputFilePath, file);
        }
      }
    }
    if (createWebP) {
      for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        const outputFilePath = path.join(
          outputBasePath,
          `${fileName.join('.')}_${i}.webp`,
        );
        if (!(await BCMSImageProcessor.fs.exist(outputFilePath, true))) {
          const file = await sharp(inputFile)
            .resize({
              fit: options.position ? options.position : 'cover',
              width: size.width,
              height: size.height,
              withoutEnlargement: false,
            })
            .webp({
              quality: options.quality ? options.quality : 70,
            })
            .toBuffer();
          await BCMSImageProcessor.fs.save(outputFilePath, file);
        }
      }
    }
  }
}

import { MediaType } from './models/media.model';

export class MediaUtil {
  public static mimetypeToMediaType(mimetype: string): MediaType {
    switch (mimetype.split('/')[0]) {
      case 'image': {
        return MediaType.IMG;
      }
      default: {
        return MediaType.OTH;
      }
    }
  }
}

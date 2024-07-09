import { MediaType } from '@thebcms/selfhosted-backend/media/models/main';

const mimetypeMap: {
    css: string[];
    js: string[];
} = {
    css: ['application/x-pointplus', 'text/css'],
    js: [
        'application/x-javascript',
        'application/javascript',
        'application/ecmascript',
        'text/javascript',
        'text/ecmascript',
    ],
};

export function mimetypeToMediaType(mimetype: string): MediaType {
    switch (mimetype) {
        case 'dir': {
            return MediaType.DIR;
        }
        case 'image/gif': {
            return MediaType.GIF;
        }
        case 'application/pdf': {
            return MediaType.PDF;
        }
        case 'text/html': {
            return MediaType.HTML;
        }
        case 'text/x-java-source': {
            return MediaType.JAVA;
        }
        case 'image/svg+xml': {
            return MediaType.SVG;
        }
    }
    if (mimetypeMap.js.includes(mimetype)) {
        return MediaType.JS;
    }
    if (mimetypeMap.css.includes(mimetype)) {
        return MediaType.CSS;
    }
    switch (mimetype.split('/')[0]) {
        case 'image': {
            return MediaType.IMG;
        }
        case 'video': {
            return MediaType.VID;
        }
        case 'text': {
            return MediaType.TXT;
        }
        default: {
            return MediaType.OTH;
        }
    }
}

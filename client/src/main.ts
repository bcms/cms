import axios, { type AxiosRequestConfig } from 'axios';
import { TemplateHandler } from '@bcms/selfhosted-client/handlers/template';
import { TypeGeneratorHandler } from '@bcms/selfhosted-client/handlers/type-generator';
import { EntryHandler } from '@bcms/selfhosted-client/handlers/entry';
import { EntryStatusHandler } from '@bcms/selfhosted-client/handlers/entry-status';
import { GroupHandler } from '@bcms/selfhosted-client/handlers/group';
import { LanguageHandler } from '@bcms/selfhosted-client/handlers/language';
import { MediaHandler } from '@bcms/selfhosted-client/handlers/media';
import { WidgetHandler } from '@bcms/selfhosted-client/handlers/widget';
import { SocketHandler } from '@bcms/selfhosted-client/handlers/socket';

export interface ClientApiKey {
    id: string;
    secret: string;
}

export class Client {
    useMemCache = false;
    debug = false;
    enableSocket = false;
    injectSvg = false;

    template = new TemplateHandler(this);
    typeGenerator = new TypeGeneratorHandler(this);
    entry = new EntryHandler(this);
    entryStatus = new EntryStatusHandler(this);
    group = new GroupHandler(this);
    language = new LanguageHandler(this);
    media = new MediaHandler(this);
    widget = new WidgetHandler(this);
    socket: SocketHandler = new SocketHandler(this);

    constructor(
        public cmsOrigin: string,
        public apiKeyInfo: ClientApiKey,
        options?: {
            useMemCache?: boolean;
            debug?: boolean;
            enableSocket?: boolean;
            injectSvg?: boolean;
        },
    ) {
        if (options) {
            if (options.useMemCache) {
                this.useMemCache = options.useMemCache;
            }
            if (options.debug) {
                this.debug = options.debug;
            }
            if (options.enableSocket) {
                this.enableSocket = options.enableSocket;
                this.socket.connect().catch((err) => {
                    console.error(err);
                });
            }
            if (options.injectSvg) {
                this.injectSvg = options.injectSvg;
            }
        }
    }

    async send<Data = unknown>(config: AxiosRequestConfig): Promise<Data> {
        if (!config.headers) {
            config.headers = {};
        }
        config.headers.Authorization = `ApiKey ${this.apiKeyInfo.id}.${this.apiKeyInfo.secret}`;
        config.url = `${this.cmsOrigin}${config.url}`;
        const res = await axios(config);
        return res.data;
    }
}

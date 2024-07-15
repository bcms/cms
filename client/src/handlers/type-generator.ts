import type { Client } from '@thebcms/selfhosted-client/main';
import type {
    TypeGeneratorFile,
    TypeGeneratorLanguage,
} from '@thebcms/selfhosted-backend/type-generator/generator/main';
import type { ControllerItemsResponse } from '@thebcms/selfhosted-backend/util/controller';

export class TypeGeneratorHandler {
    private baseUri = '/api/v4/type-generator';

    constructor(private client: Client) {}

    async getFiles(lang: TypeGeneratorLanguage) {
        const res = await this.client.send<
            ControllerItemsResponse<TypeGeneratorFile>
        >({
            url: `${this.baseUri}/${lang}`,
        });
        return res.items;
    }
}

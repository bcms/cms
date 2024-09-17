import type { Client } from '@bcms/selfhosted-client/main';
import type {
    TypeGeneratorFile,
    TypeGeneratorLanguage,
} from '@bcms/selfhosted-backend/type-generator/generator/main';
import type { ControllerItemsResponse } from '@bcms/selfhosted-backend/util/controller';

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

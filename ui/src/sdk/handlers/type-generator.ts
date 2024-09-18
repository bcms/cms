import { Handler } from '@bcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@bcms/selfhosted-sdk';
import type {
    TypeGeneratorFile,
    TypeGeneratorLanguage,
} from '@bcms/selfhosted-backend/type-generator/generator/main';
import type { ControllerItemsResponse } from '@bcms/selfhosted-backend/util/controller';

export class TypeGeneratorHandler extends Handler {
    private baseUri = '/api/v4/type-generator';

    constructor(private sdk: Sdk) {
        super();
    }

    clear() {
        // Do nothing
    }

    async getTypes(lang: TypeGeneratorLanguage) {
        const result = await this.sdk.send<
            ControllerItemsResponse<TypeGeneratorFile>
        >({
            url: `${this.baseUri}/${lang}`,
        });
        return result.items;
    }
}

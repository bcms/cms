import { Handler } from '@thebcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@thebcms/selfhosted-sdk';
import type { ControllerItemsResponse } from '@thebcms/selfhosted-backend/util/controller';
import type { BCMSFunctionConfig } from '@thebcms/selfhosted-backend/function/models/main';
import type { FunctionExecuteResult } from '@thebcms/selfhosted-backend/function/models/controller';

export class FunctionHandler extends Handler {
    private baseUri = '/api/v4/function';

    constructor(private sdk: Sdk) {
        super();
    }

    clear() {
        // Do nothing
    }

    async available() {
        const result = await this.sdk.send<
            ControllerItemsResponse<BCMSFunctionConfig>
        >({
            url: `${this.baseUri}/available`,
        });
        return result.items;
    }

    async execute<Body = unknown, Result = unknown>(name: string, body?: Body) {
        return await this.sdk.send<FunctionExecuteResult<Result>>({
            url: `${this.baseUri}/${name}`,
            method: 'POST',
            data: body,
        });
    }
}
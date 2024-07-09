import { Handler } from '@thebcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@thebcms/selfhosted-sdk';
import type {
    AuthLoginBody,
    AuthLoginResponse,
    AuthSignUpAdminBody,
} from '@thebcms/selfhosted-backend/auth/models/controller';

export class AuthHandler extends Handler {
    private baseUri = '/api/v4/auth';

    constructor(private sdk: Sdk) {
        super();
    }

    clear() {
        // Do nothing
    }

    async shouldSignUp(): Promise<boolean> {
        const result = await this.sdk.send<{ yes: boolean }>({
            url: `${this.baseUri}/should-signup`,
            doNotAuth: true,
        });
        return result.yes;
    }

    async signUpAdmin(data: AuthSignUpAdminBody) {
        const result = await this.sdk.send<AuthLoginResponse>({
            url: `${this.baseUri}/signup-admin`,
            method: 'POST',
            doNotAuth: true,
            data,
        });
        await this.sdk.storage.set('at', result.accessToken);
        await this.sdk.storage.set('rt', result.refreshToken);
    }

    async login(data: AuthLoginBody) {
        const result = await this.sdk.send<AuthLoginResponse>({
            url: `${this.baseUri}/login`,
            method: 'POST',
            doNotAuth: true,
            data,
        });
        await this.sdk.storage.set('at', result.accessToken);
        await this.sdk.storage.set('rt', result.refreshToken);
    }

    async logout() {
        const rt = this.sdk.storage.get('rt');
        if (rt) {
            await this.sdk.send({
                url: `${this.baseUri}/logout`,
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${rt}`,
                },
                doNotAuth: true,
            });
        }
        await this.sdk.clear();
    }
}

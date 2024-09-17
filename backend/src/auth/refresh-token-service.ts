import crypto from 'crypto';
import { createQueue } from '@bcms/selfhosted-backend/_utils/queue';
export interface RefreshToken {
    userId: string;
    value: string;
    expAt: number;
}

const tokens: RefreshToken[] = [];

export class RefreshTokenService {
    private static clearQueue = createQueue<void>();

    static generate(userId: string) {
        const value = crypto
            .createHash('sha512')
            .update(crypto.randomBytes(16).toString('hex') + Date.now())
            .digest('hex');
        tokens.push({
            expAt: Date.now() + 2592000000,
            userId,
            value,
        });
        return value;
    }

    private static async clear() {
        await this.clearQueue({
            name: 'clear',
            handler: async () => {
                for (let i = tokens.length - 1; i > -1; i--) {
                    if (tokens[i].expAt < Date.now()) {
                        tokens.splice(i, 1);
                    }
                }
            },
        }).wait;
    }

    static async valid(userId: string, token: string): Promise<boolean> {
        await this.clear();
        return !!tokens.find((e) => e.userId === userId && e.value === token);
    }

    static async remove(userId: string, token: string): Promise<void> {
        await this.clear();
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].userId === userId && tokens[i].value === token) {
                tokens.splice(i, 1);
                break;
            }
        }
    }
}

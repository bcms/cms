import * as crypto from 'crypto';

export class AES {
    private key: Buffer;

    constructor(
        pass: string,
        salt: string,
        private iv: string,
    ) {
        this.key = crypto.scryptSync(pass, salt, 32);
    }

    encrypt(text: string, encoding?: crypto.Encoding): string {
        const cipher = crypto.createCipheriv('aes-256-gcm', this.key, this.iv);
        let encText = '';
        encText = cipher.update(text, encoding ? encoding : 'utf8', 'hex');
        encText += cipher.final('hex');
        return encText;
    }

    decrypt(text: string, encoding?: crypto.Encoding): string {
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            this.key,
            this.iv,
        );
        let decText = '';
        decText = decipher.update(text, 'hex', encoding ? encoding : 'utf8');
        return decText;
    }
}

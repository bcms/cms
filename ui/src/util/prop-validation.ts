import { v4 as uuidv4 } from 'uuid';

export class PropValidator {
    private validationFns: Array<{ id: string; handler(): boolean }> = [];

    validate(): boolean {
        let valid = true;
        for (let i = 0; i < this.validationFns.length; i++) {
            if (!this.validationFns[i].handler()) {
                valid = false;
            }
        }
        return valid;
    }

    register(handler: () => boolean): () => void {
        const id = uuidv4();
        this.validationFns.push({ id, handler });
        return () => {
            for (let i = 0; i < this.validationFns.length; i++) {
                if (this.validationFns[i].id === id) {
                    this.validationFns.splice(i, 1);
                }
            }
        };
    }
}

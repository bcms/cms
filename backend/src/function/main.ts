import path from 'path';
import {
    type BCMSFunction,
    BCMSFunctionSchema,
} from '@thebcms/selfhosted-backend/function/models/main';
import { FS } from '@thebcms/selfhosted-backend/_utils/fs';
import {
    ObjectUtility,
    ObjectUtilityError,
} from '@thebcms/selfhosted-backend/_utils/object-utility';
import { StringUtility } from '@thebcms/selfhosted-backend/_utils/string-utility';

export class FunctionManager {
    private static fns: BCMSFunction[] = [];

    static clear(): void {
        this.fns = [];
    }

    static get(name: string): BCMSFunction | undefined {
        return this.fns.find((e) => e.config.name === name);
    }

    static getAll(): BCMSFunction[] {
        return this.fns;
    }

    static async init() {
        const fs = new FS(path.join(process.cwd(), 'functions'));
        if (!(await fs.exist(''))) {
            return;
        }
        const fnNames = await fs.readdir('');
        for (let i = 0; i < fnNames.length; i++) {
            const fnName = fnNames[i];
            if (
                fnName.endsWith('.js') ||
                (!fnName.endsWith('.d.ts') && fnName.endsWith('.ts'))
            ) {
                const fnImport: {
                    default(): Promise<BCMSFunction>;
                } = await import(path.join(fs.baseRoot, fnName));
                if (typeof fnImport.default !== 'function') {
                    throw Error(`There is no default function in: ${fnName}`);
                }
                const fn = await fnImport.default();
                const checkFn = ObjectUtility.compareWithSchema(
                    fn,
                    BCMSFunctionSchema,
                    fnName,
                );
                if (checkFn instanceof ObjectUtilityError) {
                    throw Error(checkFn.message);
                }
                fn.config.name = StringUtility.toSlug(fn.config.name);
                if (this.fns.find((e) => e.config.name === fn.config.name)) {
                    throw Error(
                        `Duplicate of "${fn.config.name}" function.` +
                            ' This is not allowed.',
                    );
                }
                console.log(
                    `Function mounted: ${fn.config.name} -> POST: /api/v4/function/${fn.config.name}`,
                );
                this.fns.push(fn);
            }
        }
    }
}

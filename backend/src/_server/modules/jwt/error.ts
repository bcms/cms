export type JWTErrorCode =
    | 'e1'
    | 'e2'
    | 'e3'
    | 'e4'
    | 'e5'
    | 'e6'
    | 'e7'
    | 'e8'
    | 'e9'
    | 'e10';

export class JWTError extends Error {
    constructor(
        public errorCode: JWTErrorCode,
        public message: string,
    ) {
        super();
    }
}

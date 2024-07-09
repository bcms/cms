export class Config {
    static readonly jwtIssuer = process.env.JWT_SCOPE || 'localhost';
    static readonly jwtSecret = process.env.JWT_SECRET || 'secret';
    static readonly jwtExpIn = process.env.JWT_EXP_IN
        ? parseInt(process.env.JWT_EXP_IN, 10)
        : 60000;

    static readonly dbPrefix = process.env.BD_PREFIX || 'bcms';
    static readonly dbUrl =
        process.env.DB_URL || 'mongodb://test:test1234@db:27017/admin';

    static readonly bodySizeLimit = process.env.BODY_SIZE_LIMIT
        ? parseInt(process.env.BODY_SIZE_LIMIT, 10)
        : 2000000;
    static readonly plugins: string[] = process.env.PLUGINS
        ? process.env.PLUGINS.split(',')
        : [];

    static readonly storageScope = process.env.STORAGE_SCOPE || 'bcms';
}

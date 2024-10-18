export interface PluginConfig {
    version: string;
    dependencies: {
        [name: string]: string;
    };
}

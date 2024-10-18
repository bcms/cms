import type { Cli } from '@bcms/selfhosted-cli';
import type { TypeGeneratorLanguage } from '@bcms/selfhosted-backend/type-generator/generator/main';
import inquirer from 'inquirer';
import * as process from 'node:process';
import { FS } from '@bcms/selfhosted-utils/fs';

export class PullHandler {
    constructor(private cli: Cli) {}

    private prettyLangTypeName = {
        ts: 'TypeScript',
        gql: 'GraphQL',
        rust: 'Rust',
        golang: 'Go Language',
    };

    async types() {
        const availableLanguages: TypeGeneratorLanguage[] = [
            'ts',
            'gql',
            'golang',
            'rust',
        ];
        if (
            !this.cli.args.language ||
            !availableLanguages.includes(this.cli.args.language)
        ) {
            const answer = await inquirer.prompt<{
                lng: TypeGeneratorLanguage;
            }>([
                {
                    name: 'lng',
                    type: 'list',
                    choices: [
                        {
                            name: 'TypeScript',
                            value: 'ts',
                        },
                        {
                            name: 'GraphQL (Coming soon)',
                            value: 'gql',
                            disabled: true,
                        },
                        {
                            name: 'Rust (Coming soon)',
                            value: 'rust',
                            disabled: true,
                        },
                        {
                            name: 'GoLang (Coming soon)',
                            value: 'golang',
                            disabled: true,
                        },
                    ],
                },
            ]);
            this.cli.args.language = answer.lng;
        }
        process.stdout.write(
            `Pulling types for ${this.prettyLangTypeName[this.cli.args.language]} ... `,
        );
        const filesInfo = this.cli.client
            ? await this.cli.client.typeGenerator.getFiles(
                  this.cli.args.language,
              )
            : await (
                  await this.cli.getSdk()
              ).typeGenerator.getTypes(this.cli.args.language);
        process.stdout.write('Done\n');
        const destPath = this.cli.args.output
            ? this.cli.args.output.split('/')
            : ['bcms', 'types', this.cli.args.language];
        process.stdout.write(`Saving types to ${destPath.join('/')}/* ... `);
        const fs = new FS(process.cwd());
        for (let i = 0; i < filesInfo.length; i++) {
            const fileInfo = filesInfo[i];
            await fs.save(
                [...destPath, ...fileInfo.path.split('/')],
                fileInfo.content,
            );
        }
        process.stdout.write('Done\n');
    }
}

import { type Args, argsMap } from '@bcms/selfhosted-cli/args';
import { DeployHandler } from '@bcms/selfhosted-cli/handlers/deploy';

export class Cli {
    deploy = new DeployHandler(this);

    constructor(public args: Args) {}

    help() {
        console.log('---- BCMS CLI ----\n');
        const cols: Array<[string, string[]]> = [];
        let col1MaxWidth = 0;
        for (const key in argsMap) {
            const argInfo = argsMap[key];
            const col1 = argInfo.flags.join(', ');
            if (col1MaxWidth < col1.length) {
                col1MaxWidth = col1.length;
            }
            const col2Lines: string[] = [''];
            let col2LineIdx = 0;
            if (argInfo.description) {
                const descParts = argInfo.description.split(' ');
                for (let i = 0; i < descParts.length; i++) {
                    const word = descParts[i];
                    if (col2Lines[col2LineIdx].length === 0) {
                        col2Lines[col2LineIdx] += word;
                    } else {
                        col2Lines[col2LineIdx] += ' ' + word;
                    }
                    if (col2Lines[col2LineIdx].length > 30) {
                        col2Lines.push('');
                        col2LineIdx++;
                    }
                }
            }
            cols.push([col1, col2Lines]);
        }
        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            const delta = Array(col1MaxWidth - col[0].length)
                .map(() => '')
                .join(' ');
            const lineIndent = Array(col[0].length + delta.length + 5)
                .map(() => '')
                .join(' ');
            console.log(delta + col[0], '->', col[1][0]);
            for (let j = 1; j < col[1].length; j++) {
                console.log(lineIndent + col[1][j]);
            }
        }
    }
}

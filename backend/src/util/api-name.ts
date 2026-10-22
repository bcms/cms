import { pinyin } from 'pinyin-pro';

export type ApiNameKind = 'template' | 'field';

export function apiNameFromLabel(
    label: string,
    kind: ApiNameKind,
    id: string,
): string {
    const separator = kind === 'template' ? '-' : '_';
    const romanized = pinyin(label, {
        toneType: 'none',
        nonZh: 'consecutive',
        v: true,
    })
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const name = romanized
        .replace(/[^a-z0-9]+/g, separator)
        .replace(/^[-_]+|[-_]+$/g, '');

    if (!name) {
        return `${kind}${separator}${id.replace(/[^a-z0-9]/gi, '')}`;
    }
    return /^[0-9]/.test(name) ? `${kind}${separator}${name}` : name;
}

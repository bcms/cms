export interface SearchSetItem<Obj = unknown> {
    id: string;
    data: string[];
    obj: Obj;
}

export interface SearchResultItem<Obj = unknown> {
    id: string;
    score: number;
    matches: number;
    positions: number[][];
    obj: Obj;
}

export interface SearchResult<Obj = unknown> {
    items: SearchResultItem<Obj>[];
}

export interface SearchScoreTransFunction {
    (position: number): number;
}

function searchScoreTransFn(position: number): number {
    return 0.9 * position + 0.1;
}

const wordSplitChars = [
    ' ',
    '-',
    '_',
    '+',
    '=',
    '|',
    '\\',
    '?',
    '!',
    '.',
    ',',
    ';',
    ':',
    "'",
    '"',
    '(',
    ')',
    '{',
    '}',
    '[',
    ']',
    '&',
    '*',
    '^',
    '%',
    '$',
    '#',
    '@',
    '\t',
    '\n',
    '\r',
];

export function search<Obj = unknown>({
    set,
    searchTerm,
    transFn,
}: {
    set: SearchSetItem<Obj>[];
    searchTerm: string;
    transFn?: SearchScoreTransFunction;
}): SearchResult<Obj> {
    const tfn = transFn ? transFn : searchScoreTransFn;
    const output: SearchResult<Obj> = {
        items: [],
    };
    for (let i = 0; i < set.length; i++) {
        const setItem = set[i];
        const outputIndex =
            output.items.push({
                id: setItem.id,
                score: 0,
                matches: 0,
                positions: [],
                obj: setItem.obj,
            }) - 1;
        for (let j = 0; j < setItem.data.length; j++) {
            const data = setItem.data[j];
            const positionsIndex =
                output.items[outputIndex].positions.push([]) - 1;
            let score = 0;
            let matches = 0;
            let loop = true;
            let index = 0;
            while (loop) {
                index = data.indexOf(searchTerm, index);
                if (index === -1) {
                    loop = false;
                } else {
                    matches++;
                    score++;
                    output.items[outputIndex].positions[positionsIndex].push(
                        index,
                    );
                    const newIndex = index + searchTerm.length;
                    if (
                        (index - 1 === -1 ||
                            wordSplitChars.includes(data.charAt(index - 1))) &&
                        (newIndex === data.length ||
                            wordSplitChars.includes(data.charAt(newIndex)))
                    ) {
                        score++;
                    }
                    index = newIndex + searchTerm.length;
                }
            }
            output.items[outputIndex].matches += matches;
            output.items[outputIndex].score += score * tfn(j);
        }
    }
    output.items = output.items
        .filter((e) => e.score > 0)
        .sort((a, b) => (a.score > b.score ? -1 : 1));
    return output;
}

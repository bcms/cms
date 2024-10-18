export function extractUtmParamsFromQuery(inputQueries: any): string {
    if (inputQueries) {
        const outputQueries: string[] = [];
        const removeKeys: string[] = [];
        for (const key in inputQueries) {
            const value = inputQueries[key] as string;
            if (key.startsWith('utm_')) {
                outputQueries.push(`${key}=${value}`);
                removeKeys.push(key);
            }
        }
        for (let i = 0; i < removeKeys.length; i++) {
            const key = removeKeys[i];
            delete inputQueries[key];
        }
        return outputQueries.join('&');
    }
    return '';
}

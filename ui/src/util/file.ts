export async function fileToB64(file: File): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            resolve(reader.result as string);
        };
        reader.onerror = function (error) {
            reject(error);
        };
    });
}

export function prettyFileSize(size: number): string {
    if (size > 1000000000) {
        return `${(size / 1000000000).toFixed(1)} GB`;
    } else if (size > 1000000) {
        return `${(size / 1000000).toFixed(1)} MB`;
    }
    if (size > 1000) {
        return `${(size / 1000).toFixed(1)} KB`;
    }
    return `${size} B`;
}

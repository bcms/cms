import { Buffer } from 'buffer';

export async function downloadLink(data: {
    link: string;
    filename: string;
}): Promise<void> {
    const res = await fetch(data.link);

    const imageData = Buffer.from(await res.arrayBuffer()).toString('base64');

    const element = document.createElement('a');
    element.setAttribute('style', 'height: 0px;');
    element.setAttribute(
        'href',
        `data:${res.headers.get('content-type')};base64,` +
            imageData.replace(/=/g, ''),
    );
    element.setAttribute('download', data.filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

export function downloadText(data: {
    mimetype: string;
    data: string;
    filename: string;
}): void {
    const element = document.createElement('a');
    element.setAttribute('style', 'height: 0px;');
    element.setAttribute(
        'href',
        `data:${data.mimetype};charset=utf-8,` + encodeURIComponent(data.data),
    );
    element.setAttribute('download', data.filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

export function downloadBuffer(data: {
    mimetype: string;
    data: Buffer;
    filename: string;
}): void {
    const blob = new Blob([new Uint8Array(data.data)], { type: data.mimetype });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', data.filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
}

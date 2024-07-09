export async function waitForSelector<El = HTMLElement>(
    selector: string,
    timeout: number,
    doc?: Document,
): Promise<El | null> {
    if (!doc) {
        doc = document;
    }
    if (!timeout) {
        timeout = 30000;
    }
    const timeoutAt = Date.now() + timeout;
    let el = doc.querySelector(selector);
    if (el) {
        return el as El;
    }
    let interval: NodeJS.Timeout;
    return await new Promise<El | null>((resolve, reject) => {
        interval = setInterval(() => {
            if (Date.now() > timeoutAt) {
                clearInterval(interval);
                resolve(null);
                reject('Timeout after ' + timeout);
            }
            el = (doc as Document).querySelector(selector);
            if (el) {
                clearInterval(interval);
                resolve(el as El);
            }
        }, 20);
    });
}

export function findChildByTag<El = HTMLElement>(
    children: HTMLElement[] | HTMLCollection,
    tag: string,
): El | null {
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.tagName === tag) {
                return child as El;
            } else if (child.children) {
                const result = findChildByTag<El>(child.children, tag);
                if (result) {
                    return result;
                }
            }
        }
    }
    return null;
}

export function findChild<El = HTMLElement>(
    children: HTMLElement[] | HTMLCollection,
    query: (child: HTMLElement) => unknown,
): El | null {
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (query(child as HTMLElement)) {
                return child as El;
            } else if (child.children) {
                const result = findChild(child.children, query);
                if (result) {
                    return result as El;
                }
            }
        }
    }
    return null;
}

export function findParent(
    element: HTMLElement,
    query: (el: HTMLElement) => unknown,
): HTMLElement | null {
    if (query(element)) {
        return element;
    } else {
        if (element.parentElement) {
            return findParent(element.parentElement, query);
        } else {
            return null;
        }
    }
}

(window as any).waitForSelector = waitForSelector;
(window as any).findChildByTag = findChildByTag;
(window as any).findChild = findChild;

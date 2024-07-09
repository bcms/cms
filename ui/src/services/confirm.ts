import type { JSX } from 'vue/jsx-runtime';

export interface ConfirmService {
    (
        title: string,
        content: string | JSX.Element,
        prompt?: string,
    ): Promise<boolean>;
}

export const confirm: ConfirmService = async (title, content, prompt) => {
    return await new Promise<boolean>((resolve) => {
        window.bcms.modalService.handlers.confirm.open({
            title,
            data: {
                title,
                content,
                prompt,
            },
            onDone() {
                resolve(true);
            },
            onCancel() {
                resolve(false);
            },
        });
    });
};

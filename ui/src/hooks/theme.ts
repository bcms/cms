import { v4 as uuidv4 } from 'uuid';
import { ref } from 'vue';

export type ThemeTypes = 'light' | 'dark';

interface ThemeSub {
    id: string;
    handler(value: ThemeTypes): void;
}

class Theme {
    active = ref<ThemeTypes>(
        (window.localStorage.getItem('__theme') as ThemeTypes) || 'light',
    );

    private subs: ThemeSub[] = [];

    constructor() {
        if (window.localStorage.getItem('__theme')) {
            if (this.active.value === 'dark') {
                this.set('dark');
            } else {
                this.set('light');
            }
        } else {
            if (
                window.matchMedia &&
                window.matchMedia('(prefers-color-scheme: dark)').matches
            ) {
                this.set('dark');
            } else {
                this.set('light');
            }
        }
    }

    set(value: ThemeTypes): void {
        this.active.value = value;
        window.localStorage.setItem('__theme', value);
        if (value === 'dark') {
            document.body.classList.add('dark');
            document.body.classList.remove('light');
        } else {
            document.body.classList.remove('dark');
            document.body.classList.add('light');
        }
        this.subs.forEach((sub) => sub.handler(value));
    }

    onChange(callback: (value: ThemeTypes) => void): () => void {
        const id = uuidv4();
        this.subs.push({
            id,
            handler: callback,
        });
        return () => {
            for (let i = 0; i < this.subs.length; i++) {
                if (this.subs[i].id === id) {
                    this.subs.splice(i, 1);
                    break;
                }
            }
        };
    }
}

const theme = new Theme();

export interface UseTheme {
    (): Theme;
}

export const useTheme: UseTheme = () => {
    return theme;
};

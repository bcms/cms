import { v4 as uuidv4 } from 'uuid';
import {
    type Prop,
    type PropData,
    PropType,
} from '@thebcms/selfhosted-backend/prop/models/main';

export class PropFactory {
    static create(type: PropType, array?: boolean): Prop | null {
        switch (type) {
            case PropType.STRING: {
                return this.string(array);
            }
            case PropType.NUMBER: {
                return this.number(array);
            }
            case PropType.BOOLEAN: {
                return this.bool(array);
            }
            case PropType.DATE: {
                return this.date();
            }
            case PropType.ENUMERATION: {
                return this.enum();
            }
            case PropType.MEDIA: {
                return this.media(array);
            }
            case PropType.GROUP_POINTER: {
                return this.groupPointer(array);
            }
            case PropType.ENTRY_POINTER: {
                return this.entryPointer(array);
            }
            case PropType.RICH_TEXT: {
                return this.richText(array);
            }
            case PropType.WIDGET: {
                return this.widget(array);
            }
            default: {
                return null;
            }
        }
    }

    static typeToKey(type: PropType): keyof PropData {
        switch (type) {
            case PropType.STRING: {
                return 'propString';
            }
            case PropType.NUMBER: {
                return 'propNumber';
            }
            case PropType.BOOLEAN: {
                return 'propBool';
            }
            case PropType.DATE: {
                return 'propDate';
            }
            case PropType.ENUMERATION: {
                return 'propEnum';
            }
            case PropType.MEDIA: {
                return 'propMedia';
            }
            case PropType.GROUP_POINTER: {
                return 'propGroupPointer';
            }
            case PropType.ENTRY_POINTER: {
                return 'propEntryPointer';
            }
            case PropType.RICH_TEXT: {
                return 'propRichText';
            }
            case PropType.WIDGET: {
                return 'propWidget';
            }
        }
    }

    static string(array?: boolean): Prop {
        return {
            id: uuidv4(),
            name: '',
            label: '',
            array: array ? array : false,
            required: true,
            type: PropType.STRING,
            data: {
                propString: [],
            },
        };
    }

    static number(array?: boolean): Prop {
        return {
            id: uuidv4(),
            name: '',
            label: '',
            array: array ? array : false,
            required: true,
            type: PropType.NUMBER,
            data: {
                propNumber: [],
            },
        };
    }

    static bool(array?: boolean): Prop {
        return {
            id: uuidv4(),
            name: '',
            label: '',
            array: array ? array : false,
            required: true,
            type: PropType.BOOLEAN,
            data: {
                propBool: [],
            },
        };
    }

    static date(array?: boolean): Prop {
        return {
            id: uuidv4(),
            name: '',
            label: '',
            array: array ? array : false,
            required: true,
            type: PropType.DATE,
            data: {
                propDate: [],
            },
        };
    }

    static enum(array?: boolean): Prop {
        return {
            id: uuidv4(),
            name: '',
            label: '',
            array: array ? array : false,
            required: true,
            type: PropType.ENUMERATION,
            data: {
                propEnum: {
                    items: [],
                },
            },
        };
    }

    static media(array?: boolean): Prop {
        return {
            id: uuidv4(),
            name: '',
            label: '',
            array: array ? array : false,
            required: true,
            type: PropType.MEDIA,
            data: {
                propMedia: [],
            },
        };
    }

    static groupPointer(array?: boolean): Prop {
        return {
            id: uuidv4(),
            name: '',
            label: '',
            array: array ? array : false,
            required: true,
            type: PropType.GROUP_POINTER,
            data: {
                propGroupPointer: {
                    _id: '',
                },
            },
        };
    }

    static entryPointer(array?: boolean): Prop {
        return {
            id: uuidv4(),
            name: '',
            label: '',
            array: array ? array : false,
            required: true,
            type: PropType.ENTRY_POINTER,
            data: {
                propEntryPointer: [],
            },
        };
    }

    static richText(array?: boolean): Prop {
        return {
            id: uuidv4(),
            name: '',
            label: '',
            array: array ? array : false,
            required: true,
            type: PropType.RICH_TEXT,
            data: {
                propRichText: [],
            },
        };
    }

    static widget(array?: boolean): Prop {
        return {
            id: uuidv4(),
            name: '',
            label: '',
            array: array ? array : false,
            required: true,
            type: PropType.WIDGET,
            data: {
                propWidget: {
                    _id: '',
                },
            },
        };
    }
}

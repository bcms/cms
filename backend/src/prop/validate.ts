import {
    type Prop,
    PropType,
} from '@thebcms/selfhosted-backend/prop/models/main';
import type { Group } from '@thebcms/selfhosted-backend/group/models/main';
import type { PropGroupPointerData } from '@thebcms/selfhosted-backend/prop/models/group-pointer';

export interface PropsTestInfiniteLoopPointer {
    group: Array<{
        _id: string;
        label: string;
    }>;
}

export function propsValidationTestInfiniteLoop(
    props: Prop[],
    pointer: PropsTestInfiniteLoopPointer,
    level: string,
    groups: Group[],
): Error | void {
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (prop.type === PropType.GROUP_POINTER) {
            const data = prop.data.propGroupPointer as PropGroupPointerData;
            const group = groups.find((e) => e._id === data._id);
            if (!group) {
                return Error(
                    `[ ${level}.data._id ] --> ` +
                        `Group with ID "${data._id}" does not exist.`,
                );
            }
            if (prop.required) {
                if (pointer.group.find((e) => e._id === data._id)) {
                    return Error(
                        `[ ${level} ] --> Pointer loop detected: [ ${pointer.group
                            .map((e) => {
                                return e.label;
                            })
                            .join(' -> ')} -> ${
                            group.label
                        } ] this is forbidden since it will result in an infinite loop.`,
                    );
                }
                const result = propsValidationTestInfiniteLoop(
                    group.props,
                    {
                        group: [
                            ...pointer.group,
                            {
                                _id: data._id,
                                label: group.label,
                            },
                        ],
                    },
                    `${level}[${i}].(group:${group.name}).props`,
                    groups,
                );
                if (result instanceof Error) {
                    return result;
                }
            }
        }
    }
}

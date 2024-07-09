import type {
    Prop,
    PropValue,
} from '@thebcms/selfhosted-backend/prop/models/main';
import type { Group } from '@thebcms/selfhosted-backend/group/models/main';
import type { PropValueMediaData } from '@thebcms/selfhosted-backend/prop/models/media';
import type { PropValueGroupPointerData } from '@thebcms/selfhosted-backend/prop/models/group-pointer';

export async function propValuesFromSchema(
    props: Prop[],
    propValues?: PropValue[],
): Promise<PropValue[]> {
    const sdk = window.bcms.sdk;
    const values: PropValue[] = [];
    if (!propValues) {
        propValues = [];
    }
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        const value = propValues.find((e) => e.id === prop.id);
        switch (prop.type) {
            case 'STRING':
                {
                    values.push({
                        id: prop.id,
                        data: value ? value.data : prop.data.propString || [],
                    });
                }
                break;
            case 'NUMBER':
                {
                    values.push({
                        id: prop.id,
                        data: value ? value.data : prop.data.propNumber || [],
                    });
                }
                break;
            case 'BOOLEAN':
                {
                    values.push({
                        id: prop.id,
                        data: value ? value.data : prop.data.propBool || [],
                    });
                }
                break;
            case 'DATE':
                {
                    values.push({
                        id: prop.id,
                        data: value
                            ? value.data
                            : prop.data.propDate &&
                              prop.data.propDate.length > 0
                            ? prop.data.propDate
                            : prop.array
                            ? []
                            : [
                                  {
                                      timestamp: -1,
                                      timezoneOffset:
                                          new Date().getTimezoneOffset(),
                                  },
                              ],
                    });
                }
                break;
            case 'ENUMERATION':
                {
                    const data = prop.data.propEnum;
                    values.push({
                        id: prop.id,
                        data: value
                            ? value.data
                            : prop.array
                            ? []
                            : [data?.selected || ''],
                    });
                }
                break;
            case 'MEDIA':
                {
                    const dataItems = prop.data.propMedia;
                    const valueData: PropValueMediaData[] = value
                        ? (value.data as PropValueMediaData[])
                        : [];
                    if (!value && dataItems) {
                        for (let j = 0; j < dataItems.length; j++) {
                            const mediaId = dataItems[j];
                            try {
                                const media = await sdk.media.get({
                                    mediaId: mediaId,
                                });
                                valueData.push({
                                    _id: mediaId,
                                    caption: media.caption,
                                    alt_text: media.altText,
                                });
                            } catch (err) {
                                console.warn(err);
                            }
                        }
                    }
                    values.push({
                        id: prop.id,
                        data: valueData,
                    });
                }
                break;
            case 'GROUP_POINTER':
                {
                    const data = prop.data.propGroupPointer;
                    if (data) {
                        let group: Group | null = null;
                        try {
                            group = await sdk.group.get({
                                groupId: data._id,
                            });
                        } catch (err) {
                            console.warn(err);
                        }
                        if (group) {
                            let items: Array<{ props: PropValue[] }>;
                            if (prop.array) {
                                items = [];
                            } else {
                                if (prop.required) {
                                    items = [
                                        {
                                            props: await propValuesFromSchema(
                                                group.props,
                                            ),
                                        },
                                    ];
                                } else {
                                    items = [];
                                }
                            }
                            const valueData: PropValueGroupPointerData = value
                                ? (value.data as PropValueGroupPointerData)
                                : {
                                      _id: data._id,
                                      items,
                                  };
                            values.push({
                                id: prop.id,
                                data: valueData,
                            });
                        } else {
                            console.warn('Group', data._id, 'does not exist');
                        }
                    }
                }
                break;
            case 'ENTRY_POINTER':
                {
                    const data = prop.data.propEntryPointer;
                    if (data) {
                        values.push({
                            id: prop.id,
                            data: value ? value.data : [],
                        });
                    }
                }
                break;
            case 'RICH_TEXT':
                {
                    const data = prop.data.propRichText;
                    if (data) {
                        values.push({
                            id: prop.id,
                            data: value
                                ? value.data
                                : prop.array
                                ? []
                                : [
                                      {
                                          nodes: [],
                                      },
                                  ],
                        });
                    }
                }
                break;
        }
    }
    return JSON.parse(JSON.stringify(values));
}

export function propPathToArray(propPath: string) {
    const pathParts = propPath.split('.').map((propPart) => {
        const num = parseInt(propPart);
        if (!isNaN(num)) {
            return num;
        }
        return propPart;
    });
    return pathParts;
}

export function propValueFromPath(
    propPath: (string | number)[],
    values: any,
): PropValue | undefined {
    function recursiveFind(path: (string | number)[], parent: any) {
        if (path.length === 1) {
            return parent[path[0]];
        } else {
            if (parent[path[0]]) {
                return recursiveFind(path.slice(1), parent[path[0]]);
            }
        }
    }
    return recursiveFind(propPath, values);
}

export function propApplyValueChangeFromPath(
    propPath: (string | number)[],
    values: any,
    data: unknown,
) {
    function recursiveFind(path: (string | number)[], parent: any) {
        if (path.length === 2) {
            if (parent[path[0]]) {
                parent[path[0]][path[1]] = data;
            }
        } else {
            if (parent[path[0]]) {
                recursiveFind(path.slice(1), parent[path[0]]);
            }
        }
    }
    recursiveFind(propPath, values);
}

export function propValueRemoveArrayItem(
    propPath: (string | number)[],
    values: any,
) {
    function recursiveFind(path: (string | number)[], parent: any) {
        if (path.length === 2) {
            if (parent[path[0]] && parent[path[0]] instanceof Array) {
                parent[path[0]].splice(path[1], 1);
            }
        } else {
            if (parent[path[0]]) {
                recursiveFind(path.slice(1), parent[path[0]]);
            }
        }
    }
    recursiveFind(propPath, values);
}

export function propValueMoveArrayItem(
    propPath: (string | number)[],
    values: any,
    direction: number,
) {
    function recursiveFind(path: (string | number)[], parent: any) {
        if (path.length === 2) {
            if (parent[path[0]] && parent[path[0]] instanceof Array) {
                const item = parent[path[0]][path[1]];
                parent[path[0]].splice(path[1] as number, 1);
                parent[path[0]].splice(
                    (path[1] as number) + direction,
                    0,
                    item,
                );
            }
        } else {
            if (parent[path[0]]) {
                recursiveFind(path.slice(1), parent[path[0]]);
            }
        }
    }
    recursiveFind(propPath, values);
}

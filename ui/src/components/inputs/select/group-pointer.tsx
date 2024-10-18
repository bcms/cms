import { computed, defineComponent, type PropType } from 'vue';
import { useRoute } from 'vue-router';
import { InputProps } from '@bcms/selfhosted-ui/components/inputs/_wrapper';
import type { Group } from '@bcms/selfhosted-backend/group/models/main';
import { Select } from '@bcms/selfhosted-ui/components/inputs/select/main';

export const SelectGroupPointer = defineComponent({
    props: {
        ...InputProps,
        placeholder: String,
        disabled: Boolean,
        selected: {
            type: String,
            default: '',
        },
        allowedGroups: Array as PropType<string[]>,
        propPath: String,
    },
    emits: {
        change: (_group: Group): boolean => {
            return true;
        },
    },
    setup(props, ctx) {
        const sdk = window.bcms.sdk;
        const route = useRoute();
        const groups = computed(() => {
            if (props.allowedGroups) {
                return sdk.store.group.findMany(
                    (e) =>
                        props.allowedGroups?.includes(e._id) &&
                        route.meta.groupGloug !== e.name,
                );
            } else {
                return sdk.store.group.findMany(
                    (e) => route.params.groupSlug !== e.name,
                );
            }
        });

        return () => (
            <Select
                id={props.id}
                style={props.style}
                class={props.class}
                label={props.label}
                error={props.error}
                description={props.description}
                required={props.required}
                placeholder={props.placeholder}
                disabled={props.disabled}
                selected={props.selected}
                // propPath={props.propPath}
                options={groups.value.map((group) => {
                    return {
                        label: group.label,
                        value: group._id,
                    };
                })}
                onChange={(option) => {
                    if (option) {
                        const group = groups.value.find(
                            (e) => e._id === option.value,
                        );
                        if (group) {
                            ctx.emit('change', group);
                        }
                    }
                }}
            />
        );
    },
});

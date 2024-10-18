import { defineComponent } from 'vue';
import { DefaultComponentProps } from '@bcms/selfhosted-ui/components/default';

export const UserAvatar = defineComponent({
    props: {
        ...DefaultComponentProps,
        image: String,
        fullName: String,
    },
    setup(props) {
        return () => (
            <div
                id={props.id}
                style={props.style}
                class={`bg-gray box-content border-2 border-green dark:border-yellow rounded-xl overflow-hidden ${
                    props.class || 'w-[32px] h-[32px]'
                }`}
            >
                {props.image ? (
                    <img
                        class={`w-full h-full object-cover`}
                        src={props.image}
                        alt={props.fullName || 'User avatar'}
                    />
                ) : (
                    <div
                        class={`flex items-center justify-center w-full h-full`}
                    >
                        {props.fullName ? (
                            <div class={`text-dark font-bold pt-0.5`}>
                                {props.fullName
                                    .split(' ')
                                    .map((e) => e.substring(0, 1).toUpperCase())
                                    .join('')}
                            </div>
                        ) : (
                            ''
                        )}
                    </div>
                )}
            </div>
        );
    },
});

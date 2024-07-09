import { defineComponent } from 'vue';
import {DefaultComponentProps} from "@thebcms/selfhosted-ui/components/default";
import {useTheme} from "@thebcms/selfhosted-ui/hooks/theme";
import {Icon} from "@thebcms/selfhosted-ui/components/icon";
import {BgAuth} from "@thebcms/selfhosted-ui/components/bg-auth";

export const Loader = defineComponent({
    props: {
        ...DefaultComponentProps,
        show: { type: Boolean, default: true },
    },
    setup(props) {
        const theme = useTheme();
        return () => (
            <>
                {props.show && (
                    <>
                        {theme.active.value === 'dark' ? (
                            <Icon
                                id={props.id}
                                style={`animation-duration: 4s !important; ${props.style}`}
                                class={`animate-spin ${props.class}`}
                                src={'/loading-dark'}
                            />
                        ) : (
                            <Icon
                                id={props.id}
                                style={`animation-duration: 4s !important; ${props.style}`}
                                class={`animate-spin ${props.class}`}
                                src={'/loading'}
                            />
                        )}
                    </>
                )}
            </>
        );
    },
});

export const LoaderPage = defineComponent({
    props: {
        ...DefaultComponentProps,
        show: { type: Boolean, default: true },
    },
    setup(props) {
        return () => (
            <>
                {props.show && (
                    <div
                        id={props.id}
                        class={`fixed z-1000 top-0 left-0 w-full h-screen bg-white dark:bg-black flex justify-center items-center ${
                            props.class || ''
                        }`}
                        style={props.style}
                    >
                        <BgAuth />
                        <Loader class={'w-12 h-12'} />
                    </div>
                )}
            </>
        );
    },
});

import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { Color, Vector2 } from 'three';
import { type ThemeTypes, useTheme } from '@thebcms/selfhosted-ui/hooks/theme';
import { Grad3C } from '@thebcms/selfhosted-ui/webgl/grad-3c';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';

export const BgDashboard = defineComponent({
    props: {
        ...DefaultComponentProps,
    },
    setup(props) {
        const container = ref<HTMLDivElement>();
        let grad: Grad3C | null = null;
        const theme = useTheme();
        const themeUnsub = theme.onChange((value) => {
            updateGrad(value);
        });

        function onResize() {
            updateGrad(theme.active.value);
        }

        function updateGrad(themeName: ThemeTypes) {
            if (grad) {
                grad.shader.setUniform('uUseNoise', true);
                grad.shader.setUniform(
                    'uBackgroundColor',
                    themeName === 'light'
                        ? new Color('#ffffff')
                        : new Color('#04070B'),
                );

                grad.shader.setUniform('uSize1', 100);
                grad.shader.setUniform('uPos1', new Vector2(20, 50));
                grad.shader.setUniform('uColor1', new Color('#f9c5bf'));
                grad.shader.setUniform(
                    'uGradFact1',
                    themeName === `light`
                        ? new Vector2(1, 2)
                        : new Vector2(1, 2),
                );
                grad.shader.setUniform('uSize2', 150);
                grad.shader.setUniform('uPos2', new Vector2(100, 200));
                grad.shader.setUniform('uColor2', new Color('#efc800'));
                grad.shader.setUniform(
                    'uGradFact2',
                    themeName === `light`
                        ? new Vector2(1, 2)
                        : new Vector2(3, 2),
                );
                grad.shader.setUniform('uSize3', 150);
                grad.shader.setUniform('uPos3', new Vector2(300, 0));
                grad.shader.setUniform('uColor3', new Color('#5aab84'));
                grad.shader.setUniform(
                    'uGradFact3',
                    themeName === `light`
                        ? new Vector2(1.2, 2)
                        : new Vector2(3, 2),
                );
                grad.update();
            }
        }

        onMounted(() => {
            if (container.value) {
                grad = new Grad3C(container.value, undefined, () => {
                    return {
                        width: window.innerWidth,
                        height: window.innerHeight,
                    };
                });
                updateGrad(theme.active.value);
                window.addEventListener('resize', onResize);
            }
        });

        onBeforeUnmount(() => {
            if (grad) {
                grad.destroy();
            }
            window.removeEventListener('resize', onResize);
            themeUnsub();
        });

        return () => (
            <div
                id={props.id}
                style={props.style}
                ref={container}
                class={`w-screen h-screen fixed ${props.class || ''}`}
            ></div>
        );
    },
});

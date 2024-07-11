import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { Color, Vector2 } from 'three';
import { Grad3C } from '@thebcms/selfhosted-ui/webgl/grad-3c';
import { type ThemeTypes, useTheme } from '@thebcms/selfhosted-ui/hooks/theme';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';

export const BgAuth = defineComponent({
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

        function updateGrad(themeName: ThemeTypes) {
            if (grad) {
                grad.shader.setUniform('uUseNoise', true);
                grad.shader.setUniform(
                    'uBackgroundColor',
                    themeName === 'light'
                        ? new Color('#ffffff')
                        : new Color('#04070B'),
                );
                grad.shader.setUniform('uColor1', new Color('#f9c5bf'));
                grad.shader.setUniform(
                    'uGradFact1',
                    themeName === `light`
                        ? new Vector2(0, 1)
                        : new Vector2(2, 1),
                );
                grad.shader.setUniform('uSize1', 250);
                grad.shader.setUniform('uColor2', new Color('#efc800'));
                grad.shader.setUniform(
                    'uGradFact2',
                    themeName === `light`
                        ? new Vector2(0, 1)
                        : new Vector2(2, 1),
                );
                grad.shader.setUniform('uSize2', 350);
                grad.shader.setUniform('uColor3', new Color('#5aab84'));
                grad.shader.setUniform(
                    'uGradFact3',
                    themeName === `light`
                        ? new Vector2(1, 2)
                        : new Vector2(2, 2),
                );
                grad.shader.setUniform('uSize3', 150);
                if (container.value) {
                    grad.shader.setUniform(
                        'uPos1',
                        new Vector2(window.innerWidth / 2 + 200, 200),
                    );
                    grad.shader.setUniform(
                        'uPos2',
                        new Vector2(window.innerWidth / 2 - 200, 200),
                    );
                    grad.shader.setUniform(
                        'uPos3',
                        new Vector2(window.innerWidth / 2 + 100, 0),
                    );
                }
                grad.update();
            }
        }

        function onResize() {
            updateGrad(theme.active.value);
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

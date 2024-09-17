import {
    Color,
    FrontSide,
    Mesh,
    OrthographicCamera,
    PlaneGeometry,
    Scene,
    Vector2,
    WebGLRenderer,
} from 'three';
import { ShaderManager } from '@bcms/selfhosted-ui/webgl/shaders/manager';
import { useTheme } from '@bcms/selfhosted-ui/hooks/theme';
import vsh from '@bcms/selfhosted-ui/webgl/shaders/grad-3c.vert';
import fsh from '@bcms/selfhosted-ui/webgl/shaders/grad-3c.frag';

export interface Grad3COptions {
    useNoise?: boolean;
    backgroundColor: string;
    circle1: {
        color: string;
        size: number;
        pos: [number, number];
        blur: [number, number];
    };
    circle2: {
        color: string;
        size: number;
        pos: [number, number];
        blur: [number, number];
    };
    circle3: {
        color: string;
        size: number;
        pos: [number, number];
        blur: [number, number];
    };
}

export class Grad3C {
    renderer: WebGLRenderer = new WebGLRenderer();
    scene: Scene = new Scene();
    camera: OrthographicCamera = new OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
    shader: ShaderManager<{
        uUseNoise: boolean;
        resolution: Vector2;
        uTime: number;
        uBackgroundColor: Color;

        uColor1: Color;
        uSize1: number;
        uPos1: Vector2;
        uGradFact1: Vector2;

        uColor2: Color;
        uSize2: number;
        uPos2: Vector2;
        uGradFact2: Vector2;

        uColor3: Color;
        uSize3: number;
        uPos3: Vector2;
        uGradFact3: Vector2;
    }>;
    plane: Mesh;
    onResize: () => void;

    private destroyed = false;
    private timeOffset = Date.now();
    private screenPositionTransform: {
        x(x: number): number;
        y(x: number): number;
        xy(...args: [number, number]): [number, number];
        xyVec2(...args: [number, number]): Vector2;
        vec2(v2: Vector2): Vector2;
    };

    constructor(
        appendToElement: HTMLElement,
        options?: Grad3COptions,
        getCanvasSize?: () => { width: number; height: number },
    ) {
        if (!options) {
            options = {
                useNoise: false,
                backgroundColor:
                    useTheme().active.value === 'dark' ? '#000000' : '#ffffff',
                circle1: {
                    color: '#f9c5bf',
                    pos: [appendToElement.offsetWidth - 300, 250],
                    size: 80,
                    blur: [1.2, 3],
                },
                circle2: {
                    color: '#ffb4f6',
                    size: 150,
                    pos: [appendToElement.offsetWidth - 400, 200],
                    blur: [1, 1.8],
                },
                circle3: {
                    color: '#d8ff5a',
                    pos: [appendToElement.offsetWidth - 100, 400],
                    size: 80,
                    blur: [1.2, 2],
                },
            };
        }
        this.screenPositionTransform = {
            x: (x) => {
                return (x * 100) / appendToElement.offsetWidth;
            },
            y: (y) => {
                return (y * 100) / appendToElement.offsetHeight;
            },
            xy: (x, y) => {
                return [
                    this.screenPositionTransform.x(x),
                    this.screenPositionTransform.y(y),
                ];
            },
            xyVec2: (x, y) => {
                return new Vector2(...this.screenPositionTransform.xy(x, y));
            },
            vec2: (v2) => {
                return new Vector2(
                    this.screenPositionTransform.x(v2.x),
                    this.screenPositionTransform.y(v2.y),
                );
            },
        };
        this.renderer = new WebGLRenderer();
        appendToElement.appendChild(this.renderer.domElement);

        this.onResize = () => {
            const size = getCanvasSize
                ? getCanvasSize()
                : {
                      width: appendToElement.offsetWidth,
                      height: appendToElement.offsetHeight,
                  };
            this.renderer.setSize(size.width, size.height);
            this.shader.setUniform(
                'resolution',
                new Vector2(size.width, size.height),
            );
        };

        window.addEventListener('resize', this.onResize);
        this.camera.position.set(0, 0, 1);
        const res = new Vector2(
            appendToElement.offsetWidth,
            appendToElement.offsetHeight,
        );
        this.shader = new ShaderManager(vsh, fsh, false, FrontSide, {
            uUseNoise: !!options.useNoise,
            resolution: res,
            uTime: 0,
            uBackgroundColor: new Color(options.backgroundColor),

            uColor1: new Color(options.circle1.color),
            uSize1: options.circle1.size,
            uPos1: new Vector2(...options.circle1.pos),
            uGradFact1: new Vector2(...options.circle1.blur),

            uColor2: new Color(options.circle2.color),
            uSize2: options.circle2.size,
            uPos2: new Vector2(...options.circle2.pos),
            uGradFact2: new Vector2(...options.circle2.blur),

            uColor3: new Color(options.circle3.color),
            uSize3: options.circle3.size,
            uPos3: new Vector2(...options.circle3.pos),
            uGradFact3: new Vector2(...options.circle3.blur),
        });
        this.plane = new Mesh(new PlaneGeometry(1, 1), this.shader.material);
        this.plane.position.set(0.5, 0.5, 0);
        this.scene.add(this.plane);
        this.onResize();
        this.update();
    }

    update() {
        // requestAnimationFrame(() => {
        if (!this.destroyed) {
            this.renderer.render(this.scene, this.camera);
            this.shader.setUniform('uTime', Date.now() - this.timeOffset);
            // this.update();
        }
        // });
    }

    destroy() {
        window.removeEventListener('resize', this.onResize);
        this.destroyed = true;
    }
}

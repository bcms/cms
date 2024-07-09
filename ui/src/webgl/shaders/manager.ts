import {
    FrontSide,
    ShaderMaterial,
    type Side,
    UniformsLib,
    UniformsUtils,
} from 'three';
import type { IUniform } from 'three/src/renderers/shaders/UniformsLib';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

export interface ShaderUniforms {
    [uniform: string]: IUniform;
}

export class ShaderManager<Uniforms = unknown> {
    material: ShaderMaterial;

    constructor(
        public vert: string,
        public frag: string,
        lights?: boolean,
        side?: Side,
        uniforms?: Uniforms,
    ) {
        const shaderUniforms: ShaderUniforms = {};
        if (uniforms) {
            for (const uniformsKey in uniforms) {
                shaderUniforms[uniformsKey] = {
                    value: uniforms[uniformsKey],
                };
            }
        }
        this.material = new ShaderMaterial({
            uniforms: UniformsUtils.merge([UniformsLib.lights, shaderUniforms]),
            fragmentShader: frag,
            vertexShader: vert,
            lights: !!lights,
            side: side || FrontSide,
        });
    }

    setUniform(key: keyof Uniforms, value: Uniforms[keyof Uniforms]) {
        const _key = key as never;
        if (!this.material.uniforms[_key]) {
            this.material.uniforms[_key] = { value: value };
        } else {
            this.material.uniforms[_key].value = value;
        }
    }
}

export class ShaderPassManager<Uniforms = unknown> {
    shader: ShaderPass;

    constructor(public vert: string, public frag: string, uniforms?: Uniforms) {
        const shaderUniforms: ShaderUniforms = {};
        if (uniforms) {
            for (const uniformsKey in uniforms) {
                shaderUniforms[uniformsKey] = {
                    value: uniforms[uniformsKey],
                };
            }
        }
        this.shader = new ShaderPass({
            uniforms: UniformsUtils.merge([UniformsLib.lights, shaderUniforms]),
            fragmentShader: frag,
            vertexShader: vert,
        });
    }

    setUniform(key: keyof Uniforms, value: Uniforms[keyof Uniforms]) {
        const _key = key as never;
        if (!this.shader.uniforms[_key]) {
            this.shader.uniforms[_key] = { value: value };
        } else {
            this.shader.uniforms[_key].value = value;
        }
    }
}

varying vec2 vUv;

uniform float uTime;
uniform vec2 resolution;
uniform vec3 uBackgroundColor;
uniform bool uUseNoise;

uniform vec3 uColor1;
uniform float uSize1;
uniform vec2 uPos1;
uniform vec2 uGradFact1;

uniform vec3 uColor2;
uniform float uSize2;
uniform vec2 uPos2;
uniform vec2 uGradFact2;

uniform vec3 uColor3;
uniform float uSize3;
uniform vec2 uPos3;
uniform vec2 uGradFact3;

float saturate(float x) {
    return clamp(x, 0.0, 1.0);
}

float inverseLerp(float minValue, float maxValue, float v) {
    return (v - minValue) / (maxValue - minValue);
}

float inverseLerpSat(float minValue, float maxValue, float v) {
    return saturate((v - minValue) / (maxValue - minValue));
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(inMin, inMax, v);
    return mix(outMin, outMax, t);
}

vec3 drawGrid(vec3 color, vec3 lineColor, float cellSpacing, float lineWidth) {
    vec2 center = vUv;
    vec2 cells = abs(fract(center * resolution / cellSpacing) - 0.5);
    float distToEdge = (0.5 - max(cells.x, cells.y)) * cellSpacing;
    float lines = smoothstep(0.0, lineWidth, distToEdge);

    color = mix(lineColor, color, lines);

    return color;
}

float sdfCircle(vec2 position, float radious) {
    return length(position) - radious;
}

float opUnion(float d1, float d2) {
    return min(d1, d2);
}

float softMax(float a, float b, float k) {
    return log(exp(k * a) + exp(k * b)) / k;
}

float softMin(float a, float b, float k) {
    return -softMax(-a, -b, k);
}

float softMinValue(float a, float b, float k) {
    return remap(a - b, -1.0 / k, 1.0 / k, 0.0, 1.0);
}

vec3 linearTosRGB(vec3 value) {
    vec3 lt = vec3(lessThanEqual(value.rgb, vec3(0.0031308)));

    vec3 v1 = value * 12.92;
    vec3 v2 = pow(value.xyz, vec3(0.41666)) * 1.055 - vec3(0.055);

    return mix(v2, v1, lt);
}

float Math_Random(vec2 p) {
    p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
    return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

float noise(in vec2 p)
{
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(Math_Random(i + vec2(0.0, 0.0)),
                   Math_Random(i + vec2(1.0, 0.0)), u.x),
               mix(Math_Random(i + vec2(0.0, 1.0)),
                   Math_Random(i + vec2(1.0, 1.0)), u.x), u.y);
}

vec3 toGrayscale(in vec3 color)
{
    float average = (color.r + color.g + color.b) / 3.0;
    return vec3(average, average, average);
}

void main() {
    vec2 pixelCoords = vUv * resolution;
    vec3 color = uBackgroundColor;
    //    vec3 color = vec3(0.0, 0.0, 0.0);
    vec3 noiseColor;
    if (uUseNoise) {
        noiseColor = vec3(
            remap(noise(pixelCoords), 0.0, 1.0, 0.91, 1.0)
//            remap(noise(pixelCoords), 0.0, 1.0, 0.95, 1.0),
//            remap(noise(pixelCoords), 0.0, 1.0, 0.81, 1.0)
        );
    } else {
        noiseColor = vec3(1.0);
    }

    float r1 = uSize1;
    vec2 c1Pos = vec2(uPos1.x, resolution.y - uPos1.y);
    float d1 = sdfCircle(pixelCoords - c1Pos, r1);
    vec3 c1 = uColor1 * noiseColor;
    color = mix(c1, color, smoothstep(-r1 * uGradFact1.x, r1 * uGradFact1.y, d1));

    float r2 = uSize2;
    vec2 c2Pos = vec2(uPos2.x, resolution.y - uPos2.y);
    float d2 = sdfCircle(pixelCoords - c2Pos, r2);
    vec3 c2 = uColor2 * noiseColor;
    color = mix(c2, color, smoothstep(-r2 * uGradFact2.x, r2 * uGradFact2.y, d2));
    //    vec3 c12 = mix(uColor1, uColor2, smoothstep(0.0, 1.0, softMinValue(d1, d2, 0.01)));
    //    float d12 = softMin(d1, d2, 0.05);
    //    if (r1 > r2) {
    //        color = mix(c12, color, smoothstep(-r1 * uGradFact1.x, r1 * uGradFact1.y, d12));
    //    } else {
    //        color = mix(c12, color, smoothstep(-r2 * uGradFact2.x, r2 * uGradFact2.y, d12));
    //    }

    float r3 = uSize3;
    vec2 c3Pos = vec2(uPos3.x, resolution.y - uPos3.y);
    float d3 = sdfCircle(pixelCoords - c3Pos, r3);
    vec3 c3 = uColor3 * noiseColor;
    color = mix(c3, color, smoothstep(-r3 * uGradFact3.x, r3 * uGradFact3.y, d3));
    vec3 grayscale = toGrayscale(color);

//    if (uUseNoise) {
//        if (uBackgroundColor.r == 1.0) {
//
//        } else {
//
//            color = noiseColor * color ;
//        }
//    }
    color = linearTosRGB(color);

//        gl_FragColor = vec4(color, remap(grayscale.r, 0.0, 0.9, 0.0, 1.0));
    gl_FragColor = vec4(color, 1.0);
}
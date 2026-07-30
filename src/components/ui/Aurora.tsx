"use client";

import { useEffect, useRef } from "react";

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

// Plain 0-255 → 0-1, no sRGB→linear step. Same as ogl's Color, which is what
// the shader's ramp was tuned against.
function toRGB(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Aurora shader:", gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
}

export default function Aurora(props: AuroraProps) {
  const {
    colorStops = ["#4f6793", "#223057", "#483f72"],
    amplitude = 1.0,
    blend = 0.5,
  } = props;
  // Live props for the render loop without re-running the effect. Assigned in
  // an effect, not during render — react-hooks/refs rejects the latter.
  const propsRef = useRef<AuroraProps>(props);
  useEffect(() => {
    propsRef.current = props;
  });

  const ctnDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    const canvas = document.createElement("canvas");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    // Double duty: paints the right colour before the first GL frame (and if
    // WebGL2 is missing entirely), and is what we read the clear colour back
    // from below — getComputedStyle resolves the token for us, so there's no
    // hex to keep in sync with globals.css.
    //
    // The utility, not `var(--color-bg)`: the @theme alias is declared on
    // :root, so its light-dark() has already collapsed to the site theme by
    // the time it inherits. Tailwind inlines this one to the raw token, which
    // re-resolves against whichever scope the canvas actually sits in.
    canvas.className = "bg-bg";

    // preserveDrawingBuffer, because this canvas deliberately stops drawing:
    // one static frame under reduced motion, and nothing at all while paused
    // off-screen. Without it the buffer is discarded after each composite, so
    // the next repaint that isn't preceded by a draw shows an empty canvas —
    // and with alpha:false the compositor treats the canvas as opaque and
    // skips the CSS background, so "empty" paints as blank rather than falling
    // back to the bg token. Costs a buffer copy per frame while animating,
    // which is the cheap half of this shader.
    const gl = canvas.getContext("webgl2", {
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Aurora program:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Single oversized triangle covering the clip volume — ogl's Triangle
    // geometry, minus the uv attribute the shader never reads.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uAmplitude = gl.getUniformLocation(program, "uAmplitude");
    const uColorStops = gl.getUniformLocation(program, "uColorStops");
    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uBlend = gl.getUniformLocation(program, "uBlend");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    ctn.appendChild(canvas);

    // Opaque clear, read live off the canvas' own computed style so the light /
    // dark flip needs no JS knowledge of the palette.
    const readClearColor = () => {
      const m = getComputedStyle(canvas).backgroundColor.match(/[\d.]+/g);
      if (m) gl.clearColor(+m[0] / 255, +m[1] / 255, +m[2] / 255, 1);
    };
    readClearColor();

    const stopData = new Float32Array(9);
    let animateId = 0;

    const render = (t: number) => {
      const { time = t * 0.01, speed = 1.0 } = propsRef.current;
      gl.uniform1f(uTime, time * speed * 0.1);
      gl.uniform1f(uAmplitude, propsRef.current.amplitude ?? 1.0);
      gl.uniform1f(uBlend, propsRef.current.blend ?? blend);
      const stops = propsRef.current.colorStops ?? colorStops;
      for (let i = 0; i < 3; i++) {
        const [r, g, b] = toRGB(stops[i]);
        stopData[i * 3] = r;
        stopData[i * 3 + 1] = g;
        stopData[i * 3 + 2] = b;
      }
      gl.uniform3fv(uColorStops, stopData);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // Drawing buffer stays at CSS pixels (ogl's default dpr of 1). This is a
    // soft gradient with no edges to alias, so a retina buffer would quadruple
    // the fragment count for nothing visible — the point of the pause logic
    // below is the same budget.
    const resize = () => {
      const width = ctn.offsetWidth;
      const height = ctn.offsetHeight;
      if (!width || !height) return;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uResolution, width, height);
      if (!animateId) render(performance.now());
    };
    window.addEventListener("resize", resize);

    // Two independent reasons not to burn a frame: the user asked for less
    // motion, or the hero isn't on screen. Both route through the same pair so
    // they can't disagree.
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = false;

    const update = (t: number) => {
      animateId = requestAnimationFrame(update);
      render(t);
    };
    const start = () => {
      if (!animateId && onScreen && !motionMq.matches) {
        animateId = requestAnimationFrame(update);
      }
    };
    const stop = () => {
      cancelAnimationFrame(animateId);
      animateId = 0;
    };
    const sync = () => (motionMq.matches ? stop() : start());
    motionMq.addEventListener("change", sync);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      // Coming back can also mean un-hidden rather than scrolled-to (the hero
      // display:nones this once the page is past it), and resize() bails while
      // the container measures 0 — so re-sync the buffer before resuming.
      if (onScreen) {
        resize();
        start();
      } else stop();
    });
    io.observe(ctn);

    // data-theme on <html> is the single source of truth for the palette (the
    // navbar toggle writes it, and so does the OS-preference listener next to
    // it), so watching the attribute covers both paths — no second matchMedia
    // subscription here.
    const themeObserver = new MutationObserver(() => {
      readClearColor();
      if (!animateId) render(performance.now());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    resize();

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener("resize", resize);
      motionMq.removeEventListener("change", sync);
      io.disconnect();
      themeObserver.disconnect();
      if (canvas.parentNode === ctn) ctn.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amplitude]);

  return <div ref={ctnDom} className="w-full h-full" />;
}

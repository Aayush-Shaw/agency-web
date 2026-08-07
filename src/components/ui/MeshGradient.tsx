"use client";

import { useEffect, useRef } from "react";

/**
 * The animated mesh field behind everything after the hero: two standing
 * columns — maple left, pine right — breathing past each other with the
 * parchment splitting them, and an amber horizon sweeping between. It is a
 * flag, read slowly.
 *
 * This was one of four compositions, one per switchable theme. The other three
 * went with their themes; the arrangement is what carried them, so what is left
 * here is that one field rather than a recolourable generic one.
 */
const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uBase;   // the ground, and the canvas clear colour
uniform vec3 uNode0;  // amber — carries the large areas
uniform vec3 uNode1;  // maple red
uniform vec3 uNode2;  // pine

out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

/* Three octaves, recentred on zero so it reads as a displacement rather than a
   brightness. The field below warps its coordinates through this — it is what
   separates an organic mesh from a gradient with moving dots in it, and the
   reason it never settles into a pose you recognise. */
float fbm(vec2 p) {
  return noise(p) * 0.55 + noise(p * 2.17 + 4.7) * 0.29
       + noise(p * 4.09 - 2.3) * 0.16 - 0.5;
}

/* The field returns raw weights for (node0, node1, node2). They are allowed to
   overlap and to exceed 1 — main() normalises the hue and governs the amount,
   so this can be written for the shape it wants rather than for a budget.

   Two standing columns — maple left, pine right — that breathe past each other
   with the parchment splitting them, and an amber horizon sweeping between. */
vec3 field(vec2 p, float t, float a) {
  float wob = fbm(p * 1.3 + vec2(t * 0.10, 0.0)) * 0.5;
  return vec3(
    1.0 - smoothstep(0.0, 0.60, abs(p.y - (0.52 + 0.24 * sin(t * 0.19))) + wob * 0.30),
    1.0 - smoothstep(0.0, 0.66, abs(p.x - (0.24 + 0.20 * sin(t * 0.31)) * a) + wob * 0.45),
    1.0 - smoothstep(0.0, 0.62, abs(p.x - (0.82 + 0.17 * cos(t * 0.24)) * a) - wob * 0.40)
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float a = uResolution.x / uResolution.y;
  // Squared-up space, so shapes stay round on a wide viewport instead of
  // stretching into lozenges. y stays 0..1 — the amber band runs horizontally
  // and wants the viewport's own vertical extent, not the corrected one.
  vec2 p = vec2(uv.x * a, uv.y);

  vec3 w = max(field(p, uTime, a), vec3(0.0));

  float total = w.x + w.y + w.z;
  vec3 tint = (uNode0 * w.x + uNode1 * w.y + uNode2 * w.z) / max(total, 1e-4);

  /* The legibility governor, and the reason the field above can be written
     boldly. Body copy sits directly on this layer, so how far the ground is
     allowed to travel from the base tone depends entirely on how dark it is
     travelling: the amber can take almost the whole budget and still leave the
     ink well past 4.5:1, where the maple and the pine cannot.

     So rather than hand-capping every node — which is what flattened the first
     pass into a near-flat cream — the amount is scaled by the luminance of
     whatever hue actually won this fragment. Dark tints are pulled back
     automatically and keep their character as accents; light ones run free.
     One expression, and the field is legible by construction. */
  float tl = dot(tint, vec3(0.2126, 0.7152, 0.0722));
  float amt = min(total, 0.82) * mix(0.10, 1.0, smoothstep(0.25, 0.78, tl));

  vec3 col = mix(uBase, tint, amt);

  // Half a code value of hash noise. A gradient this smooth and this large
  // bands visibly on an 8-bit buffer, and one dither costs less than every
  // alternative.
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

  fragColor = vec4(col, 1.0);
}
`;

/** Plain 0-255 → 0-1, same as Aurora's. The --mesh-* tokens are all literal
    hex for this reason: getPropertyValue hands back the authored string, so a
    color-mix() in globals.css would arrive here unparsed. */
function toRGB(hex: string): [number, number, number] {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("MeshGradient shader:", gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

export default function MeshGradient() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctn = host.current;
    if (!ctn) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%";

    // preserveDrawingBuffer, for the same reason Aurora needs it: this canvas
    // deliberately stops drawing — one static frame under reduced motion, and
    // nothing at all while the tab is hidden or the layer is off-screen —
    // and without it the buffer is discarded after each composite, so the next
    // repaint that isn't preceded by a draw comes up blank.
    const gl = canvas.getContext("webgl2", {
      antialias: false,
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
      console.error("MeshGradient program:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // One oversized triangle covering the clip volume.
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

    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uniforms = ["uBase", "uNode0", "uNode1", "uNode2"].map((n) =>
      gl.getUniformLocation(program, n)
    );

    ctn.appendChild(canvas);

    // The stops are read off <html> rather than passed in, so the palette lives
    // in exactly one place (globals.css) and this file knows no hex at all.
    // Read once: there is no theme switch left to change them under us.
    const cs = getComputedStyle(document.documentElement);
    ["--mesh-0", "--mesh-1", "--mesh-2", "--mesh-3"].forEach((name, i) => {
      const value = cs.getPropertyValue(name);
      if (!value) return;
      const rgb = toRGB(value);
      gl.uniform3fv(uniforms[i], rgb);
      if (i === 0) gl.clearColor(rgb[0], rgb[1], rgb[2], 1);
    });

    // Own clock, advanced only while the loop is actually running. performance
    // .now() keeps counting through a hidden tab, so driving the shader off it
    // directly would teleport the field forward the moment the tab came back;
    // accumulating capped deltas means a pause of any length resumes exactly
    // where it stopped. The cap also covers the first frame after a resume,
    // where the delta is whatever rAF felt like handing over.
    let clock = 0;
    let last = 0;
    let raf = 0;

    const render = () => {
      gl.uniform1f(uTime, clock);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      clock += Math.min(t - last, 50) * 0.001;
      last = t;
      render();
    };

    // Drawing buffer stays at CSS pixels. This is a soft gradient with no edges
    // to alias, so a retina buffer would quadruple the fragment count for
    // nothing visible.
    const resize = () => {
      const width = ctn.offsetWidth;
      const height = ctn.offsetHeight;
      if (!width || !height) return;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uResolution, width, height);
      if (!raf) render();
    };

    // Three independent reasons not to burn a frame — the user asked for less
    // motion, the tab is in the background, or the layer isn't on screen — all
    // routed through one predicate so they can't disagree with each other.
    // Under reduced motion the clock never advances, so what stays on screen is
    // a static snapshot of the field rather than an empty canvas.
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = false;
    const canRun = () =>
      onScreen && !motionMq.matches && document.visibilityState === "visible";

    const start = () => {
      if (!raf && canRun()) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => (canRun() ? start() : stop());

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      // Coming back on screen can also mean coming back from a zero-sized
      // layout, and resize() bails while the container measures 0 — so re-sync
      // the buffer before resuming.
      if (onScreen) resize();
      sync();
    });
    io.observe(ctn);

    window.addEventListener("resize", resize);
    motionMq.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);

    resize();

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      motionMq.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      io.disconnect();
      if (canvas.parentNode === ctn) ctn.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={host} className="mesh-bg" aria-hidden="true" />;
}

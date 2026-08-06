"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The animated mesh field behind everything after the hero, for the four extra
 * themes only. Light and dark keep the flat background and the two-glow
 * `.atmosphere` they have always had — see globals.css, which hides that layer
 * for exactly these four.
 *
 * It renders nothing at all on the other themes rather than hiding a live
 * canvas: a WebGL context is a scarce per-document resource, and there is no
 * reason to hold one open for a theme that never paints it.
 *
 * Each theme gets its own *composition*, not just its own colours — recolouring
 * one arrangement of blobs four times is what made these read as the same page
 * in four tints, especially with three of the four sharing a parchment ground.
 * The value here is the uStyle branch in the shader below.
 */
const MESH_STYLES: Record<string, number> = {
  hiking: 0, // ridgelines receding into haze
  canada: 1, // two vertical masses breathing past each other
  "mr-bean": 2, // a tweed weave
  gucci: 3, // a sheen travelling across satin
};

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
uniform int uStyle;
uniform vec3 uBase;   // the ground, and the canvas clear colour
uniform vec3 uNode0;  // light-mid tone — carries the large areas
uniform vec3 uNode1;  // dark chromatic accent
uniform vec3 uNode2;  // ink (gucci: gold — the one theme where this is lighter)

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
   brightness. Every field below warps its own coordinates through this — it is
   what separates an organic mesh from a gradient with moving dots in it, and
   the reason none of the four ever settle into a pose you recognise. */
float fbm(vec2 p) {
  return noise(p) * 0.55 + noise(p * 2.17 + 4.7) * 0.29
       + noise(p * 4.09 - 2.3) * 0.16 - 0.5;
}

float blob(vec2 p, vec2 at, float r) {
  vec2 d = p - at;
  return exp(-dot(d, d) / (r * r));
}

/* Each field returns raw weights for (node0, node1, node2). They are allowed to
   overlap and to exceed 1 — main() normalises the hue and governs the amount,
   so these can be written for the shape they want rather than for a budget. */

/* Ridgelines. Warm haze filling most of the frame, a rose ridge under it, ink
   only at the very bottom edge — three depths, each warped on its own noise so
   they slide against each other instead of as a slab. The drift is lateral:
   weather crossing a valley, not a light being moved. */
vec3 fieldHiking(vec2 p, float t) {
  float breathe = 0.10 * sin(t * 0.16);
  return vec3(
    1.0 - smoothstep(0.06, 0.94, p.y + breathe + fbm(vec2(p.x * 0.9, t * 0.11)) * 0.55),
    1.0 - smoothstep(-0.10, 0.48, p.y + breathe + fbm(vec2(p.x * 1.5 + 9.0, t * 0.09)) * 0.60),
    1.0 - smoothstep(-0.16, 0.22, p.y + fbm(vec2(p.x * 2.2 + 21.0, t * 0.07)) * 0.42)
  );
}

/* Two standing columns — maple left, pine right — that breathe past each other
   with the parchment splitting them, and an amber horizon sweeping between. The
   only vertical composition of the four, which is most of why it reads as a
   different site and not a different tint. */
vec3 fieldCanada(vec2 p, float t, float a) {
  float wob = fbm(p * 1.3 + vec2(t * 0.10, 0.0)) * 0.5;
  return vec3(
    1.0 - smoothstep(0.0, 0.60, abs(p.y - (0.52 + 0.24 * sin(t * 0.19))) + wob * 0.30),
    1.0 - smoothstep(0.0, 0.66, abs(p.x - (0.24 + 0.20 * sin(t * 0.31)) * a) + wob * 0.45),
    1.0 - smoothstep(0.0, 0.62, abs(p.x - (0.82 + 0.17 * cos(t * 0.24)) * a) - wob * 0.40)
  );
}

/* Tweed. Two sets of broad diagonals crossing — tan one way, maroon the other —
   dragged through a warp so the weave never registers with itself. Roughly nine
   cycles across, so on a laptop the bands land around 160px: cloth at arm's
   length, not a hatch pattern. The mass term keeps it from being wallpaper by
   giving the bolt a shape underneath. */
vec3 fieldBean(vec2 p, float t, float a) {
  float warp = fbm(p * 0.85 + vec2(t * 0.06, t * 0.045)) * 0.6;
  float w1 = 0.5 + 0.5 * sin((p.x + p.y) * 9.0 + warp * 4.0 + t * 0.42);
  float w2 = 0.5 + 0.5 * sin((p.x - p.y) * 11.0 - warp * 4.0 - t * 0.35);
  float mass = blob(p, vec2((0.62 + 0.22 * sin(t * 0.13)) * a, 0.34 + 0.18 * cos(t * 0.17)), 0.85);
  return vec3(w1 * 0.80 + mass * 0.55, w2 * w2 * 0.62, (1.0 - w1) * w2 * 0.38);
}

/* A specular band crossing greige the way light crosses satin, over leather and
   camel masses that drift underneath it. The band is the signature and it is
   the fastest-moving thing in any of the four — gold is lighter than this
   theme's ground, so the governor below lets it run at full strength where the
   other three are held back. */
vec3 fieldGucci(vec2 p, float t, float a) {
  float warp = fbm(p * 1.1 + vec2(t * 0.07, 0.0)) * 0.5;
  float axis = (p.x / a) * 0.72 + p.y * 0.69 + warp * 0.35;
  // d*d, not pow(d, 2.0): the base is signed either side of the band's centre,
  // and pow() is undefined for a negative base.
  float d = (axis - (0.5 + 0.62 * sin(t * 0.26))) * 3.1;
  float sheen = exp(-d * d);
  return vec3(
    blob(p, vec2((0.22 + 0.16 * cos(t * 0.15)) * a, 0.72 + 0.14 * sin(t * 0.18)), 0.66)
      * 0.90 + sheen * 0.25,
    blob(p, vec2((0.80 + 0.14 * sin(t * 0.12)) * a, 0.24 + 0.16 * cos(t * 0.21)), 0.58)
      * 0.85,
    sheen * 0.95
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float a = uResolution.x / uResolution.y;
  // Squared-up space, so shapes stay round on a wide viewport instead of
  // stretching into lozenges. y stays 0..1 — the fields that band horizontally
  // want the viewport's own vertical extent, not the corrected one.
  vec2 p = vec2(uv.x * a, uv.y);
  float t = uTime;

  vec3 w;
  if (uStyle == 0) w = fieldHiking(p, t);
  else if (uStyle == 1) w = fieldCanada(p, t, a);
  else if (uStyle == 2) w = fieldBean(p, t, a);
  else w = fieldGucci(p, t, a);
  w = max(w, vec3(0.0));

  float total = w.x + w.y + w.z;
  vec3 tint = (uNode0 * w.x + uNode1 * w.y + uNode2 * w.z) / max(total, 1e-4);

  /* The legibility governor, and the reason the fields above can be written
     boldly. Body copy sits directly on this layer, so how far the ground is
     allowed to travel from the base tone depends entirely on how dark it is
     travelling: a gold or a clay can take almost the whole budget and still
     leave the ink well past 4.5:1, where a maple red or an olive cannot.

     So rather than hand-capping every node — which is what flattened the first
     pass into four near-identical creams — the amount is scaled by the
     luminance of whatever hue actually won this fragment. Dark tints are pulled
     back automatically and keep their character as accents; light ones run
     free. One expression, and every field is legible by construction. */
  float tl = dot(tint, vec3(0.2126, 0.7152, 0.0722));
  float amt = min(total, 0.82) * mix(0.42, 1.0, smoothstep(0.25, 0.78, tl));

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
  const [on, setOn] = useState(false);

  // data-theme on <html> is the site's single theme switch — the <head> script
  // writes it on load, the menu writes it on a pick, and the OS listener writes
  // it on a system change. Watching the attribute covers all three without this
  // component holding a second copy of the state.
  useEffect(() => {
    const html = document.documentElement;
    const sync = () => setOn((html.dataset.theme ?? "") in MESH_STYLES);
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

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
    const uStyle = gl.getUniformLocation(program, "uStyle");
    const uniforms = ["uBase", "uNode0", "uNode1", "uNode2"].map((n) =>
      gl.getUniformLocation(program, n)
    );

    ctn.appendChild(canvas);

    // The palette is read off <html>, not passed in, so the theme's stops live
    // in exactly one place (globals.css) and this file knows no hex at all. The
    // composition is the one thing that can't live there — a CSS variable can
    // carry a colour but not an arrangement — so it comes from MESH_STYLES,
    // keyed by the same attribute.
    const readTheme = () => {
      const html = document.documentElement;
      const cs = getComputedStyle(html);
      ["--mesh-0", "--mesh-1", "--mesh-2", "--mesh-3"].forEach((name, i) => {
        const value = cs.getPropertyValue(name);
        if (!value) return;
        const rgb = toRGB(value);
        gl.uniform3fv(uniforms[i], rgb);
        if (i === 0) gl.clearColor(rgb[0], rgb[1], rgb[2], 1);
      });
      gl.uniform1i(uStyle, MESH_STYLES[html.dataset.theme ?? ""] ?? 0);
    };
    readTheme();

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

    // Theme changes between two mesh themes leave this mounted, so the stops
    // and the composition have to be re-read rather than re-created.
    const themeObserver = new MutationObserver(() => {
      readTheme();
      if (!raf) render();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

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
      themeObserver.disconnect();
      if (canvas.parentNode === ctn) ctn.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [on]);

  return on ? <div ref={host} className="mesh-bg" aria-hidden="true" /> : null;
}

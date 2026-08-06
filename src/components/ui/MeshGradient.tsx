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
 */
const MESH_THEMES = new Set(["hiking", "canada", "mr-bean", "gucci"]);

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
uniform vec3 uBase;
uniform vec3 uNode0;
uniform vec3 uNode1;
uniform vec3 uNode2;

out vec4 fragColor;

/* One mesh point: a soft gaussian blob of colour c centred at at, laid over
   whatever is already there.

   Layered mixes rather than one normalised weighted sum, deliberately. A
   weighted sum averages every node everywhere, which flattens to a single
   muddy tone in the middle of the screen; mixing in order lets the later nodes
   read as sitting *on* the earlier ones, which is what gives the field depth.

   w is the node's maximum share and it is the legibility budget. Copy sits on
   top of this layer, so no node is allowed to take the ground far enough from
   the base tone to eat the text contrast the theme was picked for — the caps
   below keep the worst overlap around 5:1 on the light grounds these four
   palettes all use. */
vec3 blend(vec3 base, vec3 c, vec2 p, vec2 at, float k, float w) {
  vec2 d = p - at;
  return mix(base, c, w * exp(-dot(d, d) * k));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float a = uResolution.x / uResolution.y;
  // Squared-up space, so the blobs stay round on a wide viewport instead of
  // stretching into lozenges.
  vec2 p = vec2(uv.x * a, uv.y);
  float t = uTime;

  /* Three nodes on three lissajous paths. The frequencies are mutually prime-ish
     (0.21/0.17, 0.13/0.19, 0.11/0.23 rad/s — periods of ~30 to ~57 seconds) so
     the combined figure does not close, and the field never returns to a pose
     you can recognise as the start of a loop. Slow on purpose: this sits behind
     every section on the page, and a backdrop you can watch move is a backdrop
     competing with the copy in front of it. */
  vec3 col = uBase;
  col = blend(col, uNode0, p,
    vec2((0.30 + 0.16 * sin(t * 0.21)) * a, 0.30 + 0.13 * cos(t * 0.17)),
    4.5, 0.30);
  col = blend(col, uNode1, p,
    vec2((0.74 + 0.14 * cos(t * 0.13)) * a, 0.62 + 0.18 * sin(t * 0.19)),
    5.5, 0.24);
  col = blend(col, uNode2, p,
    vec2((0.50 + 0.22 * sin(t * 0.11 + 1.7)) * a, 0.88 + 0.12 * cos(t * 0.23 + 0.9)),
    6.5, 0.18);

  // Half a code value of hash noise. A gradient this smooth and this large
  // bands visibly on an 8-bit buffer, and one dither costs less than every
  // alternative.
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;

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
    const sync = () => setOn(MESH_THEMES.has(html.dataset.theme ?? ""));
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
    const uniforms = ["uBase", "uNode0", "uNode1", "uNode2"].map((n) =>
      gl.getUniformLocation(program, n)
    );

    ctn.appendChild(canvas);

    // The palette is read off <html>, not passed in, so the theme's stops live
    // in exactly one place (globals.css) and this file knows no hex at all.
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      ["--mesh-0", "--mesh-1", "--mesh-2", "--mesh-3"].forEach((name, i) => {
        const value = cs.getPropertyValue(name);
        if (!value) return;
        const rgb = toRGB(value);
        gl.uniform3fv(uniforms[i], rgb);
        if (i === 0) gl.clearColor(rgb[0], rgb[1], rgb[2], 1);
      });
    };
    readColors();

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
    // have to be re-read rather than re-created.
    const themeObserver = new MutationObserver(() => {
      readColors();
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

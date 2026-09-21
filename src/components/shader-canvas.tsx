'use client';

import { useEffect, useRef } from 'react';

export function ShaderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const c = canvas;
    const g = gl;

    function resize() {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      g.viewport(0, 0, c.width, c.height);
    }
    window.addEventListener('resize', resize);
    resize();

    const vsSource = `attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

    const fsSource = `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
  for (int i = 0; i < 4; ++i) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  st.x *= u_resolution.x / u_resolution.y;

  float t = u_time * 0.08;

  vec2 q = vec2(0.0);
  q.x = fbm(st + 0.00 * t);
  q.y = fbm(st + vec2(1.0));

  vec2 r = vec2(0.0);
  r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.12 * t);
  r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.09 * t);

  float f = fbm(st + r);

  vec3 colorBg = vec3(0.99, 0.97, 0.94);
  vec3 colorCaramel = vec3(0.78, 0.51, 0.26);
  vec3 colorEspresso = vec3(0.54, 0.31, 0.07);

  vec3 col = mix(colorBg, colorCaramel, clamp((f * f) * 2.4, 0.0, 1.0));
  col = mix(col, colorEspresso, clamp(length(q), 0.0, 1.0) * 0.35);

  gl_FragColor = vec4(col, 0.65);
}`;

    function compileShader(type: number, source: string) {
      const shader = g.createShader(type)!;
      g.shaderSource(shader, source);
      g.compileShader(shader);
      return shader;
    }

    const program = g.createProgram();
    g.attachShader(program, compileShader(g.VERTEX_SHADER, vsSource));
    g.attachShader(program, compileShader(g.FRAGMENT_SHADER, fsSource));
    g.linkProgram(program);
    g.useProgram(program);

    const posBuffer = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, posBuffer);
    g.bufferData(
      g.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      g.STATIC_DRAW
    );

    const posLoc = g.getAttribLocation(program, 'position');
    g.enableVertexAttribArray(posLoc);
    g.vertexAttribPointer(posLoc, 2, g.FLOAT, false, 0, 0);

    const resLoc = g.getUniformLocation(program, 'u_resolution');
    const timeLoc = g.getUniformLocation(program, 'u_time');

    const startTime = performance.now();
    let animId: number;
    function render() {
      const now = (performance.now() - startTime) * 0.001;
      g.uniform2f(resLoc, c.width, c.height);
      g.uniform1f(timeLoc, now);
      g.drawArrays(g.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    }
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 block"
    />
  );
}

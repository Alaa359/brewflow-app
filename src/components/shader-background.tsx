'use client';

import { useEffect, useRef } from 'react';

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      if (gl) gl.viewport(0, 0, canvas!.width, canvas!.height);
    }
    window.addEventListener('resize', resize);
    resize();

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
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

        float t = u_time * 0.12;

        vec2 q = vec2(0.0);
        q.x = fbm(st + 0.00 * t);
        q.y = fbm(st + vec2(1.0));

        vec2 r = vec2(0.0);
        r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t);
        r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t);

        float f = fbm(st + r);

        vec3 colorBg = vec3(1.0, 0.973, 0.945);
        vec3 colorCaramel = vec3(0.784, 0.510, 0.259);
        vec3 colorEspresso = vec3(0.545, 0.310, 0.075);
        vec3 colorDark = vec3(0.173, 0.118, 0.094);

        vec3 col = mix(colorBg, colorCaramel, clamp((f * f) * 2.8, 0.0, 1.0));
        col = mix(col, colorEspresso, clamp(length(q), 0.0, 1.0) * 0.4);
        col = mix(col, colorDark, clamp(length(r.x), 0.0, 1.0) * 0.15);

        gl_FragColor = vec4(col, 0.88);
      }
    `;

    function compileShader(type: number, source: string) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      return shader;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');

    const startTime = performance.now();
    let animId: number;
    function render() {
      const now = (performance.now() - startTime) * 0.001;
      gl!.uniform2f(resLoc, canvas!.width, canvas!.height);
      gl!.uniform1f(timeLoc, now);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    }
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />
      <div className="fixed inset-0 pointer-events-none opacity-40 mix-blend-multiply bg-[radial-gradient(#c88242_1px,transparent_1px)] [background-size:24px_24px] z-0" />
      <div className="fixed top-1/4 -left-24 w-96 h-96 rounded-full bg-caramel/20 blur-3xl pointer-events-none mix-blend-multiply z-0" />
      <div className="fixed bottom-1/4 -right-24 w-[28rem] h-[28rem] rounded-full bg-caramel/15 blur-3xl pointer-events-none mix-blend-multiply z-0" />
    </>
  );
}

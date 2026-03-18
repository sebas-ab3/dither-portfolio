'use client';

import { useRef, useState, useEffect } from 'react';
import { createProgram, deleteProgram, type ShaderProgram } from '@/lib/webgl/createProgram';
import {
  createSingleFBO,
  createDoubleFBO,
  swapFBO,
  deleteSingleFBO,
  deleteDoubleFBO,
  getSupportedFloatFormat,
  type SingleFBO,
  type DoubleFBO,
} from '@/lib/webgl/framebuffer';
import { createQuadBuffer, bindQuad, bindTexture } from '@/lib/webgl/textures';
import { vertexShaderSrc } from '@/lib/webgl/shaders/vertex';
import { splatFragSrc } from '@/lib/webgl/shaders/splat';
import { advectionFragSrc } from '@/lib/webgl/shaders/advection';
import { divergenceFragSrc } from '@/lib/webgl/shaders/divergence';
import { pressureFragSrc } from '@/lib/webgl/shaders/pressure';
import { gradientFragSrc } from '@/lib/webgl/shaders/gradient';
import { ditherFragSrc } from '@/lib/webgl/shaders/dither';
import { barrelFragSrc } from '@/lib/webgl/shaders/barrel';

interface UseFluidSimOptions {
  simResolutionDivisor?: number; // default 4
  pressureIterations?: number; // default 25
  velocityDissipation?: number; // default 0.98
  dyeDissipation?: number; // default 0.97
  splatRadius?: number; // default 0.0025
  barrelStrength?: number; // default 0.12
  ditherScale?: number; // default 3.0
}

interface UseFluidSimReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isMobileFallback: boolean;
}

interface Programs {
  splat: ShaderProgram;
  advection: ShaderProgram;
  divergence: ShaderProgram;
  pressure: ShaderProgram;
  gradient: ShaderProgram;
  dither: ShaderProgram;
  barrel: ShaderProgram;
}

export function useFluidSim(options?: UseFluidSimOptions): UseFluidSimReturn {
  const {
    simResolutionDivisor = 4,
    pressureIterations = 25,
    velocityDissipation = 0.98,
    dyeDissipation = 0.97,
    splatRadius = 0.0025,
    barrelStrength = 0.12,
    ditherScale = 3.0,
  } = options ?? {};

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const frameIdRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0, down: false });
  const velocityRef = useRef<DoubleFBO | null>(null);
  const pressureRef = useRef<DoubleFBO | null>(null);
  const dyeRef = useRef<DoubleFBO | null>(null);
  const divergenceRef = useRef<SingleFBO | null>(null);
  const ditherFBORef = useRef<SingleFBO | null>(null);
  const programsRef = useRef<Programs | null>(null);
  const quadBufferRef = useRef<WebGLBuffer | null>(null);
  const [isMobileFallback, setIsMobileFallback] = useState(false);

  useEffect(() => {
    // Mobile check
    if (window.innerWidth < 768) {
      setIsMobileFallback(true);
      return;
    }

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    // Non-nullable alias for closures
    const canvas: HTMLCanvasElement = canvasEl;

    // WebGL2 check
    const glContext = canvas.getContext('webgl2');
    if (!glContext) {
      setIsMobileFallback(true);
      return;
    }

    // Float extension check
    const floatFmt = getSupportedFloatFormat(glContext);
    if (!floatFmt) {
      setIsMobileFallback(true);
      return;
    }

    // Create a non-nullable alias so closures see WebGL2RenderingContext (not T | null)
    const gl: WebGL2RenderingContext = glContext;
    glRef.current = gl;

    function buildPrograms(): Programs {
      return {
        splat: createProgram(gl, vertexShaderSrc, splatFragSrc, [
          'uTarget',
          'uTexelSize',
          'uPoint',
          'uColor',
          'uRadius',
        ]),
        advection: createProgram(gl, vertexShaderSrc, advectionFragSrc, [
          'uVelocity',
          'uSource',
          'uTexelSize',
          'uDt',
          'uDissipation',
        ]),
        divergence: createProgram(gl, vertexShaderSrc, divergenceFragSrc, [
          'uVelocity',
          'uTexelSize',
        ]),
        pressure: createProgram(gl, vertexShaderSrc, pressureFragSrc, [
          'uPressure',
          'uDivergence',
          'uTexelSize',
        ]),
        gradient: createProgram(gl, vertexShaderSrc, gradientFragSrc, [
          'uPressure',
          'uVelocity',
          'uTexelSize',
        ]),
        dither: createProgram(gl, vertexShaderSrc, ditherFragSrc, ['uSource', 'uDitherScale']),
        barrel: createProgram(gl, vertexShaderSrc, barrelFragSrc, ['uSource', 'uDistortion']),
      };
    }

    try {
      programsRef.current = buildPrograms();
    } catch (e) {
      console.error('Failed to compile shaders:', e);
      setIsMobileFallback(true);
      return;
    }

    quadBufferRef.current = createQuadBuffer(gl);

    function initFBOs() {
      const w = canvas.width;
      const h = canvas.height;
      if (!w || !h) return; // skip if canvas has no dimensions yet

      const simW = Math.max(1, Math.floor(w / simResolutionDivisor));
      const simH = Math.max(1, Math.floor(h / simResolutionDivisor));

      if (velocityRef.current) deleteDoubleFBO(gl, velocityRef.current);
      if (pressureRef.current) deleteDoubleFBO(gl, pressureRef.current);
      if (dyeRef.current) deleteDoubleFBO(gl, dyeRef.current);
      if (divergenceRef.current) deleteSingleFBO(gl, divergenceRef.current);
      if (ditherFBORef.current) deleteSingleFBO(gl, ditherFBORef.current);

      velocityRef.current = createDoubleFBO(gl, simW, simH, gl.RG16F, gl.RG, gl.HALF_FLOAT, gl.LINEAR);
      pressureRef.current = createDoubleFBO(gl, simW, simH, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.NEAREST);
      dyeRef.current = createDoubleFBO(gl, simW, simH, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR);
      divergenceRef.current = createSingleFBO(gl, simW, simH, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.NEAREST);
      ditherFBORef.current = createSingleFBO(gl, w, h, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR);
    }

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initFBOs();
    }

    resize();

    // --- rAF render loop ---
    let lastTime = performance.now();

    function render(now: number) {
      frameIdRef.current = requestAnimationFrame(render);

      // Guard for first-frame sizing race
      if (!canvas.width || !canvas.height) return;

      const dt = Math.min((now - lastTime) / 1000, 0.016);
      lastTime = now;

      const progs = programsRef.current;
      const quad = quadBufferRef.current;
      if (!progs || !quad) return;

      const vel = velocityRef.current;
      const pres = pressureRef.current;
      const dye = dyeRef.current;
      const div = divergenceRef.current;
      const ditherFBO = ditherFBORef.current;
      if (!vel || !pres || !dye || !div || !ditherFBO) return;

      const simW = vel.width;
      const simH = vel.height;
      const texelX = 1.0 / simW;
      const texelY = 1.0 / simH;

      bindQuad(gl, quad);

      // --- SPLAT ---
      const m = mouseRef.current;
      if (m.down) {
        const dx = m.x - m.px;
        const dy = m.y - m.py;

        const VELOCITY_FORCE = 3000.0;
        const MAX_DELTA = 0.02;
        const cdx = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, dx));
        const cdy = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, dy));

        gl.useProgram(progs.splat.program);
        gl.viewport(0, 0, simW, simH);

        // Velocity splat
        gl.bindFramebuffer(gl.FRAMEBUFFER, vel.write.fbo);
        bindTexture(gl, 0, vel.read.texture);
        gl.uniform1i(progs.splat.uniforms.uTarget, 0);
        gl.uniform2f(progs.splat.uniforms.uTexelSize, texelX, texelY);
        gl.uniform2f(progs.splat.uniforms.uPoint, m.x, m.y);
        gl.uniform3f(
          progs.splat.uniforms.uColor,
          cdx * VELOCITY_FORCE,
          cdy * VELOCITY_FORCE,
          0.0,
        );
        gl.uniform1f(progs.splat.uniforms.uRadius, splatRadius);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        swapFBO(vel);

        // Dye splat
        gl.bindFramebuffer(gl.FRAMEBUFFER, dye.write.fbo);
        bindTexture(gl, 0, dye.read.texture);
        gl.uniform1i(progs.splat.uniforms.uTarget, 0);
        gl.uniform2f(progs.splat.uniforms.uTexelSize, texelX, texelY);
        gl.uniform2f(progs.splat.uniforms.uPoint, m.x, m.y);
        gl.uniform3f(
          progs.splat.uniforms.uColor,
          0.8 + Math.random() * 0.1,
          0.1,
          0.05,
        );
        gl.uniform1f(progs.splat.uniforms.uRadius, splatRadius);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        swapFBO(dye);
      }

      // --- ADVECTION ---
      gl.useProgram(progs.advection.program);
      gl.viewport(0, 0, simW, simH);

      // Velocity self-advects
      gl.bindFramebuffer(gl.FRAMEBUFFER, vel.write.fbo);
      bindTexture(gl, 0, vel.read.texture);
      bindTexture(gl, 1, vel.read.texture);
      gl.uniform1i(progs.advection.uniforms.uVelocity, 0);
      gl.uniform1i(progs.advection.uniforms.uSource, 1);
      gl.uniform2f(progs.advection.uniforms.uTexelSize, texelX, texelY);
      gl.uniform1f(progs.advection.uniforms.uDt, dt);
      gl.uniform1f(progs.advection.uniforms.uDissipation, velocityDissipation);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      swapFBO(vel);

      // Dye advects with velocity
      gl.bindFramebuffer(gl.FRAMEBUFFER, dye.write.fbo);
      bindTexture(gl, 0, vel.read.texture);
      bindTexture(gl, 1, dye.read.texture);
      gl.uniform1i(progs.advection.uniforms.uVelocity, 0);
      gl.uniform1i(progs.advection.uniforms.uSource, 1);
      gl.uniform2f(progs.advection.uniforms.uTexelSize, texelX, texelY);
      gl.uniform1f(progs.advection.uniforms.uDt, dt);
      gl.uniform1f(progs.advection.uniforms.uDissipation, dyeDissipation);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      swapFBO(dye);

      // --- DIVERGENCE ---
      gl.useProgram(progs.divergence.program);
      gl.viewport(0, 0, simW, simH);
      gl.bindFramebuffer(gl.FRAMEBUFFER, div.fbo);
      bindTexture(gl, 0, vel.read.texture);
      gl.uniform1i(progs.divergence.uniforms.uVelocity, 0);
      gl.uniform2f(progs.divergence.uniforms.uTexelSize, texelX, texelY);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // --- CLEAR PRESSURE ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, pres.read.fbo);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // --- PRESSURE JACOBI (25 iterations) ---
      gl.useProgram(progs.pressure.program);
      gl.viewport(0, 0, simW, simH);
      for (let i = 0; i < pressureIterations; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, pres.write.fbo);
        bindTexture(gl, 0, pres.read.texture);
        bindTexture(gl, 1, div.texture);
        gl.uniform1i(progs.pressure.uniforms.uPressure, 0);
        gl.uniform1i(progs.pressure.uniforms.uDivergence, 1);
        gl.uniform2f(progs.pressure.uniforms.uTexelSize, texelX, texelY);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        swapFBO(pres);
      }

      // --- GRADIENT SUBTRACT ---
      gl.useProgram(progs.gradient.program);
      gl.viewport(0, 0, simW, simH);
      gl.bindFramebuffer(gl.FRAMEBUFFER, vel.write.fbo);
      bindTexture(gl, 0, pres.read.texture);
      bindTexture(gl, 1, vel.read.texture);
      gl.uniform1i(progs.gradient.uniforms.uPressure, 0);
      gl.uniform1i(progs.gradient.uniforms.uVelocity, 1);
      gl.uniform2f(progs.gradient.uniforms.uTexelSize, texelX, texelY);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      swapFBO(vel);

      // --- DITHER PASS: dye → ditherFBO ---
      gl.useProgram(progs.dither.program);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, ditherFBO.fbo);
      bindTexture(gl, 0, dye.read.texture);
      gl.uniform1i(progs.dither.uniforms.uSource, 0);
      gl.uniform1f(progs.dither.uniforms.uDitherScale, ditherScale);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // --- BARREL PASS: ditherFBO → canvas ---
      gl.useProgram(progs.barrel.program);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      bindTexture(gl, 0, ditherFBO.texture);
      gl.uniform1i(progs.barrel.uniforms.uSource, 0);
      gl.uniform1f(progs.barrel.uniforms.uDistortion, barrelStrength);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      m.px = m.x;
      m.py = m.y;
    }

    function startLoop() {
      lastTime = performance.now();
      frameIdRef.current = requestAnimationFrame(render);
    }

    // --- Mouse events ---
    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const m = mouseRef.current;
      m.px = m.x;
      m.py = m.y;
      m.x = (e.clientX - rect.left) / canvas.width;
      m.y = 1.0 - (e.clientY - rect.top) / canvas.height;
    }

    function onMouseDown(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const m = mouseRef.current;
      m.down = true;
      m.px = (e.clientX - rect.left) / canvas.width;
      m.py = 1.0 - (e.clientY - rect.top) / canvas.height;
      m.x = m.px;
      m.y = m.py;
    }

    function onMouseUp() {
      mouseRef.current.down = false;
    }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const m = mouseRef.current;
      m.down = true;
      m.px = (touch.clientX - rect.left) / canvas.width;
      m.py = 1.0 - (touch.clientY - rect.top) / canvas.height;
      m.x = m.px;
      m.y = m.py;
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const m = mouseRef.current;
      m.px = m.x;
      m.py = m.y;
      m.x = (touch.clientX - rect.left) / canvas.width;
      m.y = 1.0 - (touch.clientY - rect.top) / canvas.height;
    }

    function onTouchEnd() {
      mouseRef.current.down = false;
    }

    // --- Context loss handlers ---
    function onContextLost(e: Event) {
      e.preventDefault();
      cancelAnimationFrame(frameIdRef.current);
    }

    function onContextRestored() {
      try {
        programsRef.current = buildPrograms();
        quadBufferRef.current = createQuadBuffer(gl);
        initFBOs();
        startLoop();
      } catch (e) {
        console.error('Failed to restore WebGL context:', e);
      }
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', resize);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    startLoop();

    return () => {
      cancelAnimationFrame(frameIdRef.current);

      if (velocityRef.current) {
        deleteDoubleFBO(gl, velocityRef.current);
        velocityRef.current = null;
      }
      if (pressureRef.current) {
        deleteDoubleFBO(gl, pressureRef.current);
        pressureRef.current = null;
      }
      if (dyeRef.current) {
        deleteDoubleFBO(gl, dyeRef.current);
        dyeRef.current = null;
      }
      if (divergenceRef.current) {
        deleteSingleFBO(gl, divergenceRef.current);
        divergenceRef.current = null;
      }
      if (ditherFBORef.current) {
        deleteSingleFBO(gl, ditherFBORef.current);
        ditherFBORef.current = null;
      }
      if (programsRef.current) {
        Object.values(programsRef.current).forEach((sp) => deleteProgram(gl, sp));
        programsRef.current = null;
      }
      if (quadBufferRef.current) {
        gl.deleteBuffer(quadBufferRef.current);
        quadBufferRef.current = null;
      }

      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { canvasRef, isMobileFallback };
}

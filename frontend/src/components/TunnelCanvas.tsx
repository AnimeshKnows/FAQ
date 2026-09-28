import React, { useEffect, useRef } from 'react';

interface TunnelCanvasProps {
  scrollProgress: number; // 0.0 to 1.0
  onCoreClick?: () => void;
}

export const TunnelCanvas: React.FC<TunnelCanvasProps> = ({ scrollProgress, onCoreClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // References to maintain animation state without re-allocating
  const stateRef = useRef({
    flightZ: 0,
    animationTime: 0,
    smoothProgress: 0,
    targetProgress: 0,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    particles: [] as Array<{
      x: number;
      y: number;
      z: number;
      size: number;
      baseAlpha: number;
      speedZ: number;
      char: string | null;
    }>
  });

  // Keep targetProgress updated from props
  useEffect(() => {
    stateRef.current.targetProgress = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize 3D Tunnel particles
    const TUNNEL_DEPTH = 3600;
    const RING_COUNT = 38;
    const FOCAL_LENGTH = 420;
    const PARTICLE_COUNT = 320;

    const particles = [];
    const tokens = ['01', 'RAG', '+', 'CORPUS', 'FASTAPI', 'REACT'];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 90 + Math.random() * 520;
      particles.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: Math.random() * TUNNEL_DEPTH,
        size: 0.8 + Math.random() * 2.2,
        baseAlpha: 0.2 + Math.random() * 0.7,
        speedZ: 2 + Math.random() * 6,
        char: Math.random() > 0.84 ? tokens[Math.floor(Math.random() * tokens.length)] : null
      });
    }
    stateRef.current.particles = particles;

    // Longitudinal Perspective Grid Rays
    const RAY_COUNT = 16;
    const tunnelRays: { angle: number }[] = [];
    for (let i = 0; i < RAY_COUNT; i++) {
      tunnelRays.push({ angle: (i / RAY_COUNT) * Math.PI * 2 });
    }

    // Procedural Simplex Noise generator for organic singularity blob
    const SimplexNoise = (() => {
      const p = new Uint8Array(256);
      for (let i = 0; i < 256; i++) p[i] = Math.floor(Math.random() * 256);
      const perm = new Uint8Array(512);
      const permMod12 = new Uint8Array(512);
      for (let i = 0; i < 512; i++) {
        perm[i] = p[i & 255];
        permMod12[i] = perm[i] % 12;
      }
      const grad3 = new Float32Array([
        1,1,0, -1,1,0, 1,-1,0, -1,-1,0,
        1,0,1, -1,0,1, 1,0,-1, -1,0,-1,
        0,1,1,  0,-1,1, 0,1,-1,  0,-1,-1
      ]);
      return {
        noise2D: (xin: number, yin: number) => {
          let n0 = 0, n1 = 0, n2 = 0;
          const s = (xin + yin) * 0.5 * (Math.sqrt(3.0) - 1.0);
          const i = Math.floor(xin + s);
          const j = Math.floor(yin + s);
          const t = (i + j) * (3.0 - Math.sqrt(3.0)) / 6.0;
          const X0 = i - t;
          const Y0 = j - t;
          const x0 = xin - X0;
          const y0 = yin - Y0;
          let i1 = 0, j1 = 0;
          if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
          const x1 = x0 - i1 + (3.0 - Math.sqrt(3.0)) / 6.0;
          const y1 = y0 - j1 + (3.0 - Math.sqrt(3.0)) / 6.0;
          const x2 = x0 - 1.0 + 2.0 * (3.0 - Math.sqrt(3.0)) / 6.0;
          const y2 = y0 - 1.0 + 2.0 * (3.0 - Math.sqrt(3.0)) / 6.0;
          const ii = i & 255;
          const jj = j & 255;
          let t0 = 0.5 - x0 * x0 - y0 * y0;
          if (t0 >= 0) {
            t0 *= t0;
            const gi0 = permMod12[ii + perm[jj]] * 3;
            n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0);
          }
          let t1 = 0.5 - x1 * x1 - y1 * y1;
          if (t1 >= 0) {
            t1 *= t1;
            const gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
            n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
          }
          let t2 = 0.5 - x2 * x2 - y2 * y2;
          if (t2 >= 0) {
            t2 *= t2;
            const gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
            n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
          }
          return 70.0 * (n0 + n1 + n2);
        }
      };
    })();

    // Mouse movement listener
    const onMouseMove = (e: MouseEvent) => {
      stateRef.current.mouse.targetX = (e.clientX - width / 2) / (width / 2);
      stateRef.current.mouse.targetY = (e.clientY - height / 2) / (height / 2);
    };
    window.addEventListener('mousemove', onMouseMove);

    // Global click listener to also capture direct clicks on the visual canvas core
    const onCanvasClick = (e: MouseEvent) => {
      if (!onCoreClick) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.closest('a') || target.closest('button') || target.closest('input') || target.closest('textarea'))) {
        return;
      }
      const p = stateRef.current.smoothProgress;
      if (p > 0.22) return;

      const lookOffsetX = stateRef.current.mouse.x * 60 - Math.sin(p * Math.PI * 2) * 45;
      const lookOffsetY = stateRef.current.mouse.y * 40 - Math.cos(p * Math.PI) * 20;
      const centerX = width / 2 + lookOffsetX;
      const centerY = height / 2 + lookOffsetY;

      const coreGrowthFactor = 1.0 + (p * 1.6);
      const coreBaseRadius = (Math.min(width, height) * 0.11 + 6) * coreGrowthFactor;

      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      if (dist <= coreBaseRadius * 1.8) {
        onCoreClick();
      }
    };
    window.addEventListener('click', onCanvasClick);

    // Main animation loop
    const render = () => {
      const state = stateRef.current;
      state.animationTime += 0.016;

      // Mouse inertia
      state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.08;
      state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.08;

      // Smooth scroll progress dampening
      state.smoothProgress += (state.targetProgress - state.smoothProgress) * 0.08;
      const p = state.smoothProgress;

      // Camera velocity
      const baseSpeed = 1.4;
      const scrollThrust = p * 12.0;
      const currentSpeed = baseSpeed + scrollThrust;
      state.flightZ += currentSpeed;

      ctx.clearRect(0, 0, width, height);

      // Vanishing point coordinates with mouse parallax
      const lookOffsetX = state.mouse.x * 60 - Math.sin(p * Math.PI * 2) * 45;
      const lookOffsetY = state.mouse.y * 40 - Math.cos(p * Math.PI) * 20;
      const centerX = width / 2 + lookOffsetX;
      const centerY = height / 2 + lookOffsetY;

      // ------------------------------------------------------------
      // A. LONGITUDINAL PERSPECTIVE RAYS
      // ------------------------------------------------------------
      const rayTunnelRadius = Math.max(width, height) * 0.72;
      const rayRoll = state.animationTime * 0.05 + p * 1.8;

      ctx.save();
      ctx.translate(centerX, centerY);
      tunnelRays.forEach((ray, idx) => {
        const dynamicAngle = ray.angle + rayRoll;
        const xOuter = Math.cos(dynamicAngle) * rayTunnelRadius;
        const yOuter = Math.sin(dynamicAngle) * rayTunnelRadius;

        const innerRadius = 24 + p * 30;
        const xInner = Math.cos(dynamicAngle) * innerRadius;
        const yInner = Math.sin(dynamicAngle) * innerRadius;

        const rayGrad = ctx.createLinearGradient(xInner, yInner, xOuter, yOuter);
        rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        rayGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.18)');
        rayGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.04)');
        rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

        ctx.beginPath();
        ctx.moveTo(xInner, yInner);
        ctx.lineTo(xOuter, yOuter);
        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = idx % 2 === 0 ? 0.9 : 0.5;
        if (idx % 4 === 0) {
          ctx.setLineDash([8, 12]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.restore();

      // ------------------------------------------------------------
      // B. CONCENTRIC 3D WARP TUNNEL RINGS
      // ------------------------------------------------------------
      const ringSpacing = TUNNEL_DEPTH / RING_COUNT;
      const ringBaseRadius = Math.min(width, height) * 0.52;

      ctx.save();
      ctx.translate(centerX, centerY);

      for (let i = 0; i < RING_COUNT; i++) {
        const rawZ = ((i * ringSpacing) - (state.flightZ % ringSpacing) + TUNNEL_DEPTH) % TUNNEL_DEPTH;
        if (rawZ <= 10) continue;

        const scale = FOCAL_LENGTH / rawZ;
        const rx = ringBaseRadius * scale;
        const ry = (ringBaseRadius * 0.88) * scale;

        const depthAlpha = Math.sin((rawZ / TUNNEL_DEPTH) * Math.PI);
        const ringAlpha = Math.min(Math.max(depthAlpha, 0), 1) * (0.15 + (1 - rawZ / TUNNEL_DEPTH) * 0.45);

        ctx.beginPath();
        const ringTilt = state.mouse.x * 0.15 + (rawZ * 0.0003);
        ctx.ellipse(0, 0, rx, ry, ringTilt, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha * 0.6})`;
        ctx.lineWidth = Math.max(0.6, scale * 1.5);

        if (i % 3 === 0) {
          ctx.setLineDash([4, 8]);
        } else if (i % 5 === 0) {
          ctx.setLineDash([12, 16]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();

        // Precision tick markers on rings
        if (i % 2 === 0 && rawZ < 1800) {
          ctx.setLineDash([]);
          const nodeCount = 6;
          for (let n = 0; n < nodeCount; n++) {
            const nodeAngle = (n / nodeCount) * Math.PI * 2 + ringTilt;
            const nx = Math.cos(nodeAngle) * rx;
            const ny = Math.sin(nodeAngle) * ry;

            ctx.beginPath();
            ctx.arc(nx, ny, 1.2 * scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${ringAlpha * 0.9})`;
            ctx.fill();
          }
        }
      }
      ctx.setLineDash([]);
      ctx.restore();

      // ------------------------------------------------------------
      // C. 3D WARP STREAKS & FLOATING PARTICLES
      // ------------------------------------------------------------
      ctx.save();
      ctx.translate(centerX, centerY);

      state.particles.forEach((pt) => {
        pt.z -= (pt.speedZ + currentSpeed * 1.8);
        if (pt.z <= 20) {
          pt.z += TUNNEL_DEPTH;
          const angle = Math.random() * Math.PI * 2;
          const radius = 70 + Math.random() * 540;
          pt.x = Math.cos(angle) * radius;
          pt.y = Math.sin(angle) * radius;
        }

        const scale = FOCAL_LENGTH / pt.z;
        const px = pt.x * scale;
        const py = pt.y * scale;

        const streakMultiplier = 1.0 + (p * 5.0);
        const streakLength = Math.max(1, (pt.speedZ + currentSpeed) * scale * 1.4 * streakMultiplier);
        const angleFromCenter = Math.atan2(py, px);
        const pTailX = px - Math.cos(angleFromCenter) * streakLength;
        const pTailY = py - Math.sin(angleFromCenter) * streakLength;

        const alpha = pt.baseAlpha * Math.min(scale * 1.8, 1.0) * (1 - pt.z / TUNNEL_DEPTH);

        ctx.beginPath();
        ctx.moveTo(pTailX, pTailY);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.75})`;
        ctx.lineWidth = Math.max(0.7, pt.size * scale);
        ctx.stroke();

        // Technical labels
        if (pt.char && scale > 0.8 && pt.z < 900) {
          ctx.font = `${Math.floor(8 * scale)}px "Space Mono", monospace`;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
          ctx.fillText(pt.char, px + 4, py - 2);
        }
      });
      ctx.restore();

      // ------------------------------------------------------------
      // D. CENTRAL LUMINOUS SINGULARITY CORE & ACCRETION EVENT HORIZON
      // ------------------------------------------------------------
      ctx.save();
      ctx.translate(centerX, centerY);

      const corePulse = Math.sin(state.animationTime * 2.2) * 6;
      const coreGrowthFactor = 1.0 + (p * 1.6);
      const coreBaseRadius = (Math.min(width, height) * 0.11 + corePulse) * coreGrowthFactor;

      // Ambient Luminous Corona Glow
      const coronaScale = 2.4;
      const coronaGrad = ctx.createRadialGradient(0, 0, coreBaseRadius * 0.2, 0, 0, coreBaseRadius * coronaScale);
      coronaGrad.addColorStop(0, `rgba(255, 255, 255, ${0.45 + p * 0.25})`);
      coronaGrad.addColorStop(0.25, `rgba(220, 235, 255, ${0.22 + p * 0.15})`);
      coronaGrad.addColorStop(0.65, 'rgba(160, 190, 240, 0.05)');
      coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(0, 0, coreBaseRadius * coronaScale, 0, Math.PI * 2);
      ctx.fill();

      // Organic Liquid Perimeter using Simplex Noise
      const numPoints = 64;
      const polygon: { x: number; y: number }[] = [];
      const turbulenceSpeed = 0.5 + p * 0.8;

      for (let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;
        const nx = Math.cos(theta) * 0.9;
        const ny = Math.sin(theta) * 0.9;

        const octave1 = SimplexNoise.noise2D(nx * 1.4 + state.animationTime * turbulenceSpeed, ny * 1.4 + state.animationTime * turbulenceSpeed) * (14 + p * 10);
        const octave2 = SimplexNoise.noise2D(nx * 3.0 - state.animationTime * (turbulenceSpeed * 1.4), ny * 3.0 + state.animationTime * (turbulenceSpeed * 1.2)) * 6;
        const r = coreBaseRadius + octave1 + octave2;
        polygon.push({
          x: Math.cos(theta) * r,
          y: Math.sin(theta) * r
        });
      }

      ctx.beginPath();
      if (polygon.length > 0) {
        ctx.moveTo((polygon[0].x + polygon[numPoints - 1].x) / 2, (polygon[0].y + polygon[numPoints - 1].y) / 2);
        for (let i = 0; i < numPoints; i++) {
          const next = (i + 1) % numPoints;
          const midX = (polygon[i].x + polygon[next].x) / 2;
          const midY = (polygon[i].y + polygon[next].y) / 2;
          ctx.quadraticCurveTo(polygon[i].x, polygon[i].y, midX, midY);
        }
      }
      ctx.closePath();

      // Fluid Liquid Core Shading
      const highlightX = -coreBaseRadius * 0.35 + state.mouse.x * 15;
      const highlightY = -coreBaseRadius * 0.35 + state.mouse.y * 15;
      const coreGrad = ctx.createRadialGradient(
        highlightX, highlightY, coreBaseRadius * 0.05,
        0, 0, coreBaseRadius * 1.2
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.2, '#f0f3f8');
      coreGrad.addColorStop(0.48, '#9ea6b8');
      coreGrad.addColorStop(0.76, '#232630');
      coreGrad.addColorStop(0.96, '#08090d');
      coreGrad.addColorStop(1.0, '#020204');

      ctx.fillStyle = coreGrad;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 40 + p * 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Event Horizon Rim
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + p * 0.3})`;
      ctx.stroke();

      // Internal Aperture / Cosmic Eye — white iris fixed; pupil looks toward cursor inside it
      const eyeWidth = Math.max(14, 26 * (coreBaseRadius / 100));
      const irisX = 0;
      const irisY = 0;
      ctx.beginPath();
      ctx.ellipse(irisX, irisY, eyeWidth, eyeWidth * 0.32, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.shadowBlur = 0;

      const pupilFollow = Math.min(coreBaseRadius * 0.16, 20);
      const maxPupilX = eyeWidth * 0.5;
      const maxPupilY = eyeWidth * 0.32 * 0.42;
      const pupilX =
        irisX + Math.max(-maxPupilX, Math.min(maxPupilX, state.mouse.x * pupilFollow));
      const pupilY =
        irisY + Math.max(-maxPupilY, Math.min(maxPupilY, state.mouse.y * pupilFollow));
      ctx.beginPath();
      ctx.ellipse(pupilX, pupilY, eyeWidth * 0.22, eyeWidth * 0.12, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#040508';
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />
      {/* Deep cosmic vignetting overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] bg-[radial-gradient(circle_at_50%_50%,transparent_10%,rgba(4,4,6,0.45)_60%,#040406_100%)]" />
    </>
  );
};

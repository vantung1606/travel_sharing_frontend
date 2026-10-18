import React, { useEffect, useRef } from 'react';

/**
 * WaterRippleCanvas - Hiệu ứng nước động khi click và di chuột trên Web
 * Tạo các vòng sóng nước lan tỏa (Water Ripples & Shimmering Waves)
 * - Tự động dừng animation khi không có gợn sóng (0% CPU khi rảnh)
 * - pointer-events: none hoàn toàn, không ảnh hưởng thao tác click / scroll
 */
export function WaterRippleCanvas() {
  const canvasRef = useRef(null);
  const ripplesRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const isLoopRunningRef = useRef(false);
  const lastMovePosRef = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Vòng lặp vẽ gợn sóng nước
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.age += 1;
        const progress = r.age / r.maxAge; // 0 -> 1

        if (progress >= 1) {
          ripples.splice(i, 1);
          continue;
        }

        // Tốc độ nở giảm dần (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRadius = r.startRadius + (r.maxRadius - r.startRadius) * easeOut;
        const alpha = Math.sin((1 - progress) * Math.PI * 0.5) * r.initialAlpha;

        // 1. Vẽ quầng sáng phản chiếu trung tâm khi giọt nước vừa chạm (trong 30% đầu)
        if (progress < 0.35 && r.type === 'click') {
          const coreProgress = progress / 0.35;
          const coreRadius = currentRadius * 0.4;
          const coreAlpha = (1 - coreProgress) * 0.35;
          const coreGrad = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, Math.max(1, coreRadius));
          coreGrad.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha})`);
          coreGrad.addColorStop(0.5, `rgba(56, 189, 248, ${coreAlpha * 0.7})`);
          coreGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

          ctx.beginPath();
          ctx.arc(r.x, r.y, coreRadius, 0, Math.PI * 2);
          ctx.fillStyle = coreGrad;
          ctx.fill();
        }

        // 2. Vòng sóng chính (Primary Ripple Ring)
        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, currentRadius, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(0.75, r.lineWidth * (1 - progress * 0.6));
        ctx.strokeStyle = `rgba(2, 132, 199, ${alpha * 0.85})`;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
        ctx.shadowBlur = 4;
        ctx.stroke();

        // 3. Vòng sóng khúc xạ sáng ngoài (Refraction Highlight Shimmer Ring)
        if (currentRadius > 8) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, Math.max(0, currentRadius - 3.5), 0, Math.PI * 2);
          ctx.lineWidth = Math.max(0.5, r.lineWidth * 0.6 * (1 - progress));
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
          ctx.stroke();
        }

        // 4. Vòng sóng dội thứ hai (Secondary Echo Ring cho sự kiện Click)
        if (r.hasEcho && progress > 0.15) {
          const echoProgress = (progress - 0.15) / 0.85;
          const echoEase = 1 - Math.pow(1 - echoProgress, 3);
          const echoRadius = r.maxRadius * 0.75 * echoEase;
          const echoAlpha = (1 - echoProgress) * r.initialAlpha * 0.55;

          ctx.beginPath();
          ctx.arc(r.x, r.y, echoRadius, 0, Math.PI * 2);
          ctx.lineWidth = Math.max(0.5, (1 - echoProgress) * 1.5);
          ctx.strokeStyle = `rgba(14, 165, 233, ${echoAlpha})`;
          ctx.stroke();
        }

        ctx.restore();
      }

      if (ripples.length > 0) {
        animFrameIdRef.current = requestAnimationFrame(render);
      } else {
        isLoopRunningRef.current = false;
        ctx.clearRect(0, 0, width, height);
      }
    };

    const startLoopIfNeeded = () => {
      if (!isLoopRunningRef.current) {
        isLoopRunningRef.current = true;
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    // Bắt sự kiện Click / PointerDown (Giọt nước rơi tạo sóng to)
    const handlePointerDown = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      // Thêm 2 vòng sóng chính với độ trễ nhẹ
      ripplesRef.current.push({
        x,
        y,
        type: 'click',
        startRadius: 2,
        maxRadius: Math.min(130, Math.max(70, window.innerWidth * 0.1)),
        age: 0,
        maxAge: 46, // ~750ms tại 60fps
        initialAlpha: 0.65,
        lineWidth: 2.8,
        hasEcho: true,
      });

      startLoopIfNeeded();
    };

    // Bắt sự kiện PointerMove (Vệt sóng lướt nhẹ theo con trỏ)
    const handlePointerMove = (e) => {
      const now = performance.now();
      const dx = e.clientX - lastMovePosRef.current.x;
      const dy = e.clientY - lastMovePosRef.current.y;
      const dist = Math.hypot(dx, dy);

      // Throttle: chỉ sinh khi di chuyển tối thiểu 22px và cách nhau ít nhất 60ms
      if (dist >= 22 && now - lastMovePosRef.current.time >= 60) {
        lastMovePosRef.current = { x: e.clientX, y: e.clientY, time: now };

        // Giới hạn số lượng trail ripples để giữ 60fps
        if (ripplesRef.current.length < 16) {
          ripplesRef.current.push({
            x: e.clientX,
            y: e.clientY,
            type: 'move',
            startRadius: 1,
            maxRadius: Math.min(42, dist * 1.2),
            age: 0,
            maxAge: 26, // ~430ms
            initialAlpha: 0.35,
            lineWidth: 1.6,
            hasEcho: false,
          });

          startLoopIfNeeded();
        }
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-[999999]"
      aria-hidden="true"
    />
  );
}

export default WaterRippleCanvas;

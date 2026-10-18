import React, { useEffect, useRef } from 'react';

/**
 * WaterRippleCanvas - Mô phỏng hiệu ứng mặt nước chân thực (Realistic Water & Fluid Simulation)
 * - Sóng nước uốn lượn tự nhiên (Organic Wavy Crests), KHÔNG phải vòng tròn hình học cứng nhắc
 * - Giọt nước bắn tóe (Water Splash Droplets) với điểm phản quang 3D khi chạm mặt nước
 * - Vệt rẽ sóng nước (Water Wake & Bubbles) khi di chuột / vuốt ngón tay
 * - Khúc xạ ánh sáng (Specular Highlighting & Depth Gradient) tạo chiều sâu 3D như nước biển Địa Trung Hải
 * - Tự động dừng 0% CPU khi mặt nước phẳng lặng
 */
export function WaterRippleCanvas() {
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const isLoopRunningRef = useRef(false);

  // Lưu trữ các thực thể chất lỏng
  const wavesRef = useRef([]);      // Các đợt sóng nước
  const dropletsRef = useRef([]);   // Các giọt nước bắn tóe
  const wakesRef = useRef([]);      // Các bọt sóng khi di chuyển chuột
  const lastMoveRef = useRef({ x: 0, y: 0, time: 0 });

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

    // ==========================================
    // 1. TẠO CÚ VA CHẠM NƯỚC (WATER SPLASH & IMPACT)
    // ==========================================
    const createWaterImpact = (x, y, intensity = 1) => {
      // 1.1. Sóng chính uốn lượn tự nhiên
      wavesRef.current.push({
        x,
        y,
        radius: 4,
        maxRadius: Math.min(160, Math.max(90, width * 0.12)) * intensity,
        age: 0,
        maxAge: 52, // ~860ms
        alpha: 0.8 * intensity,
        noiseSeed: Math.random() * 100,
        wobbleSpeed: 0.15 + Math.random() * 0.1,
        frequency: 4 + Math.floor(Math.random() * 3),
        lineWidth: 3 * intensity,
      });

      // 1.2. Sóng dội thứ hai (Echo wave) trễ một nhịp
      setTimeout(() => {
        wavesRef.current.push({
          x,
          y,
          radius: 2,
          maxRadius: Math.min(125, Math.max(70, width * 0.09)) * intensity,
          age: 0,
          maxAge: 46,
          alpha: 0.55 * intensity,
          noiseSeed: Math.random() * 100,
          wobbleSpeed: 0.12,
          frequency: 5,
          lineWidth: 2 * intensity,
        });
        startLoop();
      }, 75);

      // 1.3. Giọt nước bắn tóe (Water Splash Droplets)
      const dropletCount = Math.floor(6 + Math.random() * 6 * intensity);
      for (let i = 0; i < dropletCount; i++) {
        const angle = (Math.PI * 2 * i) / dropletCount + (Math.random() - 0.5) * 0.6;
        const speed = 2 + Math.random() * 4.5 * intensity;
        dropletsRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2, // lực hất lên nhẹ
          radius: 2.2 + Math.random() * 2.8,
          alpha: 0.9,
          age: 0,
          maxAge: 32 + Math.floor(Math.random() * 18),
          gravity: 0.18,
        });
      }

      startLoop();
    };

    // ==========================================
    // 2. TẠO VỆT RẼ SÓNG KHI DI CHUỘT (WATER WAKE)
    // ==========================================
    const createWaterWake = (x, y, vx, vy) => {
      const speed = Math.hypot(vx, vy);
      const angle = Math.atan2(vy, vx);

      // Sóng rẽ hai bên hình cánh cung
      wakesRef.current.push({
        x,
        y,
        radius: 3,
        maxRadius: Math.min(48, Math.max(18, speed * 2.4)),
        age: 0,
        maxAge: 28,
        alpha: Math.min(0.55, speed * 0.04 + 0.2),
        angle: angle + Math.PI / 2, // góc vuông với hướng di chuyển
      });

      // Bọt nước li ti (Micro bubble)
      if (Math.random() > 0.4) {
        dropletsRef.current.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: 1.2 + Math.random() * 1.6,
          alpha: 0.6,
          age: 0,
          maxAge: 22,
          gravity: 0.02,
        });
      }

      startLoop();
    };

    // ==========================================
    // 3. VÒNG LẶP VẼ SIMULATION
    // ==========================================
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let hasActiveElements = false;

      // ----------------------------------------
      // A. VẼ CÁC ĐỢT SÓNG NƯỚC UỐN LƯỢN (ORGANIC WAVES)
      // ----------------------------------------
      const waves = wavesRef.current;
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        w.age++;
        const progress = w.age / w.maxAge; // 0 -> 1

        if (progress >= 1) {
          waves.splice(i, 1);
          continue;
        }

        hasActiveElements = true;

        // Tính bán kính theo hàm ease-out dập dềnh của chất lỏng
        const ease = 1 - Math.pow(1 - progress, 2.8);
        const currentRadius = w.radius + (w.maxRadius - w.radius) * ease;
        const currentAlpha = Math.sin((1 - progress) * Math.PI * 0.5) * w.alpha;

        // Điểm lõm trung tâm phản chiếu ánh sáng (Caustic crater)
        if (progress < 0.3) {
          const craterProgress = progress / 0.3;
          const craterRadius = currentRadius * 0.35;
          const craterAlpha = (1 - craterProgress) * 0.45;

          const grad = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, Math.max(1, craterRadius));
          grad.addColorStop(0, `rgba(255, 255, 255, ${craterAlpha * 1.2})`);
          grad.addColorStop(0.4, `rgba(56, 189, 248, ${craterAlpha * 0.8})`);
          grad.addColorStop(0.8, `rgba(2, 132, 199, ${craterAlpha * 0.4})`);
          grad.addColorStop(1, 'rgba(2, 132, 199, 0)');

          ctx.beginPath();
          ctx.arc(w.x, w.y, craterRadius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Vẽ đường sóng uốn lượn hữu cơ bằng 32 điểm sin/cos (Organic Fluid Deformation)
        const pointsCount = 36;
        const points = [];
        const wobbleAmp = (w.maxRadius * 0.075) * (1 - progress * 0.7);

        for (let p = 0; p < pointsCount; p++) {
          const theta = (Math.PI * 2 * p) / pointsCount;
          // Kết hợp 2 sóng hài sin/cos để tạo độ nhấp nhô tự nhiên của mặt nước
          const waveDeform =
            Math.sin(theta * w.frequency + w.age * w.wobbleSpeed + w.noiseSeed) * wobbleAmp +
            Math.cos(theta * (w.frequency - 1) - w.age * 0.1) * (wobbleAmp * 0.45);

          const r = Math.max(2, currentRadius + waveDeform);
          points.push({
            x: w.x + Math.cos(theta) * r,
            y: w.y + Math.sin(theta) * r,
          });
        }

        // Vẽ thân sóng nước xanh ngọc lam (Water Crest Body)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let p = 1; p < pointsCount; p++) {
          const xc = (points[p].x + points[(p + 1) % pointsCount].x) / 2;
          const yc = (points[p].y + points[(p + 1) % pointsCount].y) / 2;
          ctx.quadraticCurveTo(points[p].x, points[p].y, xc, yc);
        }
        ctx.closePath();

        // Đổ bóng nước tạo chiều sâu 3D (Water Depth Shadow)
        ctx.shadowColor = 'rgba(2, 132, 199, 0.65)';
        ctx.shadowBlur = Math.max(2, 8 * (1 - progress));
        ctx.strokeStyle = `rgba(14, 165, 233, ${currentAlpha * 0.85})`;
        ctx.lineWidth = Math.max(1, w.lineWidth * (1 - progress * 0.5));
        ctx.stroke();

        // Gờ sáng khúc xạ ánh sáng trắng trên mặt nước (Specular Light Highlight)
        // Ánh sáng chiếu từ góc trên-trái (-45 độ)
        ctx.shadowBlur = 0;
        ctx.beginPath();
        for (let p = 0; p < pointsCount; p++) {
          const theta = (Math.PI * 2 * p) / pointsCount;
          // Chỉ làm sáng nửa hướng về phía nguồn sáng
          if (theta > Math.PI * 0.8 && theta < Math.PI * 1.9) {
            const pt = points[p];
            if (p === 0 || theta <= Math.PI * 0.85) {
              ctx.moveTo(pt.x, pt.y);
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.95})`;
        ctx.lineWidth = Math.max(0.75, (w.lineWidth * 0.6) * (1 - progress));
        ctx.stroke();
        ctx.restore();
      }

      // ----------------------------------------
      // B. VẼ CÁC VỆT RẼ SÓNG (WAKES & FLOW)
      // ----------------------------------------
      const wakes = wakesRef.current;
      for (let i = wakes.length - 1; i >= 0; i--) {
        const wk = wakes[i];
        wk.age++;
        const prog = wk.age / wk.maxAge;
        if (prog >= 1) {
          wakes.splice(i, 1);
          continue;
        }

        hasActiveElements = true;
        const curR = wk.radius + (wk.maxRadius - wk.radius) * Math.sqrt(prog);
        const curA = (1 - prog) * wk.alpha;

        ctx.save();
        ctx.beginPath();
        // Cánh cung rẽ nước 2 bên
        ctx.arc(wk.x, wk.y, curR, wk.angle - Math.PI * 0.65, wk.angle + Math.PI * 0.65);
        ctx.strokeStyle = `rgba(56, 189, 248, ${curA * 0.7})`;
        ctx.lineWidth = Math.max(0.8, 2.2 * (1 - prog));
        ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
        ctx.shadowBlur = 3;
        ctx.stroke();

        // Viền sáng mỏng
        ctx.beginPath();
        ctx.arc(wk.x, wk.y, Math.max(1, curR - 1.5), wk.angle - Math.PI * 0.5, wk.angle + Math.PI * 0.5);
        ctx.strokeStyle = `rgba(255, 255, 255, ${curA * 0.85})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }

      // ----------------------------------------
      // C. VẼ CÁC GIỌT NƯỚC BẮN TÓE 3D (SPLASH DROPLETS)
      // ----------------------------------------
      const droplets = dropletsRef.current;
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.age++;
        const prog = d.age / d.maxAge;
        if (prog >= 1) {
          droplets.splice(i, 1);
          continue;
        }

        hasActiveElements = true;

        // Cập nhật tọa độ vật lý
        d.x += d.vx;
        d.y += d.vy;
        d.vy += d.gravity; // trọng lực kéo giọt nước rơi xuống
        d.vx *= 0.96; // ma sát không khí

        const curAlpha = (1 - prog) * d.alpha;
        const curR = Math.max(0.5, d.radius * (1 - prog * 0.4));

        ctx.save();
        // Thân giọt nước chất lỏng (Thủy tinh / Xanh ngọc)
        const dropGrad = ctx.createRadialGradient(
          d.x - curR * 0.35,
          d.y - curR * 0.35,
          curR * 0.1,
          d.x,
          d.y,
          curR
        );
        dropGrad.addColorStop(0, `rgba(255, 255, 255, ${curAlpha * 0.95})`);
        dropGrad.addColorStop(0.4, `rgba(56, 189, 248, ${curAlpha * 0.8})`);
        dropGrad.addColorStop(0.8, `rgba(2, 132, 199, ${curAlpha * 0.65})`);
        dropGrad.addColorStop(1, `rgba(3, 105, 161, ${curAlpha * 0.3})`);

        ctx.beginPath();
        ctx.arc(d.x, d.y, curR, 0, Math.PI * 2);
        ctx.fillStyle = dropGrad;
        ctx.shadowColor = 'rgba(2, 132, 199, 0.4)';
        ctx.shadowBlur = 3;
        ctx.fill();

        // Điểm phản quang chói sáng góc 10h (3D Specular Highlight)
        ctx.beginPath();
        ctx.arc(d.x - curR * 0.38, d.y - curR * 0.38, Math.max(0.5, curR * 0.28), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${curAlpha * 0.95})`;
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.restore();
      }

      if (hasActiveElements) {
        animFrameIdRef.current = requestAnimationFrame(render);
      } else {
        isLoopRunningRef.current = false;
        ctx.clearRect(0, 0, width, height);
      }
    };

    const startLoop = () => {
      if (!isLoopRunningRef.current) {
        isLoopRunningRef.current = true;
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    // ==========================================
    // 4. LẮNG NGHE SỰ KIỆN TƯƠNG TÁC
    // ==========================================
    const handlePointerDown = (e) => {
      createWaterImpact(e.clientX, e.clientY, 1);
    };

    const handlePointerMove = (e) => {
      const now = performance.now();
      const dx = e.clientX - lastMoveRef.current.x;
      const dy = e.clientY - lastMoveRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist >= 14 && now - lastMoveRef.current.time >= 40) {
        createWaterWake(e.clientX, e.clientY, dx, dy);
        lastMoveRef.current = { x: e.clientX, y: e.clientY, time: now };
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

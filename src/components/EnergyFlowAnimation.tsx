import { useEffect, useRef, useState } from "react";

export const EnergyFlowAnimation = () => {
  const [fillLevel, setFillLevel] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cycleDuration = 63000; // 60s fill + 3s drain
    const fillDuration = 60000; // 60 seconds to fill
    const startTime = Date.now();

    const updateFill = () => {
      const elapsed = (Date.now() - startTime) % cycleDuration;
      
      if (elapsed < fillDuration) {
        // Slow fill over 60 seconds
        setFillLevel(elapsed / fillDuration);
      } else {
        // Quick drain in remaining 3 seconds
        const drainProgress = (elapsed - fillDuration) / (cycleDuration - fillDuration);
        setFillLevel(1 - drainProgress);
      }
      
      requestAnimationFrame(updateFill);
    };

    const animationId = requestAnimationFrame(updateFill);
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      size: number;
      hue: number;
    }

    const particles: Particle[] = [];
    let animationFrame: number;

    const createParticle = (startX: number, startY: number) => {
      particles.push({
        x: startX,
        y: startY,
        vx: 0.8 + Math.random() * 0.4,
        vy: (Math.random() - 0.5) * 0.2,
        life: 1,
        size: 1.5 + Math.random() * 2,
        hue: 220 + Math.random() * 40,
      });
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Subtle particle creation
      if (particles.length < 20 && Math.random() > 0.85) {
        createParticle(rect.width * 0.25, rect.height / 2 + (Math.random() - 0.5) * 60);
      }

      // Draw subtle energy stream
      ctx.save();
      const streamGradient = ctx.createLinearGradient(
        rect.width * 0.25, 
        rect.height / 2, 
        rect.width * 0.75, 
        rect.height / 2
      );
      streamGradient.addColorStop(0, `hsla(220, 70%, 60%, ${0.03 * fillLevel})`);
      streamGradient.addColorStop(0.5, `hsla(240, 70%, 60%, ${0.08 * fillLevel})`);
      streamGradient.addColorStop(1, `hsla(260, 70%, 60%, ${0.05 * fillLevel})`);
      
      ctx.fillStyle = streamGradient;
      ctx.fillRect(rect.width * 0.25, rect.height / 2 - 8, rect.width * 0.5, 16);
      ctx.restore();

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.008;

        if (particle.life <= 0 || particle.x > rect.width * 0.75) {
          particles.splice(index, 1);
          return;
        }

        const alpha = particle.life * 0.6;
        const size = particle.size * particle.life;
        
        ctx.save();
        ctx.fillStyle = `hsla(${particle.hue}, 90%, 70%, ${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${particle.hue}, 90%, 70%, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateSize);
      cancelAnimationFrame(animationFrame);
    };
  }, [fillLevel]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Canvas for subtle particle animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-70"
        style={{ mixBlendMode: "screen" }}
      />
      
      {/* Left card - draining energy overlay */}
      <div className="absolute left-0 top-0 w-[48%] h-full">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-red-500/10 transition-all duration-300"
          style={{ 
            clipPath: `inset(${fillLevel * 100}% 0 0 0)`,
            opacity: 0.3 * (1 - fillLevel)
          }}
        />
      </div>

      {/* Right card - filling energy overlay */}
      <div className="absolute right-0 top-0 w-[48%] h-full">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-primary/8 transition-all duration-300"
          style={{ 
            clipPath: `inset(${(1 - fillLevel) * 100}% 0 0 0)`,
            opacity: 0.4
          }}
        />
        {/* Shimmer at fill line */}
        <div 
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent blur-sm"
          style={{ 
            top: `${(1 - fillLevel) * 100}%`,
            opacity: fillLevel > 0.05 ? 1 : 0
          }}
        />
      </div>
    </div>
  );
};

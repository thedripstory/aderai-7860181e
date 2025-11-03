import { useEffect, useRef } from "react";

export const EnergyFlowAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    // Particle system
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      hue: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 60;
    
    // Energy wave parameters
    let waveOffset = 0;
    let pulsePhase = 0;

    const createParticle = () => {
      const rect = canvas.getBoundingClientRect();
      const startX = 0;
      const startY = rect.height / 2 + (Math.random() - 0.5) * 80;
      
      particles.push({
        x: startX,
        y: startY,
        vx: 1.5 + Math.random() * 1,
        vy: (Math.random() - 0.5) * 0.3,
        life: 1,
        maxLife: 1,
        size: 2 + Math.random() * 3,
        hue: 220 + Math.random() * 60, // Blue to purple range
      });
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Create new particles
      if (particles.length < maxParticles && Math.random() > 0.7) {
        createParticle();
      }

      // Update wave offset
      waveOffset += 0.02;
      pulsePhase += 0.03;

      // Draw energy wave background
      ctx.save();
      const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
      gradient.addColorStop(0, `hsla(220, 80%, 60%, ${0.1 + Math.sin(pulsePhase) * 0.05})`);
      gradient.addColorStop(0.5, `hsla(260, 80%, 60%, ${0.15 + Math.sin(pulsePhase + 1) * 0.05})`);
      gradient.addColorStop(1, `hsla(280, 80%, 60%, ${0.1 + Math.sin(pulsePhase + 2) * 0.05})`);
      
      ctx.beginPath();
      ctx.moveTo(0, rect.height / 2);
      
      for (let x = 0; x < rect.width; x += 5) {
        const y = rect.height / 2 + Math.sin(x * 0.01 + waveOffset) * 20 * (1 + Math.sin(pulsePhase) * 0.3);
        ctx.lineTo(x, y);
      }
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Draw energy beam
      ctx.save();
      const beamGradient = ctx.createLinearGradient(0, rect.height / 2, rect.width, rect.height / 2);
      beamGradient.addColorStop(0, "hsla(220, 100%, 70%, 0)");
      beamGradient.addColorStop(0.3, `hsla(240, 100%, 70%, ${0.2 + Math.sin(pulsePhase) * 0.1})`);
      beamGradient.addColorStop(0.7, `hsla(260, 100%, 70%, ${0.2 + Math.sin(pulsePhase + 1) * 0.1})`);
      beamGradient.addColorStop(1, "hsla(280, 100%, 70%, 0)");
      
      ctx.fillStyle = beamGradient;
      ctx.fillRect(0, rect.height / 2 - 15, rect.width, 30);
      ctx.restore();

      // Update and draw particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy + Math.sin(particle.x * 0.02 + waveOffset) * 0.5;
        particle.life -= 0.005;

        // Remove dead particles
        if (particle.life <= 0 || particle.x > rect.width) {
          particles.splice(index, 1);
          return;
        }

        // Draw particle with glow
        const alpha = particle.life;
        const size = particle.size * particle.life;
        
        // Outer glow
        ctx.save();
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * 4
        );
        glowGradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, ${alpha * 0.4})`);
        glowGradient.addColorStop(1, "hsla(0, 0%, 0%, 0)");
        ctx.fillStyle = glowGradient;
        ctx.fillRect(
          particle.x - size * 4,
          particle.y - size * 4,
          size * 8,
          size * 8
        );
        ctx.restore();

        // Core particle
        ctx.save();
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 80%, ${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(${particle.hue}, 100%, 70%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Trail effect
        ctx.save();
        ctx.strokeStyle = `hsla(${particle.hue}, 100%, 70%, ${alpha * 0.3})`;
        ctx.lineWidth = size * 0.5;
        ctx.beginPath();
        ctx.moveTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5);
        ctx.lineTo(particle.x, particle.y);
        ctx.stroke();
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Canvas for particle animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: "screen" }}
      />
      
      {/* Central energy core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-16 h-16">
          {/* Pulsing rings */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"
              style={{
                animationDuration: "2s",
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
          
          {/* Core orb */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary animate-pulse shadow-[0_0_30px_rgba(139,92,246,0.6)]" />
          
          {/* Rotating ring */}
          <div className="absolute -inset-4 rounded-full border-2 border-dashed border-primary/40 animate-spin" style={{ animationDuration: "8s" }} />
        </div>
      </div>

      {/* Flowing data streams */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-[slide-in-right_3s_linear_infinite]"
            style={{
              top: `${30 + i * 10}%`,
              width: "100%",
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

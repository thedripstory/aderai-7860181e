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
    const maxParticles = 25;
    
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
      if (particles.length < maxParticles && Math.random() > 0.85) {
        createParticle();
      }

      // Update wave offset
      waveOffset += 0.02;
      pulsePhase += 0.03;

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
        
        // Outer glow (more subtle)
        ctx.save();
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * 3
        );
        glowGradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, ${alpha * 0.2})`);
        glowGradient.addColorStop(1, "hsla(0, 0%, 0%, 0)");
        ctx.fillStyle = glowGradient;
        ctx.fillRect(
          particle.x - size * 3,
          particle.y - size * 3,
          size * 6,
          size * 6
        );
        ctx.restore();

        // Core particle
        ctx.save();
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 70%, ${alpha * 0.6})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `hsla(${particle.hue}, 100%, 70%, ${alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Trail effect (more subtle)
        ctx.save();
        ctx.strokeStyle = `hsla(${particle.hue}, 100%, 70%, ${alpha * 0.15})`;
        ctx.lineWidth = size * 0.3;
        ctx.beginPath();
        ctx.moveTo(particle.x - particle.vx * 3, particle.y - particle.vy * 3);
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
      
      {/* Central energy core - simplified */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-10 h-10">
          {/* Pulsing rings */}
          {[0, 1].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-primary/20 animate-ping"
              style={{
                animationDuration: "3s",
                animationDelay: `${i * 1.5}s`,
              }}
            />
          ))}
          
          {/* Core orb */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 animate-pulse shadow-[0_0_20px_rgba(139,92,246,0.3)]" />
        </div>
      </div>
    </div>
  );
};

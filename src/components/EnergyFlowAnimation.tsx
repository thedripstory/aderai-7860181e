import { useEffect, useRef, useState } from "react";

export const EnergyFlowAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fillLevel, setFillLevel] = useState(0);

  useEffect(() => {
    // Animate fill level (0 to 1 and repeat)
    const fillInterval = setInterval(() => {
      setFillLevel((prev) => (prev >= 1 ? 0 : prev + 0.005));
    }, 50);

    return () => clearInterval(fillInterval);
  }, []);

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
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Canvas for particle animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: "screen" }}
      />
      
      {/* Left Card - Draining Effect */}
      <div className="absolute left-0 top-0 bottom-0 right-1/2 overflow-hidden">
        {/* Energy level draining */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-primary/20 via-accent/15 to-transparent transition-all duration-1000 ease-linear"
          style={{
            clipPath: `inset(${fillLevel * 100}% 0 0 0)`,
          }}
        />
        
        {/* Particle escape effect */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/60 animate-ping"
              style={{
                top: `${20 + i * 10}%`,
                right: "5%",
                animationDuration: `${1.5 + i * 0.2}s`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Right Card - Filling Effect */}
      <div className="absolute right-0 top-0 bottom-0 left-1/2 overflow-hidden">
        {/* Energy level filling */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-primary/30 via-accent/20 to-primary/10 transition-all duration-1000 ease-linear shadow-[inset_0_0_30px_rgba(139,92,246,0.3)]"
          style={{
            clipPath: `inset(${(1 - fillLevel) * 100}% 0 0 0)`,
          }}
        >
          {/* Shimmer effect on fill */}
          <div 
            className="absolute inset-x-0 h-8 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm"
            style={{
              top: `${(1 - fillLevel) * 100}%`,
              transform: "translateY(-50%)",
            }}
          />
        </div>

        {/* Incoming particles effect */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-accent/70 shadow-[0_0_8px_rgba(251,146,60,0.8)]"
              style={{
                top: `${15 + i * 8}%`,
                left: "10%",
                animation: `ping 2s cubic-bezier(0, 0, 0.2, 1) infinite`,
                animationDelay: `${i * 0.25}s`,
              }}
            />
          ))}
        </div>

        {/* Energy ripples */}
        <div className="absolute inset-0">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-pulse"
              style={{
                bottom: `${fillLevel * 100 - 10 + i * 15}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: "2s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Central energy transfer beam */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-full">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
        
        {/* Energy orb at center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-12 h-12">
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
          </div>
        </div>
      </div>

      {/* Flowing energy streams */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-0.5 bg-gradient-to-r from-red-500/30 via-primary/50 to-accent/50 animate-[slide-in-right_2.5s_ease-in-out_infinite]"
            style={{
              top: `${25 + i * 8}%`,
              width: "100%",
              animationDelay: `${i * 0.3}s`,
              boxShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
            }}
          />
        ))}
      </div>

      {/* Fill level indicator */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-primary/70">
        {Math.round(fillLevel * 100)}%
      </div>
    </div>
  );
};

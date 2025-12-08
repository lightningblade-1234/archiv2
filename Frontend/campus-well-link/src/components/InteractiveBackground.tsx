import React, { useEffect, useRef } from 'react';

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    // Check if dark mode is active
    const isDarkMode = () => document.documentElement.classList.contains('dark');

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background based on theme
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      if (isDarkMode()) {
        // Dark mode gradients
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
        gradient.addColorStop(0.3, 'rgba(147, 51, 234, 0.1)');
        gradient.addColorStop(0.6, 'rgba(34, 197, 94, 0.08)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0.12)');
      } else {
        // Light mode gradients
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.05)');
        gradient.addColorStop(0.5, 'rgba(147, 197, 253, 0.05)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle with theme-aware colors
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        if (isDarkMode()) {
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.7})`;
        } else {
          ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
        }
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};
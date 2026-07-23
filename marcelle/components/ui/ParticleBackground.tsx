"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing particles if any (for hot reload)
    container.innerHTML = "";

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 25 : 60; // Reduced for mobile performance
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      
      // Depth simulation (0 to 1)
      const depth = Math.random();
      const size = depth * 3 + 2; // 2px to 5px
      
      // Blur based on depth (further away = more blurred)
      const blurAmount = (1 - depth) * 2;
      
      particle.className = "absolute rounded-full bg-gold pointer-events-none mix-blend-screen";
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.filter = `blur(${blurAmount}px)`;
      particle.style.boxShadow = `0 0 ${size * 2}px ${size}px rgba(212, 175, 55, ${depth * 0.3})`; // Glow
      
      container.appendChild(particle);
      particles.push(particle);

      // Initial Position
      gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        opacity: Math.random() * 0.5 + 0.2,
        scale: depth,
      });

      animateParticle(particle, depth);
    }

    function animateParticle(el: HTMLElement, depth: number) {
      // Slower movement for background particles (lower depth)
      const durationY = (Math.random() * 30 + 20) / (depth + 0.5);
      const durationX = (Math.random() * 20 + 10);
      
      // Float Upwards continuously
      gsap.to(el, {
        y: "-=100", // Move up 100px relative
        duration: durationY,
        ease: "none",
        repeat: -1,
        modifiers: {
          y: (y) => {
            const val = parseFloat(y as string);
            // Wrap around screen
            return val < -50 ? `${window.innerHeight + 50}px` : `${val}px`;
          }
        }
      });

      // Horizontal Drift
      gsap.to(el, {
        x: `+=${Math.random() * 100 - 50}`,
        duration: durationX,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
      
      // Pulse Opacity
      gsap.to(el, {
        opacity: Math.random() * 0.4 + 0.3,
        scale: depth * (Math.random() * 0.5 + 0.8),
        duration: Math.random() * 3 + 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden z-0 pointer-events-none" />;
}

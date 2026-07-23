"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import CrownIcon from "../ui/CrownIcon";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const containerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            end: "bottom 95%",
            scrub: 1,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen text-pearl py-24 overflow-hidden flex items-center justify-center bg-royal-dark"
    >
      {/* Immersive Castle Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/castle_background.png"
          alt="Magical Castle Background"
          fill
          sizes="100vw"
          className="object-cover object-center pointer-events-none"
          priority
        />
        {/* Subtle overall dark overlay */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        {/* Deep top and bottom gradients to fade seamlessly to solid bg-royal-dark */}
        <div className="absolute top-0 left-0 w-full h-[25vh] bg-gradient-to-b from-royal-dark via-royal-dark/95 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[25vh] bg-gradient-to-t from-royal-dark via-royal-dark/95 to-transparent pointer-events-none" />
      </div>


      <div className="container mx-auto px-4 relative z-10 flex justify-center items-center">
        {/* Glassmorphic Royal Card */}
        <div
          ref={cardRef}
          className="relative w-full max-w-4xl p-8 md:p-16 rounded-2xl bg-royal-dark/75 backdrop-blur-md border-4 border-double border-gold/70 shadow-[0_0_50px_rgba(0,0,0,0.8),_inset_0_0_30px_rgba(212,175,55,0.15)] overflow-hidden"
        >
          {/* Inner margin border */}
          <div className="absolute inset-3 border border-gold/25 rounded-lg pointer-events-none" />

          {/* Corner Ornaments */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gold/60 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gold/60 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gold/60 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gold/60 rounded-br-lg pointer-events-none" />

          {/* Glowing Backlight */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gold/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Card Content */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            
            {/* Top Crown Emblem */}
            <div className="drop-shadow-[0_0_15px_rgba(212,175,55,0.8)] mb-2">
              <CrownIcon size={56} />
            </div>

            {/* Subtitle */}
            <span className="text-gold/80 font-cinzel text-[10px] md:text-xs tracking-[0.4em] uppercase block">
              O Conto de Fadas Real
            </span>

            {/* Main Title */}
            <h2 className="text-4xl md:text-6xl font-royal text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-gold to-gold-dark drop-shadow-md leading-[1.3] py-2">
              A Princesa
            </h2>

            {/* Decorative Divider */}
            <div className="flex items-center gap-4 w-full justify-center opacity-75 my-2">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-gold" />
              <div className="w-1.5 h-1.5 bg-gold rounded-full rotate-45" />
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-gold" />
            </div>

            {/* Story Text */}
            <div className="max-w-2xl space-y-6 text-pearl/90 font-serif leading-relaxed text-center">
              <p className="text-lg md:text-xl font-light">
                Em um reino onde a magia e a beleza se encontram, celebramos o desabrochar de uma jovem princesa.
                A adorável <span className="font-bold text-gold-light">Marcelle</span>, com sua graça e encanto singular, convida a todos os nobres convidados para testemunharem este momento único e histórico em sua vida.
              </p>
              <p className="text-lg md:text-xl font-light">
                Cada detalhe deste grande baile foi preparado com o amor, o brilho e a nobreza que esta grandiosa ocasião merece.
                Preparem seus corações para adentrar um conto de fadas real e inesquecível.
              </p>
            </div>

            {/* Signature style */}
            <div className="pt-8">
              <span className="font-royal text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-gold to-gold-dark leading-none">
                Marcelle Dias
              </span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}



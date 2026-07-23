"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, Clock, Calendar } from "lucide-react";
import OrnamentalHeading from "../ui/OrnamentalHeading";

gsap.registerPlugin(ScrollTrigger);

import RoyalCard from "../ui/RoyalCard";

export default function Event() {
  const containerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "bottom 80%",
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
      className="relative min-h-screen bg-black text-pearl flex items-center justify-center py-20 overflow-hidden"
    >
      {/* Top Gradient for Smooth Transition */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-royal-dark via-royal-dark/80 to-transparent z-[5] pointer-events-none" />

      {/* Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-royal-dark via-transparent to-royal-dark pointer-events-none" />

      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gold/20 rounded-full blur-[60px] animate-pulse-glow" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-ruby/20 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <div ref={cardRef} className="relative z-10 w-full max-w-5xl px-6">
        <div className="bg-black/40 backdrop-blur-xl border border-gold/30 rounded-[3rem] p-8 md:p-16 shadow-[0_0_60px_rgba(0,0,0,0.8)] text-center relative overflow-hidden group">

          {/* Animated Border */}
          <div className="absolute inset-0 rounded-[3rem] border border-gold/20 pointer-events-none" />
          <div className="absolute -inset-[1px] rounded-[3rem] bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-50 blur-sm animate-shimmer pointer-events-none" />

          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-gold/0 via-gold/5 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

          <OrnamentalHeading title="O Grande Baile" subtitle="Uma Noite Inesquecível" className="mb-12" />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {/* Date */}
            <RoyalCard>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light p-[2px] shadow-[0_0_25px_rgba(212,175,55,0.5)] mb-6 mx-auto group-hover:scale-110 transition-transform duration-500">
                <div className="w-full h-full rounded-full bg-royal-dark flex items-center justify-center">
                  <Calendar className="text-gold w-10 h-10 drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                </div>
              </div>
              <h3 className="text-2xl font-cinzel font-bold text-royal-dark mb-2">Sábado</h3>
              <p className="text-ruby-dark text-3xl font-bold drop-shadow-sm">22 AGO</p>
              <p className="text-royal-light text-sm tracking-widest mt-2 uppercase font-cinzel">2026</p>
            </RoyalCard>

            {/* Time */}
            <RoyalCard delay={0.2}>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light p-[2px] shadow-[0_0_25px_rgba(212,175,55,0.5)] mb-6 mx-auto group-hover:scale-110 transition-transform duration-500">
                <div className="w-full h-full rounded-full bg-royal-dark flex items-center justify-center">
                  <Clock className="text-gold w-10 h-10 drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                </div>
              </div>
              <h3 className="text-2xl font-cinzel font-bold text-royal-dark mb-2">Horário</h3>
              <p className="text-ruby-dark text-3xl font-bold drop-shadow-sm">18:00</p>
              <p className="text-royal-light text-sm tracking-widest mt-2 uppercase font-cinzel">Recepção Real</p>
            </RoyalCard>

            {/* Location */}
            <RoyalCard delay={0.4}>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light p-[2px] shadow-[0_0_25px_rgba(212,175,55,0.5)] mb-6 mx-auto group-hover:scale-110 transition-transform duration-500">
                <div className="w-full h-full rounded-full bg-royal-dark flex items-center justify-center">
                  <MapPin className="text-gold w-10 h-10 drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                </div>
              </div>
              <h3 className="text-2xl font-cinzel font-bold text-royal-dark mb-2">Local</h3>
              <p className="text-ruby-dark text-xl font-bold drop-shadow-sm">Espaço de Festas</p>
              <p className="text-royal-light text-sm mt-2">Rua Marques de Santo Amaro</p>
              <a
                href="https://maps.app.goo.gl/dUrR3Suj3yuYxt3i9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/50 bg-royal-dark text-xs text-gold hover:bg-gold hover:text-royal-dark transition-all duration-300 uppercase tracking-widest font-cinzel mt-4 shadow-sm"
              >
                Ver no Google Maps
              </a>
            </RoyalCard>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gold rotate-45" />
            <p className="font-cinzel italic text-gray-300 text-lg">
              "Uma página se vira, um novo capítulo começa, e pela primeira vez, o futuro parece tão mágico quanto os sonhos que me trouxeram até aqui."
            </p>
            <p className="font-cinzel italic text-gold text-lg mt-4">Venha fazer parte da minha história!</p>
          </div>
        </div>
      </div>
    </section>
  );
}

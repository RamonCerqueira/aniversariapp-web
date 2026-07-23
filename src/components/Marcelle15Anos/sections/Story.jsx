import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import OrnamentalHeading from "../ui/OrnamentalHeading";
import RoyalCard from "../ui/RoyalCard";

gsap.registerPlugin(ScrollTrigger);

const milestones = [
  { year: "2011", title: "O Início", desc: "Nasce uma pequena princesa, trazendo luz ao reino.", image: "/anoes/soneca.webp" },
  { year: "2013", title: "Primeiros Passos", desc: "Crescendo com alegria e descobrindo o mundo.", image: "/anoes/dengoso.webp" },
  { year: "2016", title: "As Descobertas", desc: "Cada dia uma nova aventura e aprendizado.", image: "/anoes/feliz.webp" },
  { year: "2019", title: "A Família", desc: "Laços de amor que se fortalecem a cada dia.", image: "/anoes/Dunga.webp" },
  { year: "2021", title: "Os Sonhos", desc: "Imaginando um futuro brilhante e mágico.", image: "/anoes/zangado.webp" },
  { year: "2024", title: "A Doçura", desc: "A beleza de viver cada momento com intensidade.", image: "/anoes/atchim.webp" },
  { year: "2026", title: "O Desabrochar", desc: "Hoje celebramos a jovem mulher que ela se tornou.", image: "/anoes/mestre.webp" },
];

export default function Story() {
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate line
      gsap.fromTo(
        lineRef.current,
        { height: 0 },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
            end: "bottom 80%",
            scrub: 1,
          },
        }
      );

      // Animate items
      itemsRef.current.forEach((item, index) => {
        if (!item) return;
        
        gsap.fromTo(
          item,
          { opacity: 0, x: index % 2 === 0 ? -50 : 50, scale: 0.9 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              end: "bottom 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="story"
      className="relative min-h-screen bg-royal-dark text-pearl py-20 overflow-hidden"
    >
      {/* Top Gradient for Smooth Transition */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-royal-dark via-royal-dark/80 to-transparent z-[5] pointer-events-none" />
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/royal.png')] opacity-10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-royal-dark via-transparent to-royal-dark pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <OrnamentalHeading title="História Encantada" subtitle="A Jornada da Princesa" />

        <div className="relative mt-20">
          {/* Timeline Center Line - Golden Vine */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-[4px] top-0 bottom-0">
            <div className="absolute inset-0 bg-royal-light opacity-30" />
            <div ref={lineRef} className="w-full bg-gradient-to-b from-gold via-gold-light to-gold shadow-[0_0_15px_#FFD700] origin-top rounded-full" />
          </div>

          <div className="space-y-16 md:space-y-24 relative z-10">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                ref={(el) => { itemsRef.current[index] = el; }}
                className={`flex items-center justify-between w-full ${
                  index % 2 === 0 ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className="w-5/12 hidden md:block" />
                
                {/* Central Medallion */}
                <div className="z-20 flex items-center justify-center w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-royal-dark via-black to-royal-dark border-4 border-double border-gold/80 rounded-full shadow-[0_0_30px_rgba(212,175,55,0.6)] relative group overflow-hidden transition-all duration-500 hover:scale-110 hover:shadow-[0_0_45px_rgba(212,175,55,0.9)]">
                  {/* Gold Radial Glow */}
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.35)_0%,_transparent_70%)]" />
                  
                  {/* Dwarf Photo Image */}
                  <img 
                    src={milestone.image} 
                    alt={milestone.title}
                    className="w-full h-full object-contain p-2 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 relative z-10"
                  />
                  
                  {/* Cameo Glass Reflection Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-500 z-20 pointer-events-none" />
                </div>
                
                <div className="w-5/12">
                  <RoyalCard>
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-cinzel font-bold text-gold-dark mb-2 drop-shadow-sm">{milestone.year}</span>
                      <h3 className="text-xl font-cinzel font-bold text-ruby-dark mb-2">{milestone.title}</h3>
                      <p className="text-royal-dark font-serif italic text-lg leading-relaxed">{milestone.desc}</p>
                    </div>
                  </RoyalCard>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import ParticleBackground from "../ui/ParticleBackground";
import { ChevronDown, Calendar, Clock, Apple } from "lucide-react";
import CrownIcon from "../ui/CrownIcon";

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };
    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 px-6 sm:px-10 py-5 border-2 border-gold/40 rounded-[24px] bg-black/60 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.6),inset_0_0_20px_rgba(212,175,55,0.1)]">
      {[
        { label: "Dias", value: timeLeft.days },
        { label: "Horas", value: timeLeft.hours },
        { label: "Minutos", value: timeLeft.minutes },
        { label: "Segundos", value: timeLeft.seconds },
      ].map((item, index) => (
        <div key={item.label} className="flex items-center gap-4 sm:gap-6 md:gap-8">
          <div className="flex flex-col items-center min-w-[50px] sm:min-w-[65px] md:min-w-[75px]">
            <span className="text-2xl sm:text-4xl md:text-5xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-gold to-gold-dark tracking-wide leading-none">
              {String(item.value).padStart(2, '0')}
            </span>
            <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.25em] text-gold/60 mt-2.5 leading-none">{item.label}</span>
          </div>
          {index < 3 && (
            <div className="flex items-center justify-center">
              <Apple size={12} className="text-apple fill-apple opacity-80 drop-shadow-[0_0_8px_rgba(227,0,34,0.85)] animate-pulse" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen w-full overflow-hidden bg-royal-dark flex flex-col items-center justify-center pt-24 md:pt-0 px-4"
    >
      {/* Parallax Background Image */}
      <div ref={bgRef} className="absolute inset-0 z-0 scale-110 w-full h-full">
        <img
          src="/hero.png"
          alt="Royal Fairytale Hero"
          className="w-full h-full object-cover object-center pointer-events-none"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1600";
          }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />
      </div>

      {/* Vignette Gradients */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-royal-dark via-royal-dark/30 to-transparent z-[1] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-royal-dark via-royal-dark/95 to-transparent z-[1] pointer-events-none" />

      {/* Floating Particles */}
      <div className="absolute inset-0 z-[2]">
        <ParticleBackground />
      </div>

      {/* Content Container - Fully Centered and Premium */}
      <div className="container mx-auto px-4 relative z-10 w-full min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-8 md:space-y-10 pt-16 md:pt-24">
          
          {/* Top Crown Emblem & Spaced Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center space-y-4"
          >
            <span className="text-gold/90 font-cinzel text-xs md:text-sm lg:text-base tracking-[0.5em] uppercase block">
              O Conto de Fadas Real
            </span>
            <div className="w-28 h-[1.5px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </motion.div>

          {/* Princess Name - No Line Break */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="w-full overflow-hidden"
          >
            <div className="drop-shadow-[0_0_25px_rgba(255,215,0,0.85)]">
              <CrownIcon size={72} />
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[7rem] xl:text-[8rem] font-royal text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-gold to-gold-dark leading-none py-4 drop-shadow-[0_4px_15px_rgba(0,0,0,0.7)] whitespace-nowrap">
              Marcelle Dias
            </h1>
          </motion.div>

          {/* Subtitle 15 Anos - Cursive Medieval Style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-6 justify-center w-full"
          >
            <div className="hidden sm:block h-[1px] w-20 bg-gradient-to-r from-transparent to-gold/60" />
            <p className="font-pinyon text-4xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-gold to-gold-dark drop-shadow-md py-1 px-4 italic leading-none">
              15 Anos
            </p>
            <div className="hidden sm:block h-[1px] w-20 bg-gradient-to-l from-transparent to-gold/60" />
          </motion.div>

          {/* Event Date & Time - Styled with calendar, clock, and magic apple */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex flex-col items-center space-y-6 w-full"
          >
            <div className="flex flex-wrap items-center justify-center gap-3 text-pearl/90 font-cinzel text-xs sm:text-sm md:text-base tracking-widest bg-royal-dark/50 backdrop-blur-md border border-gold/30 px-6 py-3.5 rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gold-light" />
                <span>22 AGOSTO 2026</span>
              </div>
              <div className="flex items-center justify-center px-1">
                <Apple size={14} className="text-apple fill-apple drop-shadow-[0_0_8px_rgba(227,0,34,0.9)] animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-gold-light" />
                <span>18:00H</span>
              </div>
            </div>

            {/* Countdown Box */}
            <Countdown targetDate="2026-08-22T19:00:00" />
          </motion.div>

          {/* RSVP Button - Princess Premium Styled */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="pt-6"
          >
            <a href="#rsvp">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative px-16 py-5 rounded-xl border-2 border-gold bg-gradient-to-b from-royal-light/40 to-royal-dark/80 hover:from-royal-light/60 hover:to-royal-dark/95 text-gold-light font-cinzel font-bold text-sm md:text-base tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.6),inset_0_0_15px_rgba(212,175,55,0.2)] overflow-visible group"
              >
                {/* Magic Sparkle Glow Behind Button */}
                <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 blur-md rounded-xl transition-opacity duration-300 pointer-events-none" />

                {/* Top flourish SVG */}
                <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 text-gold opacity-95 select-none scale-100 pointer-events-none transition-transform duration-300 group-hover:scale-110">
                  <svg width="48" height="15" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 10C17 10 16 2 12 2C8 2 7 8 2 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M20 10C23 10 24 2 28 2C32 2 33 8 38 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <circle cx="20" cy="10" r="1.5" fill="currentColor"/>
                  </svg>
                </div>

                Confirmar Presença

                {/* Bottom flourish SVG */}
                <div className="absolute -bottom-4.5 left-1/2 -translate-x-1/2 text-gold opacity-95 select-none scale-100 pointer-events-none rotate-180 transition-transform duration-300 group-hover:scale-110">
                  <svg width="48" height="15" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 10C17 10 16 2 12 2C8 2 7 8 2 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M20 10C23 10 24 2 28 2C32 2 33 8 38 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <circle cx="20" cy="10" r="1.5" fill="currentColor"/>
                  </svg>
                </div>
              </motion.button>
            </a>
          </motion.div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 animate-bounce text-gold/30 z-20"
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import OrnamentalHeading from "../ui/OrnamentalHeading";
import RoyalCard from "../ui/RoyalCard";
import { Shirt, Sparkles, ShieldAlert } from "lucide-react";

export default function DressCode() {
  return (
    <section className="relative py-24 bg-royal-dark overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/royal.png')] opacity-10 mix-blend-overlay pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <OrnamentalHeading title="Traje Real" subtitle="Código de Vestimenta" />

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto mt-12">
          <RoyalCard>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light p-[2px] shadow-[0_0_20px_rgba(212,175,55,0.5)] mb-6 mx-auto">
              <div className="w-full h-full rounded-full bg-royal-dark flex items-center justify-center">
                <Shirt className="text-gold w-8 h-8 drop-shadow-md" />
              </div>
            </div>
            <h3 className="text-2xl font-cinzel text-royal-dark mb-4 font-bold">Cavalheiros</h3>
            <p className="text-royal-light font-serif italic text-lg">
              Traje Social Completo ou Esporte Fino.
            </p>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              Terno, camisa social e sapato. A gravata é opcional mas bem-vinda para compor a nobreza da noite.
            </p>
          </RoyalCard>

          <RoyalCard delay={0.2}>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light p-[2px] shadow-[0_0_20px_rgba(212,175,55,0.5)] mb-6 mx-auto">
              <div className="w-full h-full rounded-full bg-royal-dark flex items-center justify-center">
                <Sparkles className="text-gold w-8 h-8 drop-shadow-md" />
              </div>
            </div>
            <h3 className="text-2xl font-cinzel text-royal-dark mb-4 font-bold">Damas</h3>
            <p className="text-royal-light font-serif italic text-lg">
              Traje Passeio Completo ou Gala.
            </p>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              Vestidos curtos sofisticados ou longos. Brilhos e elegância são a marca registrada da celebração.
            </p>
          </RoyalCard>
        </div>

        {/* Decreto Real de Etiqueta */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center max-w-2xl mx-auto"
        >
          <div className="relative p-8 border-2 border-double border-gold/60 rounded-3xl bg-gradient-to-b from-royal-dark/90 via-black/80 to-royal-dark/95 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.2)] overflow-hidden group">
            {/* Corner Accents */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-gold/70" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-gold/70" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-gold/70" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-gold/70" />

            <div className="flex flex-col items-center gap-3">
              <ShieldAlert size={32} className="text-ruby drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
              <h4 className="font-cinzel text-gold font-bold tracking-[0.2em] text-lg uppercase">
                Decreto Real de Etiqueta
              </h4>
              <p className="text-pearl/90 font-serif italic text-base md:text-lg leading-relaxed">
                Para manter a harmonia visual da corte e o brilho exclusivo da aniversariante:
              </p>
              <div className="mt-2 py-2 px-6 rounded-full bg-ruby/20 border border-ruby/40 text-gold-light font-cinzel text-xs md:text-sm tracking-widest uppercase shadow-inner">
                Pedimos a gentileza de evitar vestidos nas cores: <span className="text-ruby font-bold">Azul, Amarelo, Vermelho e Verde</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

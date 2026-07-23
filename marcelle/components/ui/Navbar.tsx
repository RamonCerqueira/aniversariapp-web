"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import MagicButton from "./MagicButton";

import CrownIcon from "./CrownIcon";
import AppleIcon from "./AppleIcon";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "A Princesa", href: "#about" },
    { name: "História", href: "#story" },
    { name: "15 Primaveras", href: "#gallery" },
    { name: "Traje", href: "#dresscode" },
    { name: "O Baile", href: "#event" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-royal-dark/95 backdrop-blur-xl border-b border-gold/30 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            : "bg-gradient-to-b from-royal-dark/90 via-royal-dark/50 to-transparent backdrop-blur-sm py-4"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-ruby to-royal-dark rounded-full flex items-center justify-center border border-gold/60 shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:scale-110 group-hover:border-gold transition-all duration-300">
               <CrownIcon size={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel font-bold text-xl text-gold tracking-[0.2em] group-hover:text-gold-light transition-colors leading-none">
                MARCELLE
              </span>
              <span className="font-serif text-[0.6rem] text-gold/60 tracking-[0.4em] uppercase mt-1">
                15 Anos
              </span>
            </div>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-cinzel text-xs text-pearl/70 hover:text-gold transition-all duration-300 tracking-[0.25em] uppercase relative group"
              >
                {link.name}
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-gold/50 transition-all duration-500 group-hover:w-full" />
              </a>
            ))}
            <a href="#rsvp">
              <MagicButton className="!py-3 !px-6 text-xs">
                Confirmar Presença
              </MagicButton>
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-gold hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-royal-dark/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <button
              className="absolute top-6 right-6 text-gold/50 hover:text-gold transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={32} />
            </button>

            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-cinzel text-2xl text-pearl hover:text-gold transition-colors tracking-widest uppercase"
                >
                  {link.name}
                </a>
              ))}
              <div className="mt-8">
                <a href="#rsvp" onClick={() => setIsMobileMenuOpen(false)}>
                  <MagicButton>Confirmar Presença</MagicButton>
                </a>
              </div>
            </div>

            {/* Decorative Apple at bottom */}
            <div className="absolute bottom-10 animate-pulse-glow">
              <AppleIcon size={36} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

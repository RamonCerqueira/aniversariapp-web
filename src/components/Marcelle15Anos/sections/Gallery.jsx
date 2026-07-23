import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OrnamentalHeading from "../ui/OrnamentalHeading";

const photos = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  year: i + 1,
  title: `${i + 1}º Ano`,
  desc: i === 14 ? "O grande desabrochar." : `Um ano de descobertas e alegrias.`,
  src: `/fotos/${['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']}.jpeg`
}));

export default function Gallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextPhoto, 5000);
    return () => clearInterval(timer);
  }, [nextPhoto]);

  // Get index for left, center, right
  const getIndex = (offset) => {
    return (currentIndex + offset + photos.length) % photos.length;
  };

  const visibleIndices = [-1, 0, 1]; // Left, Center, Right

  return (
    <section id="gallery" className="relative min-h-screen bg-royal-dark py-24 overflow-hidden flex flex-col items-center">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/royal.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[40vw] h-[40vw] bg-ruby/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[40vw] h-[40vw] bg-gold/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center w-full">
        <OrnamentalHeading title="15 Primaveras" subtitle="Uma Jornada de Encanto" />

        <div className="relative w-full max-w-6xl mt-12 h-[500px] md:h-[650px] flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center gap-4 md:gap-8">
            {visibleIndices.map((offset) => {
              const photo = photos[getIndex(offset)];
              const isCenter = offset === 0;

              return (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isCenter ? 1 : 0.4,
                    scale: isCenter ? 1 : 0.8,
                    x: offset * (window.innerWidth < 768 ? 150 : 350),
                    filter: isCenter ? "blur(0px)" : "blur(8px)",
                    zIndex: isCenter ? 20 : 10,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                  className="absolute w-[280px] h-[400px] md:w-[400px] md:h-[550px] rounded-3xl overflow-hidden border-4 border-double border-gold/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] bg-gradient-to-b from-royal-dark via-black to-royal-dark"
                >
                  <div className="relative w-full h-full">
                    {/* Golden Radial Glow for Photo */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.25)_0%,_transparent_75%)] z-0 pointer-events-none" />
                    
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="w-full h-full object-contain p-6 relative z-10"
                    />

                    {/* Specular Glass Glare */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-40 z-20 pointer-events-none" />

                    {/* Overlay for side photos */}
                    {!isCenter && <div className="absolute inset-0 bg-royal-dark/40 z-30" />}
                  </div>

                  {/* Text for center photo */}
                  <AnimatePresence>
                    {isCenter && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent text-center z-30"
                      >
                        <h3 className="text-3xl font-cinzel font-bold text-gold mb-2 drop-shadow-md">{photo.title}</h3>
                        <p className="text-pearl/90 font-serif italic text-lg">{photo.desc}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Luxury Navigation Controls */}
          <div className="absolute bottom-[-60px] flex items-center gap-6">
             <button 
               onClick={() => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)}
               className="w-12 h-12 rounded-full border border-gold/50 bg-royal-dark/80 backdrop-blur-md text-gold flex items-center justify-center hover:bg-gold hover:text-royal-dark hover:scale-110 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300"
               aria-label="Foto Anterior"
             >
               <ChevronLeft size={24} />
             </button>
             <div className="flex gap-2">
                {photos.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-500 ${i === currentIndex ? 'bg-gold w-8 shadow-[0_0_10px_#FFD700]' : 'bg-gold/30 w-2'}`}
                  />
                ))}
             </div>
             <button 
               onClick={nextPhoto}
               className="w-12 h-12 rounded-full border border-gold/50 bg-royal-dark/80 backdrop-blur-md text-gold flex items-center justify-center hover:bg-gold hover:text-royal-dark hover:scale-110 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300"
               aria-label="Próxima Foto"
             >
               <ChevronRight size={24} />
             </button>
          </div>
        </div>
      </div>
    </section>
  );
}

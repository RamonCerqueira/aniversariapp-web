import React, { useState, useEffect, useRef } from "react";
import Hero from "./sections/Hero.jsx";
import About from "./sections/About.jsx";
import Story from "./sections/Story.jsx";
import Gallery from "./sections/Gallery.jsx";
import DressCode from "./sections/DressCode.jsx";
import Event from "./sections/Event.jsx";
import RSVP from "./sections/RSVP.jsx";
import Navbar from "./ui/Navbar.jsx";
import MagicCursor from "./ui/MagicCursor.jsx";
import AppleLoader from "./ui/AppleLoader.jsx";
import { Volume2, VolumeX } from "lucide-react";

export default function Marcelle15AnosPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Tenta tocar a música assim que o splash termina
  useEffect(() => {
    if (!showSplash && audioRef.current) {
      // Browsers bloqueiam som sem interação, tentamos com catch
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.log("Autoplay bloqueado pelo navegador, aguardando clique do usuário:", err);
        });
    }
  }, [showSplash]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Erro ao tocar áudio:", err));
    }
  };

  if (showSplash) {
    return <AppleLoader onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="marcelle-page-container bg-black min-h-screen text-white overflow-x-hidden relative font-sans">
      <MagicCursor />
      <Navbar />
      <div id="hero"><Hero /></div>
      <div id="about"><About /></div>
      <div id="story"><Story /></div>
      <div id="gallery"><Gallery /></div>
      <div id="dresscode"><DressCode /></div>
      <div id="event"><Event /></div>
      <div id="rsvp"><RSVP /></div>

      {/* Botão de Controle de Música Flutuante */}
      <button
        onClick={togglePlay}
        className="fixed bottom-6 right-6 z-[99] w-12 h-12 bg-gold/90 hover:bg-gold text-black rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)] flex items-center justify-center border-2 border-double border-black transition-all hover:scale-110 active:scale-95 cursor-pointer"
        title={isPlaying ? "Mutar Trilha Sonora" : "Tocar Trilha Sonora"}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 animate-pulse" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </button>

      {/* Elemento de Áudio HTML5 */}
      <audio ref={audioRef} src="/soundtrack.mp3" loop />
    </div>
  );
}

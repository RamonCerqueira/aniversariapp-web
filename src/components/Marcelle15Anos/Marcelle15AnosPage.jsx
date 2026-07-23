import React, { useState } from "react";
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

export default function Marcelle15AnosPage() {
  const [showSplash, setShowSplash] = useState(true);

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
    </div>
  );
}

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Story from "@/components/sections/Story";
import Gallery from "@/components/sections/Gallery";
import DressCode from "@/components/sections/DressCode";
import Event from "@/components/sections/Event";
import RSVP from "@/components/sections/RSVP";
import Navbar from "@/components/ui/Navbar";
import MagicCursor from "@/components/ui/MagicCursor";



export default function Home() {
  return (
    <main className="bg-black min-h-screen text-white overflow-x-hidden">
      <MagicCursor />
      <Navbar />
      <div id="hero"><Hero /></div>
      <div id="about"><About /></div>
      <div id="story"><Story /></div>
      <div id="gallery"><Gallery /></div>
      <div id="dresscode"><DressCode /></div>
      <div id="event"><Event /></div>
      <div id="rsvp"><RSVP /></div>
    </main>
  );
}

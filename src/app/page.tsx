import Hero from "@/components/hero/Hero";
import Work from "@/components/work/Work";
import Experience from "@/components/experience/Experience";
import Contact from "@/components/contact/Contact";
import EyeZoom from "@/components/transitions/EyeZoom";
import ViewCursor from "@/components/work/ViewCursor";

export default function Home() {
  return (
    <main>
      {/* pinned by <EyeZoom>; the hero inside it is what zooms */}
      <div id="hero-pin" className="relative overflow-hidden">
        <Hero />
      </div>
      {/* EyeZoom must mount before the sections so its pins exist before their scroll triggers */}
      <EyeZoom />
      <Experience />
      <Work />
      <Contact />
      <ViewCursor />
    </main>
  );
}

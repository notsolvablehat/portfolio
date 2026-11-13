import Header from "@/components/Header";
import Hero from "@/components/hero/Hero";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        {/* Placeholder until the Work section is built */}
        <section id="work" className="flex min-h-svh items-center justify-center">
          <p className="font-display text-[8vw] text-ink">WORK</p>
        </section>
      </main>
    </>
  );
}

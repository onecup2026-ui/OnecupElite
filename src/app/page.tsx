"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Trophy, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

export default function Home() {
  const db = useFirestore();
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const { data: siteConfig } = useDoc(configRef);

  // Valeurs par défaut inspirées de FIFA.com
  const heroImage = siteConfig?.heroImageUrl || "https://picsum.photos/seed/onecup-elite-arena/1920/1080";
  const heroTitle = siteConfig?.heroTitle || "L'ÉLITE DU SPORT\nEN RDC.";

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f3f3]">
      {/* Bandeau défilant (Ticker) style FIFA */}
      <div className="bg-black text-white py-2 overflow-hidden border-b border-white/10">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee px-4">
          {Array(10).fill(0).map((_, i) => (
            <span key={i} className="text-[10px] font-black uppercase tracking-[0.3em]">
              ROAD TO ONECUP ELITE 2026 • INSCRIPTIONS OUVERTES • PRIX RECORD • 
            </span>
          ))}
        </div>
      </div>

      {/* Section Hero Immersive */}
      <section className="relative h-[85vh] flex items-center bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="OneCup Elite Banner"
            fill
            className="object-cover opacity-60"
            priority
          />
          {/* Dégradé profond pour l'immersion */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl space-y-8 animate-fifa-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-1 bg-white rounded-full" />
              <span className="text-white font-black text-xs uppercase tracking-[0.4em]">PRESTIGE & PERFORMANCE</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-headline font-black tracking-tighter uppercase leading-[0.8] text-white whitespace-pre-line drop-shadow-2xl">
              {heroTitle}
            </h1>
            <div className="flex flex-wrap gap-4 pt-6">
              <Button size="lg" className="h-20 px-16 text-xl font-black uppercase rounded-2xl bg-white text-primary hover:bg-white/90 glow-blue transition-transform hover:scale-105">
                S'inscrire <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              <Button size="lg" variant="outline" className="h-20 px-12 text-xl font-black uppercase rounded-2xl border-white text-white hover:bg-white/10">
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Teaser/Stats */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-4xl font-headline font-black uppercase tracking-tighter">100%<br/><span className="text-primary">ELITE</span></h3>
            <p className="text-muted-foreground font-medium">Une architecture pensée pour les champions.</p>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-4xl font-headline font-black uppercase tracking-tighter">LIVE<br/><span className="text-primary">SCORES</span></h3>
            <p className="text-muted-foreground font-medium">Suivez chaque action en temps réel.</p>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-4xl font-headline font-black uppercase tracking-tighter">GLOBAL<br/><span className="text-primary">PRESTIGE</span></h3>
            <p className="text-muted-foreground font-medium">Le standard international en RDC.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

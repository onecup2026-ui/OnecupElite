"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, ArrowRight, Zap, Target, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

export default function Home() {
  const db = useFirestore();
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const { data: siteConfig } = useDoc(configRef);

  const heroImage = siteConfig?.heroImageUrl || "https://picsum.photos/seed/onecup-arena-elite/1920/1080";
  const heroTitle = siteConfig?.heroTitle || "L'ÉLITE DU SPORT\nEN RDC.";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic News Ticker */}
      <div className="bg-black text-white py-3 overflow-hidden border-b border-white/10">
        <div className="flex items-center gap-12 whitespace-nowrap animate-marquee px-4">
          {Array(10).fill(0).map((_, i) => (
            <span key={i} className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-4">
              ROAD TO ONECUP ELITE 2026 <div className="w-1 h-1 bg-primary rounded-full" /> INSCRIPTIONS OUVERTES <div className="w-1 h-1 bg-primary rounded-full" /> PRIX RECORD 
            </span>
          ))}
        </div>
      </div>

      {/* Hero Section Immersive */}
      <section className="relative h-[80vh] md:h-[90vh] flex items-center bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="OneCup Elite Arena"
            fill
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl space-y-8 animate-fifa-in">
            <div className="flex items-center gap-4">
              <div className="w-16 h-1.5 bg-primary rounded-full" />
              <span className="text-white font-black text-xs uppercase tracking-[0.5em]">PRESTIGE • PERFORMANCE • EXCELLENCE</span>
            </div>
            <h1 className="text-6xl md:text-[10rem] font-headline font-black tracking-tighter uppercase leading-[0.82] text-white whitespace-pre-line drop-shadow-2xl">
              {heroTitle}
            </h1>
            <p className="text-white/80 text-lg md:text-2xl max-w-2xl font-medium leading-relaxed">
              Vivez l'intensité du sport de haut niveau et de l'e-sport d'élite sur la plateforme de référence en République Démocratique du Congo.
            </p>
            <div className="flex flex-wrap gap-6 pt-10">
              <Link href="/tournaments">
                <Button size="lg" className="h-20 px-16 text-xl font-black uppercase rounded-2xl bg-white text-primary hover:bg-white/90 glow-blue transition-transform hover:scale-105 active:scale-95">
                  S'inscrire Maintenant <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="h-20 px-12 text-xl font-black uppercase rounded-2xl border-white/30 text-white hover:bg-white/10 backdrop-blur-md">
                  Notre Vision
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Elite Stats Section */}
      <section className="py-24 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6 text-center md:text-left group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                <Target className="w-8 h-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-4xl font-headline font-black uppercase tracking-tighter">100%<br/><span className="text-primary">ÉQUITÉ</span></h3>
              <p className="text-muted-foreground font-medium text-lg">Un règlement strict pour garantir la justice sportive à chaque match.</p>
            </div>
            <div className="space-y-6 text-center md:text-left group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                <Zap className="w-8 h-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-4xl font-headline font-black uppercase tracking-tighter">LIVE<br/><span className="text-primary">DATA</span></h3>
              <p className="text-muted-foreground font-medium text-lg">Suivez les statistiques et les scores en temps réel sur tous vos écrans.</p>
            </div>
            <div className="space-y-6 text-center md:text-left group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                <Star className="w-8 h-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-4xl font-headline font-black uppercase tracking-tighter">GLOBAL<br/><span className="text-primary">REACH</span></h3>
              <p className="text-muted-foreground font-medium text-lg">Une visibilité média sans précédent pour les talents émergents.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Competition Teaser */}
      <section className="py-32 container mx-auto px-4 text-center space-y-12">
        <div className="space-y-4 max-w-2xl mx-auto">
          <span className="text-primary font-black uppercase text-xs tracking-[0.4em]">PROCHAINE ÉTAPE</span>
          <h2 className="text-5xl md:text-8xl font-headline font-black uppercase tracking-tighter leading-none">PRÊT POUR <br/><span className="text-primary">L'HISTOIRE ?</span></h2>
        </div>
        <div className="relative aspect-video max-w-5xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl group">
          <Image 
            src="https://picsum.photos/seed/onecup-teaser/1600/900" 
            alt="Tournament Teaser" 
            fill 
            className="object-cover transition-transform duration-[2s] group-hover:scale-110"
            data-ai-hint="soccer arena"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Link href="/tournaments">
              <Button size="lg" className="h-20 px-12 rounded-2xl bg-primary text-white font-black uppercase text-xl glow-blue">
                Voir les compétitions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
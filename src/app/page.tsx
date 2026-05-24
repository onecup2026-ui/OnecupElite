"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, Star, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const db = useFirestore();
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const { data: siteConfig } = useDoc(configRef);

  const heroImage = siteConfig?.heroImageUrl || PlaceHolderImages.find(img => img.id === 'hero-bg')?.imageUrl || "";
  const heroTitle = siteConfig?.heroTitle || "L'élite du sport en RDC.";
  const heroSubtitle = siteConfig?.heroSubtitle || "La plateforme qui unit le football et l'e-sport. Compétition, émotion et gloire pour tous les talents.";

  const stats = [
    { label: "Écoles", value: siteConfig?.statSchools || "32+", icon: Users },
    { label: "Matchs", value: siteConfig?.statMatches || "150+", icon: Trophy },
    { label: "Talents", value: siteConfig?.statTalents || "250+", icon: Star },
  ];

  return (
    <div className="flex flex-col">
      {/* Immersive Hero Section - Optimized for all screens */}
      <section className="relative min-h-[65vh] md:min-h-[75vh] flex items-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="OneCup Banner"
            fill
            className="object-contain lg:object-cover opacity-60 animate-in fade-in duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 py-16">
          <div className="max-w-4xl space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[9px] w-fit">EDITION 2026</Badge>
            <h1 className="text-4xl md:text-8xl font-headline font-black tracking-tighter uppercase leading-[0.85] text-white drop-shadow-xl whitespace-pre-line">
              {heroTitle}
            </h1>
            <p className="text-base md:text-2xl text-white font-medium max-w-2xl drop-shadow-lg leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/tournaments" className="w-full sm:w-auto">
                <Button size="lg" className="h-14 md:h-20 w-full sm:w-auto px-10 md:px-16 text-sm md:text-xl font-black uppercase rounded-2xl bg-primary glow-blue transition-transform hover:scale-105 active:scale-95">
                  Rejoindre l'élite
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 md:py-20 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-row md:flex-col items-center justify-between md:justify-center p-8 border rounded-3xl bg-slate-50 transition-all hover:border-primary/30">
                <stat.icon className="w-8 h-8 md:w-12 md:h-12 text-primary mb-0 md:mb-4" />
                <div className="text-right md:text-center">
                  <span className="text-3xl md:text-6xl font-headline font-black tracking-tighter block leading-none">{stat.value}</span>
                  <span className="text-muted-foreground uppercase text-[9px] font-black tracking-widest block mt-1">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 container mx-auto px-4 text-center">
        <div className="bg-primary p-12 md:p-32 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-125" />
          <h2 className="text-3xl md:text-8xl font-headline font-black uppercase tracking-tighter leading-[0.85] relative z-10">
            PRÊT À ENTRER <br className="hidden md:block" /> DANS L'HISTOIRE ?
          </h2>
          <p className="text-white/90 text-sm md:text-2xl max-w-3xl mx-auto font-medium relative z-10 leading-relaxed">
            Ne laissez pas passer votre chance de devenir une légende. Les inscriptions 2026 sont officiellement lancées.
          </p>
          <div className="relative z-10 pt-4">
            <Link href="/tournaments" className="inline-block w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="h-16 md:h-24 px-12 md:px-24 font-black text-lg md:text-2xl uppercase rounded-2xl md:rounded-[2rem] shadow-2xl transition-transform hover:scale-105 active:scale-95 w-full">
                S'inscrire maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

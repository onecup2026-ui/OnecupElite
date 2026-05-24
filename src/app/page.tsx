"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, Star, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDoc, useFirestore, useCollection } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const db = useFirestore();

  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const sponsorsRef = useMemo(() => (db ? collection(db, "sponsors") : null), [db]);
  
  const { data: siteConfig } = useDoc(configRef);
  const { data: sponsors } = useCollection(sponsorsRef);

  const heroImage = siteConfig?.heroImageUrl || PlaceHolderImages.find(img => img.id === 'hero-bg')?.imageUrl || "";
  const heroTitle = siteConfig?.heroTitle || "Le sport de haut niveau en RDC.";
  const heroSubtitle = siteConfig?.heroSubtitle || "Découvrez OneCup, la plateforme qui unit le football et l'e-sport. Compétition, émotion et gloire.";

  const stats = [
    { label: "Écoles", value: siteConfig?.statSchools || "32+", icon: Users },
    { label: "Matchs", value: siteConfig?.statMatches || "150+", icon: Trophy },
    { label: "Talents", value: siteConfig?.statTalents || "250+", icon: Star },
  ];

  return (
    <div className="flex flex-col">
      {/* Immersive Hero Section */}
      <section className="relative min-h-[70vh] flex items-center bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="OneCup Hero"
            fill
            className="object-contain lg:object-cover opacity-60 animate-in fade-in duration-1000"
            priority
            data-ai-hint="stadium crowd"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-10 duration-700">
            <Badge className="bg-primary hover:bg-primary border-none text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs">ÉDITION 2026</Badge>
            <h1 className="text-5xl md:text-8xl font-headline font-black tracking-tighter uppercase whitespace-pre-line leading-[0.9] drop-shadow-2xl">
              {heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed max-w-xl drop-shadow-lg">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4 pt-6">
              <Link href="/tournaments">
                <Button size="lg" className="h-16 px-10 text-lg font-black uppercase rounded-2xl bg-primary glow-blue">
                  Rejoindre l'Élite
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-black uppercase rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md">
                  Notre Vision
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-10 border rounded-[2rem] bg-slate-50 transition-transform hover:scale-105">
                <stat.icon className="w-10 h-10 text-primary mb-6" />
                <span className="text-5xl font-headline font-black mb-2 tracking-tighter">{stat.value}</span>
                <span className="text-muted-foreground uppercase text-xs font-black tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-4 text-center mb-20 space-y-6">
          <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter">UNE EXPÉRIENCE INÉGALÉE.</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-xl font-medium">L'innovation au service de la passion sportive en République Démocratique du Congo.</p>
        </div>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { title: "Organisation Élite", desc: "Des tableaux de matchs clairs, précis et mis à jour en temps réel pour une équité totale.", icon: Trophy },
            { title: "Pulse Communautaire", desc: "Vibrez avec des milliers de passionnés et suivez l'ascension de vos champions favoris.", icon: Users },
            { title: "Prestige & Gains", desc: "Des récompenses à la hauteur de votre talent avec des cagnottes transparentes et records.", icon: DollarSign },
          ].map((item, i) => (
            <div key={i} className="bg-white p-12 rounded-[2.5rem] border shadow-sm space-y-6 text-center hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:rotate-12">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="font-headline font-black text-2xl uppercase tracking-tight">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partners Marquee */}
      {sponsors && sponsors.length > 0 && (
        <section className="py-24 bg-white border-t border-b overflow-hidden">
          <div className="container mx-auto px-4 mb-12 text-center">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.4em]">NOS PARTENAIRES ÉLITES</h3>
          </div>
          <div className="flex animate-marquee">
            {[...sponsors, ...sponsors].map((s: any, i) => (
              <div key={i} className="w-64 px-16 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                <img src={s.logoUrl} alt={s.name} className="max-h-16 object-contain" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-32 container mx-auto px-4 text-center">
        <div className="bg-primary p-16 md:p-28 rounded-[3rem] text-white space-y-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-4xl md:text-7xl font-headline font-black uppercase tracking-tighter leading-none relative z-10">PRÊT À ENTRER <br/> DANS L'HISTOIRE ?</h2>
          <p className="text-white/90 text-xl max-w-2xl mx-auto font-medium relative z-10">
            Les inscriptions pour la saison 2026 sont officiellement ouvertes. Ne laissez pas passer votre chance de devenir une légende.
          </p>
          <div className="relative z-10">
            <Link href="/tournaments">
              <Button size="lg" variant="secondary" className="h-20 px-12 font-black text-xl uppercase rounded-2xl shadow-xl transition-transform hover:scale-105 active:scale-95">
                S'inscrire Maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

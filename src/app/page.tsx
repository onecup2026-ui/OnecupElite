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
      {/* Simple Hero */}
      <section className="relative h-[85vh] flex items-center bg-slate-900 text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="OneCup Hero"
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl space-y-6">
            <Badge className="bg-primary hover:bg-primary border-none text-white px-4 py-1">ÉDITION 2026</Badge>
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight uppercase whitespace-pre-line">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/tournaments">
                <Button size="lg" className="h-12 px-8 text-base font-bold">
                  Voir les tournois
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base font-bold bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Notre vision
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-6 border rounded-xl bg-slate-50">
                <stat.icon className="w-8 h-8 text-primary mb-4" />
                <span className="text-4xl font-bold mb-1">{stat.value}</span>
                <span className="text-muted-foreground uppercase text-xs font-semibold tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Simple */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold uppercase tracking-tight">Pourquoi nous rejoindre ?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Une expérience fluide pour les joueurs, les organisateurs et les fans.</p>
        </div>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Organisation Pro", desc: "Des tableaux de matchs clairs et mis à jour en temps réel.", icon: Trophy },
            { title: "Communauté Active", desc: "Échangez avec d'autres passionnés et suivez vos équipes favorites.", icon: Users },
            { title: "Récompenses", desc: "Des cagnottes transparentes et des trophées prestigieux.", icon: DollarSign },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-xl border shadow-sm space-y-4 text-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partners Marquee Simple */}
      {sponsors && sponsors.length > 0 && (
        <section className="py-16 bg-white border-t border-b overflow-hidden">
          <div className="container mx-auto px-4 mb-8 text-center">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Ils nous font confiance</h3>
          </div>
          <div className="flex animate-marquee">
            {[...sponsors, ...sponsors].map((s: any, i) => (
              <div key={i} className="w-48 px-10 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                <img src={s.logoUrl} alt={s.name} className="max-h-12 object-contain" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-24 container mx-auto px-4 text-center">
        <div className="bg-primary p-12 md:p-20 rounded-2xl text-white space-y-8 shadow-xl">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">Prêt à entrer dans la compétition ?</h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Les inscriptions sont ouvertes. Ne manquez pas l'opportunité de devenir le prochain champion.
          </p>
          <Link href="/tournaments">
            <Button size="lg" variant="secondary" className="h-14 px-10 font-bold text-lg">
              S'inscrire maintenant
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
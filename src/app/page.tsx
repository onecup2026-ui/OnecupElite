
"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, Star, DollarSign, Calendar, ArrowRight, Play, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrizePoolTracker } from "@/components/shared/prize-pool-tracker";
import { useDoc, useCollection, useFirestore } from "@/firebase";
import { doc, collection } from "firebase/firestore";

const stats = [
  { label: "Équipes Actives", value: "128+", icon: Users },
  { label: "Tournois", value: "24", icon: Trophy },
  { label: "Cagnotte Totale", value: "150M FC", icon: DollarSign },
  { label: "Partenaires Globaux", value: "15", icon: Star },
];

export default function Home() {
  const db = useFirestore();

  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const sponsorsRef = useMemo(() => (db ? collection(db, "sponsors") : null), [db]);

  const { data: siteConfig } = useDoc(configRef);
  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: sponsors } = useCollection(sponsorsRef);

  const heroImage = (siteConfig?.heroImageUrl && siteConfig.heroImageUrl.trim() !== "") 
    ? siteConfig.heroImageUrl 
    : "https://picsum.photos/seed/ball-trophy-prestige/1920/1080";
  
  const heroTitle = siteConfig?.heroTitle || "LA VICTOIRE EST UNE PASSION.";
  const heroSubtitle = siteConfig?.heroSubtitle || "Dominez le terrain avec l'écosystème OneCup. La plateforme numéro 1 pour les compétitions de football et d'e-sport de haut niveau.";

  // On filtre ou on prend les deux premiers tournois, en s'assurant qu'ils mentionnent la capacité
  const featuredTournaments = tournaments?.slice(0, 2) || [];

  // Configuration de la cagnotte
  const currentPool = siteConfig?.currentPrizePool || 1350000;
  const targetPool = siteConfig?.targetPrizePool || 5000000;

  const tiers = [
    { rank: "Gagnant Or", amount: 1000000, percentage: 74 },
    { rank: "Finaliste", amount: 200000, percentage: 15 },
    { rank: "Meilleur Joueur", amount: 100000, percentage: 7 },
    { rank: "Meilleur Gardien", amount: 50000, percentage: 4 },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden py-12 md:py-20">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="OneCup Hero"
            fill
            className="object-cover opacity-40 md:opacity-60"
            priority
            unoptimized={heroImage.startsWith('data:')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl space-y-6 text-center xl:text-left">
              <div className="flex justify-center xl:justify-start">
                <Badge variant="outline" className="border-primary text-primary px-4 py-1 rounded-full animate-pulse bg-primary/10 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                  ÉDITION ÉLITE 2026
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-headline font-bold leading-none tracking-tighter uppercase whitespace-pre-line text-foreground drop-shadow-sm">
                {heroTitle}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-body max-w-xl mx-auto xl:mx-0">
                {heroSubtitle}
              </p>
              <div className="flex flex-wrap justify-center xl:justify-start gap-4 pt-4">
                <Link href="/tournaments" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-14 px-8 bg-primary hover:bg-primary/90 glow-blue text-lg gap-2 uppercase font-bold text-white">
                    Participer <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg gap-2 backdrop-blur-sm uppercase font-bold">
                  <Play className="w-5 h-5 fill-current" /> Teaser
                </Button>
              </div>
            </div>

            {/* Dynamic Prize Pool Widget */}
            <div className="flex justify-center xl:justify-end animate-float">
              <div className="w-full max-w-[400px]">
                <PrizePoolTracker
                  currentPool={currentPool}
                  targetPool={targetPool}
                  tiers={tiers}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 border-y bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2 p-4 md:p-6 rounded-2xl border border-white/5 hover:bg-muted/30 transition-all group shadow-sm hover:shadow-md">
                <div className="p-3 bg-primary/10 rounded-xl mb-2 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-headline font-bold">{stat.value}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-headline font-bold uppercase tracking-tight">TOURNOIS À LA UNE</h2>
              <p className="text-muted-foreground">Découvrez nos compétitions majeures accueillant plus de 16 équipes.</p>
            </div>
            <Link href="/tournaments">
              <Button variant="ghost" className="gap-2 group uppercase font-bold text-sm">
                Tous les événements <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredTournaments.map((tournament: any) => (
              <div key={tournament.id} className="group relative overflow-hidden rounded-3xl bg-card border hover:border-primary/50 transition-all duration-500 shadow-lg">
                <div className="aspect-[16/9] relative overflow-hidden">
                  <Image
                    src={tournament.imageUrl || "https://picsum.photos/seed/onecup-foot/800/600"}
                    alt={tournament.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized={tournament.imageUrl?.startsWith('data:')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                  <Badge className="absolute top-4 left-4 bg-primary/90 text-white font-bold">{tournament.sport}</Badge>
                  <Badge variant="secondary" className="absolute top-4 right-4 bg-background/90 font-bold">16+ ÉQUIPES</Badge>
                </div>
                <div className="p-6 md:p-8 space-y-4">
                  <h3 className="text-xl md:text-2xl font-headline font-bold group-hover:text-primary transition-colors uppercase">{tournament.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {tournament.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      {tournament.prize}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      {tournament.teamsMax || "16"} Équipes Max
                    </div>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <Button className="flex-1 bg-primary hover:bg-primary/90 glow-blue uppercase font-bold h-12 text-white">S'inscrire</Button>
                    <Link href={`/tournaments/${tournament.id}`} className="flex-1">
                      <Button variant="outline" className="w-full uppercase font-bold h-12">Détails</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Sponsors Section */}
      <section className="py-16 bg-muted/20 border-t overflow-hidden">
        <div className="container mx-auto px-4 mb-8 text-center">
          <Badge variant="ghost" className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Ils nous font confiance</Badge>
          <h2 className="text-2xl md:text-3xl font-headline font-bold uppercase">NOS PARTENAIRES ÉLITES</h2>
        </div>
        
        <div className="relative flex overflow-x-hidden">
          <div className="py-12 animate-marquee whitespace-nowrap flex items-center">
            {sponsors && sponsors.length > 0 ? (
              // On double les logos pour l'effet infini
              [...sponsors, ...sponsors, ...sponsors].map((sponsor: any, idx) => (
                <div key={`${sponsor.id}-${idx}`} className="mx-8 md:mx-16 animate-float" style={{ animationDelay: `${idx * 0.2}s` }}>
                  <div className="h-12 md:h-20 w-auto flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110">
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="max-h-full w-auto object-contain"
                    />
                  </div>
                </div>
              ))
            ) : (
              // Fallback placeholders si pas de sponsors
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="mx-12 h-12 w-32 bg-muted/40 rounded-lg animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

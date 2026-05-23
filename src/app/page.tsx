
"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, Star, DollarSign, Calendar, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrizePoolTracker } from "@/components/shared/prize-pool-tracker";
import { useDoc, useCollection, useFirestore } from "@/firebase";
import { doc, collection } from "firebase/firestore";

const stats = [
  { label: "Équipes Actives", value: "128+", icon: Users },
  { label: "Tournois", value: "24", icon: Trophy },
  { label: "Cagnotte Totale", value: "50K€", icon: DollarSign },
  { label: "Partenaires Globaux", value: "15", icon: Star },
];

export default function Home() {
  const db = useFirestore();

  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);

  const { data: siteConfig } = useDoc(configRef);
  const { data: tournaments } = useCollection(tournamentsRef);

  const heroImage = (siteConfig?.heroImageUrl && siteConfig.heroImageUrl.trim() !== "") 
    ? siteConfig.heroImageUrl 
    : "https://picsum.photos/seed/ball-trophy-prestige/1920/1080";
  
  const heroTitle = siteConfig?.heroTitle || "LA VICTOIRE EST UNE PASSION.";
  const heroSubtitle = siteConfig?.heroSubtitle || "Dominez le terrain avec l'écosystème OneCup. La plateforme numéro 1 pour les compétitions de football et d'e-sport de haut niveau.";

  const featuredTournaments = tournaments?.slice(0, 2) || [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="OneCup Hero"
            fill
            className="object-cover opacity-60 scale-100"
            priority
            unoptimized={heroImage.startsWith('data:')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl space-y-6">
            <Badge variant="outline" className="border-primary text-primary px-4 py-1 rounded-full animate-pulse bg-primary/10 font-bold uppercase tracking-widest">
              ÉDITION ÉLITE 2026
            </Badge>
            <h1 className="text-6xl md:text-8xl font-headline font-bold leading-none tracking-tighter uppercase whitespace-pre-line">
              {heroTitle}
            </h1>
            <p className="text-xl text-muted-foreground font-body max-w-xl">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/tournaments">
                <Button size="lg" className="h-14 px-8 bg-primary hover:bg-primary/90 glow-blue text-lg gap-2 uppercase font-bold">
                  Participer Maintenant <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2 backdrop-blur-sm uppercase font-bold">
                <Play className="w-5 h-5 fill-current" /> Voir le Teaser
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Prize Pool Widget */}
        <div className="hidden xl:block absolute right-24 top-1/2 -translate-y-1/2 w-[400px] animate-float">
          <PrizePoolTracker
            currentPool={siteConfig?.currentPrizePool || 52400}
            targetPool={siteConfig?.targetPrizePool || 150000}
            tiers={[
              { rank: "Champion Or", amount: Math.floor((siteConfig?.currentPrizePool || 52400) * 0.5), percentage: 50 },
              { rank: "Finaliste Argent", amount: Math.floor((siteConfig?.currentPrizePool || 52400) * 0.3), percentage: 30 },
              { rank: "3ème Place Bronze", amount: Math.floor((siteConfig?.currentPrizePool || 52400) * 0.2), percentage: 20 },
            ]}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2 p-6 rounded-2xl border border-white/5 hover:bg-muted/30 transition-colors group">
                <div className="p-3 bg-primary/10 rounded-xl mb-2 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-headline font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-headline font-bold uppercase">TOURNOIS À LA UNE</h2>
              <p className="text-muted-foreground">Inscrivez votre équipe pour entrer dans l'histoire.</p>
            </div>
            <Link href="/tournaments">
              <Button variant="ghost" className="gap-2 group uppercase font-bold">
                Tous les événements <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredTournaments.map((tournament: any) => (
              <div key={tournament.id} className="group relative overflow-hidden rounded-3xl bg-card border hover:border-primary/50 transition-all duration-500">
                <div className="aspect-[16/9] relative overflow-hidden">
                  <Image
                    src={tournament.imageUrl || "https://picsum.photos/seed/onecup-foot/800/600"}
                    alt={tournament.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized={tournament.imageUrl?.startsWith('data:')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                  <Badge className="absolute top-6 left-6 bg-primary/90 text-white font-bold">{tournament.sport}</Badge>
                </div>
                <div className="p-8 space-y-4">
                  <h3 className="text-2xl font-headline font-bold group-hover:text-primary transition-colors uppercase">{tournament.name}</h3>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {tournament.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      {tournament.prize} de Cashprize
                    </div>
                  </div>
                  <div className="pt-4 flex gap-4">
                    <Button className="flex-1 bg-primary hover:bg-primary/90 glow-blue uppercase font-bold">S'inscrire</Button>
                    <Link href={`/tournaments/${tournament.id}`} className="flex-1">
                      <Button variant="outline" className="w-full uppercase font-bold">Détails</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

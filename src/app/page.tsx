
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, Star, DollarSign, Calendar, ArrowRight, Play, Heart, X, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrizePoolTracker } from "@/components/shared/prize-pool-tracker";
import { useDoc, useCollection, useFirestore } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const stats = [
  { label: "Équipes Actives", value: "128+", icon: Users },
  { label: "Tournois", value: "24", icon: Trophy },
  { label: "Cagnotte Totale", value: "150M FC", icon: DollarSign },
  { label: "Partenaires Globaux", value: "15", icon: Star },
];

export default function Home() {
  const db = useFirestore();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const sponsorsRef = useMemo(() => (db ? collection(db, "sponsors") : null), [db]);

  const { data: siteConfig, loading: configLoading } = useDoc(configRef);
  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: sponsors } = useCollection(sponsorsRef);

  const defaultHero = PlaceHolderImages.find(img => img.id === 'hero-bg')?.imageUrl || "https://picsum.photos/seed/onecup-match-action/1920/1080";
  
  // Use config image if available, else placeholder
  const heroImage = siteConfig?.heroImageUrl || defaultHero;
  
  const heroTitle = siteConfig?.heroTitle || "CHAQUE SECONDE COMPTE.";
  const heroSubtitle = siteConfig?.heroSubtitle || "Vibrez au rythme de la OneCup Elite. La plateforme numéro 1 pour les compétitions de football et d'e-sport de haut niveau en RDC.";
  const heroVideoUrl = siteConfig?.heroVideoUrl || "";

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url;
    }
    return url;
  };

  const featuredTournaments = tournaments?.slice(0, 2) || [];

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
      <section className="relative min-h-[90vh] flex items-center overflow-hidden py-12 md:py-20">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Action OneCup"
            fill
            className="object-cover opacity-50 md:opacity-70 scale-105"
            priority
            data-ai-hint="soccer match"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl space-y-8 text-center xl:text-left animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="flex justify-center xl:justify-start">
                <Badge variant="outline" className="border-secondary text-secondary px-4 py-1.5 rounded-full bg-secondary/10 font-bold uppercase tracking-[0.2em] text-xs animate-pulse">
                  <Zap className="w-3 h-3 mr-2 fill-secondary" /> ÉDITION ÉLITE 2026
                </Badge>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-9xl font-headline font-bold leading-[0.9] tracking-tighter uppercase whitespace-pre-line text-foreground">
                {heroTitle}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-body max-w-xl mx-auto xl:mx-0 leading-relaxed">
                {heroSubtitle}
              </p>
              <div className="flex flex-wrap justify-center xl:justify-start gap-4 pt-4">
                <Link href="/tournaments" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-16 px-10 bg-primary hover:bg-primary/90 glow-blue text-lg gap-2 uppercase font-bold text-white transition-all hover:scale-105">
                    Entrer dans l'Arène <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                {heroVideoUrl && (
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-10 text-lg gap-2 backdrop-blur-md bg-white/5 uppercase font-bold border-white/20 hover:bg-white/10" onClick={() => setIsVideoOpen(true)}>
                    <Play className="w-5 h-5 fill-current" /> Voir le Teaser
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-center xl:justify-end animate-float delay-300">
              <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-1000">
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

      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-none ring-0">
          <div className="aspect-video w-full">
            <iframe
              src={`${getEmbedUrl(heroVideoUrl)}?autoplay=1`}
              title="OneCup Teaser"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <section className="py-12 md:py-16 border-y bg-card/50 backdrop-blur-xl relative z-20 -mt-8 md:-mt-12 mx-4 md:mx-12 rounded-3xl shadow-2xl border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2 p-2 md:p-4 transition-all group">
                <div className="p-3 bg-primary/10 rounded-2xl mb-2 group-hover:bg-primary/20 transition-all group-hover:scale-110">
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <p className="text-2xl md:text-4xl font-headline font-bold tracking-tighter">{stat.value}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4 text-center md:text-left">
              <Badge variant="outline" className="border-primary text-primary font-bold px-4">PROCHAINEMENT</Badge>
              <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase tracking-tighter">ÉVÉNEMENTS ÉLITES</h2>
              <p className="text-muted-foreground text-lg max-w-xl">Rejoignez l'élite du sport et de l'e-sport. Les inscriptions sont ouvertes pour les prochaines coupes.</p>
            </div>
            <Link href="/tournaments">
              <Button variant="ghost" className="gap-2 group uppercase font-bold text-sm h-12 hover:bg-primary/5 hover:text-primary">
                Voir tout le calendrier <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {featuredTournaments.map((tournament: any) => (
              <div key={tournament.id} className="group relative overflow-hidden rounded-[2.5rem] bg-card border border-white/5 hover:border-primary/40 transition-all duration-700 shadow-2xl">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <Image
                    src={tournament.imageUrl || "https://picsum.photos/seed/onecup-match/800/600"}
                    alt={tournament.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    unoptimized={tournament.imageUrl?.startsWith('data:')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
                  <div className="absolute top-6 left-6 flex gap-2">
                    <Badge className="bg-primary/90 text-white font-bold backdrop-blur-sm border-none">{tournament.gameType || tournament.sport}</Badge>
                    <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm border-white/10">{tournament.maxTeams} Équipes</Badge>
                  </div>
                </div>
                <div className="p-8 md:p-10 space-y-6">
                  <h3 className="text-2xl md:text-3xl font-headline font-bold group-hover:text-primary transition-colors uppercase tracking-tight">{tournament.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted-foreground font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {tournament.startDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      {tournament.prize || "1.000.000 FC"}
                    </div>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <Link href={`/tournaments/${tournament.id}`} className="flex-1">
                      <Button className="w-full bg-primary hover:bg-primary/90 glow-blue uppercase font-bold h-14 text-white rounded-2xl">S'inscrire</Button>
                    </Link>
                    <Link href={`/tournaments/${tournament.id}`} className="flex-1">
                      <Button variant="outline" className="w-full uppercase font-bold h-14 rounded-2xl border-white/10 hover:bg-white/5">Détails</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Marquee */}
      <section className="py-20 bg-muted/20 border-t overflow-hidden">
        <div className="container mx-auto px-4 mb-10 text-center">
          <Badge variant="ghost" className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-3">Ils soutiennent l'excellence</Badge>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">NOS PARTENAIRES OFFICIELS</h2>
        </div>
        
        <div className="relative flex overflow-x-hidden">
          <div className="py-12 animate-marquee whitespace-nowrap flex items-center">
            {sponsors && sponsors.length > 0 ? (
              [...sponsors, ...sponsors, ...sponsors].map((sponsor: any, idx) => (
                <div key={`${sponsor.id}-${idx}`} className="mx-12 md:mx-20 animate-float" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="h-16 md:h-24 w-auto flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700 hover:scale-110">
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="max-h-full w-auto object-contain"
                    />
                  </div>
                </div>
              ))
            ) : (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="mx-12 h-16 w-40 bg-muted/40 rounded-2xl animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

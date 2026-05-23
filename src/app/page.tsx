
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, Star, DollarSign, Calendar, ArrowRight, Play, Zap, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrizePoolTracker } from "@/components/shared/prize-pool-tracker";
import { useDoc, useCollection, useFirestore } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Équipes Élite", value: "128+", icon: Users },
  { label: "Championnats", value: "24", icon: Trophy },
  { label: "Cagnotte Record", value: "150M FC", icon: DollarSign },
  { label: "Talents Révélés", value: "500+", icon: Star },
];

export default function Home() {
  const db = useFirestore();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const sponsorsRef = useMemo(() => (db ? collection(db, "sponsors") : null), [db]);

  const { data: siteConfig } = useDoc(configRef);
  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: sponsors } = useCollection(sponsorsRef);

  const defaultHero = PlaceHolderImages.find(img => img.id === 'hero-bg')?.imageUrl || "https://picsum.photos/seed/onecup-match-action/1920/1080";
  
  const heroImage = siteConfig?.heroImageUrl || defaultHero;
  
  const heroTitle = siteConfig?.heroTitle || "DEVENEZ UNE LÉGENDE.\nLE TERRAIN VOUS ATTEND.";
  const heroSubtitle = siteConfig?.heroSubtitle || "OneCup Elite : L'arène ultime où le talent brut rencontre l'excellence professionnelle. Dominez le gazon lors de nos tournois de football prestigieux ou imposez votre loi sur PlayStation.";
  const heroVideoUrl = siteConfig?.heroVideoUrl || "";

  const featuredTournaments = tournaments?.slice(0, 2) || [];

  const currentPool = siteConfig?.currentPrizePool || 1350000;
  const targetPool = siteConfig?.targetPrizePool || 5000000;

  const tiers = [
    { rank: "Champion Or", amount: 1000000, percentage: 74 },
    { rank: "Finaliste Argent", amount: 200000, percentage: 15 },
    { rank: "Soulier d'Élite", amount: 100000, percentage: 7 },
    { rank: "Gant d'Or", amount: 50000, percentage: 4 },
  ];

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden py-20">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Intensité Football OneCup"
            fill
            className="object-cover opacity-60 scale-105"
            priority
            data-ai-hint="soccer player"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-center">
            <div className="max-w-3xl space-y-10 text-center xl:text-left">
              <div className="flex justify-center xl:justify-start">
                <Badge variant="outline" className="border-primary/50 text-primary px-6 py-2 rounded-full bg-primary/5 font-bold uppercase tracking-[0.3em] text-xs animate-pulse">
                  <Trophy className="w-3 h-3 mr-2 fill-primary" /> LA RÉFÉRENCE SPORTIVE 2026
                </Badge>
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline font-bold leading-[0.85] tracking-tighter uppercase whitespace-pre-line">
                {heroTitle}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-body max-w-xl mx-auto xl:mx-0 leading-relaxed font-medium">
                {heroSubtitle}
              </p>
              <div className="flex flex-wrap justify-center xl:justify-start gap-5 pt-6">
                <Link href="/tournaments" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-20 px-12 bg-primary hover:bg-primary/90 glow-blue text-xl gap-3 uppercase font-black rounded-2xl transition-all hover:scale-105">
                    S'inscrire Maintenant <ArrowRight className="w-6 h-6" />
                  </Button>
                </Link>
                {heroVideoUrl && (
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-20 px-12 text-xl gap-3 backdrop-blur-md bg-white/5 uppercase font-bold border-white/20 hover:bg-white/10" onClick={() => setIsVideoOpen(true)}>
                    <Play className="w-6 h-6 fill-current" /> Voir l'Action
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-center xl:justify-end">
              <div className="w-full max-w-[460px] animate-float">
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

      {/* Quick Stats */}
      <section className="relative z-20 -mt-16 container mx-auto px-4">
        <div className="bg-card/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 shadow-2xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-3 group">
                <div className="p-5 bg-primary/10 rounded-2xl group-hover:scale-110 transition-all">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-3xl md:text-5xl font-headline font-bold tracking-tighter">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tournament Selection */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-24 max-w-4xl mx-auto">
            <Badge variant="outline" className="border-primary text-primary font-bold px-6 py-2 uppercase tracking-widest">CHOISISSEZ VOTRE DISCIPLINE</Badge>
            <h2 className="text-5xl md:text-7xl font-headline font-bold uppercase tracking-tighter leading-none">DE LA PELOUSE <br/><span className="text-primary">AUX MANETTES.</span></h2>
            <p className="text-muted-foreground text-xl">Que vous soyez un tacticien du football réel ou un virtuose de la PlayStation, OneCup Elite offre la scène pour prouver que vous êtes le meilleur.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Football Highlight */}
            <Card className="group relative overflow-hidden rounded-[3rem] border-white/5 bg-gradient-to-br from-card to-card/50 hover:border-primary/40 transition-all duration-700 shadow-2xl">
              <div className="aspect-[16/10] relative overflow-hidden">
                <Image src="https://picsum.photos/seed/foot-elite/1000/600" alt="Football Elite" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" data-ai-hint="soccer stadium" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <Badge className="bg-primary text-white font-bold mb-3">DISCIPLINE REINE</Badge>
                  <h3 className="text-4xl font-headline font-bold text-white uppercase">Ligue de Football Élite</h3>
                </div>
              </div>
              <CardContent className="p-10 space-y-6">
                <p className="text-muted-foreground text-lg leading-relaxed">Le cœur de OneCup. Affrontez les meilleures équipes locales dans un format professionnel avec arbitres officiels, statistiques en temps réel et couverture média complète.</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-primary font-bold"><Trophy className="w-5 h-5"/> Cashprize Majeur</div>
                  <div className="flex items-center gap-2 text-primary font-bold"><Users className="w-5 h-5"/> 11 vs 11</div>
                </div>
                <Link href="/tournaments?category=football" className="block pt-4">
                  <Button className="w-full h-16 rounded-2xl uppercase font-black text-lg bg-primary hover:bg-primary/90 glow-blue">Réclamer votre Trône</Button>
                </Link>
              </CardContent>
            </Card>

            {/* E-sport Highlight */}
            <Card className="group relative overflow-hidden rounded-[3rem] border-white/5 bg-gradient-to-br from-card to-card/50 hover:border-secondary/40 transition-all duration-700 shadow-2xl">
              <div className="aspect-[16/10] relative overflow-hidden">
                <Image src="https://picsum.photos/seed/ps5-elite/1000/600" alt="PS5 Tournament" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" data-ai-hint="gaming setup" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <Badge className="bg-secondary text-white font-bold mb-3">ARÈNE NUMÉRIQUE</Badge>
                  <h3 className="text-4xl font-headline font-bold text-white uppercase">Challenge PlayStation 5</h3>
                </div>
              </div>
              <CardContent className="p-10 space-y-6">
                <p className="text-muted-foreground text-lg leading-relaxed">Pour les virtuoses de la manette. Prouvez votre supériorité technique sur les derniers titres de football e-sport dans une ambiance électrique et compétitive.</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-secondary font-bold"><Gamepad2 className="w-5 h-5"/> Tournoi PS5</div>
                  <div className="flex items-center gap-2 text-secondary font-bold"><Zap className="w-5 h-5"/> Format 1v1 / 2v2</div>
                </div>
                <Link href="/tournaments?category=jeux vidéo" className="block pt-4">
                  <Button className="w-full h-16 rounded-2xl uppercase font-black text-lg bg-secondary hover:bg-secondary/90 shadow-[0_10px_30px_-10px_rgba(0,149,255,0.4)]">Entrer dans l'Arène</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Video Dialog */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-none ring-0">
          <div className="aspect-video w-full">
            <iframe
              src={heroVideoUrl ? `https://www.youtube.com/embed/${heroVideoUrl.split('v=')[1] || heroVideoUrl.split('/').pop()}?autoplay=1` : ""}
              title="OneCup Teaser"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
    {children}
  </div>
);

const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-6 pt-0", className)}>
    {children}
  </div>
);

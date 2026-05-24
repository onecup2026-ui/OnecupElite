
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, Star, DollarSign, ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrizePoolTracker } from "@/components/shared/prize-pool-tracker";
import { useDoc, useFirestore, useCollection } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

export default function Home() {
  const db = useFirestore();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const sponsorsRef = useMemo(() => (db ? collection(db, "sponsors") : null), [db]);
  
  const { data: siteConfig } = useDoc(configRef);
  const { data: sponsors } = useCollection(sponsorsRef);

  const defaultHero = PlaceHolderImages.find(img => img.id === 'hero-bg')?.imageUrl || "https://picsum.photos/seed/onecup-hero/1920/1080";
  const heroImage = siteConfig?.heroImageUrl || defaultHero;
  
  const heroTitle = siteConfig?.heroTitle || "DEVENEZ UNE LÉGENDE.\nLA GLOIRE VOUS APPELLE.";
  const heroSubtitle = siteConfig?.heroSubtitle || "ONECUP 2026 : L'événement unique où le talent rencontre l'excellence. Rejoignez la compétition officielle.";
  const heroVideoUrl = siteConfig?.heroVideoUrl || "";

  const currentPool = siteConfig?.currentPrizePool || 0;
  const targetPool = siteConfig?.targetPrizePool || 5000000;

  const stats = [
    { label: "Écoles Élite", value: siteConfig?.statSchools || "32+", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Matchs Épiques", value: siteConfig?.statMatches || "15+", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Cagnotte Globale", value: `${(currentPool / 1000000).toFixed(1)}M FC`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Talents Révélés", value: siteConfig?.statTalents || "257+", icon: Star, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  const tiers = [
    { rank: "Champion OneCup", amount: Math.floor(currentPool * 0.74), percentage: 74 },
    { rank: "Finaliste Argent", amount: Math.floor(currentPool * 0.15), percentage: 15 },
    { rank: "Soulier d'Élite", amount: Math.floor(currentPool * 0.07), percentage: 7 },
  ];

  return (
    <div className="flex flex-col bg-background selection:bg-primary selection:text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden py-32">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="OneCup Action"
            fill
            className="object-cover opacity-40 scale-105"
            priority
            style={{ objectPosition: 'center 20%' }}
            data-ai-hint="soccer player"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/80 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-24 items-center">
            <div className="max-w-4xl space-y-12 text-center xl:text-left">
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-card border-primary/20 text-primary animate-bounce">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Édition Prestige 2026</span>
              </div>
              
              <h1 className="text-7xl md:text-9xl font-headline font-black leading-[0.8] tracking-tighter uppercase whitespace-pre-line text-foreground drop-shadow-sm">
                {heroTitle.split('\n').map((line, i) => (
                  <span key={i} className={cn("block", i === 1 && "text-primary")}>{line}</span>
                ))}
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto xl:mx-0 leading-relaxed font-medium">
                {heroSubtitle}
              </p>
              
              <div className="flex flex-wrap justify-center xl:justify-start gap-6 pt-6">
                <Link href="/tournaments">
                  <Button size="lg" className="h-20 px-12 bg-primary hover:bg-primary/90 glow-blue text-xl gap-4 uppercase font-black rounded-[2rem] transition-all hover:scale-105 active:scale-95">
                    Entrer dans l'arène <ArrowRight className="w-6 h-6" />
                  </Button>
                </Link>
                {heroVideoUrl && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-20 px-12 text-xl gap-4 glass-card border-white/20 uppercase font-bold rounded-[2rem] hover:bg-white/5 transition-all"
                    onClick={() => setIsVideoOpen(true)}
                  >
                    <Play className="w-6 h-6 fill-current" /> Voir le Teaser
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-center xl:justify-end">
              <div className="w-full max-w-[500px] animate-float">
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
      <section className="relative z-20 -mt-24 container mx-auto px-4 mb-32">
        <div className="glass-card rounded-[4rem] p-12 md:p-16 border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-16">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-4 group">
                <div className={cn("p-6 rounded-[2rem] group-hover:scale-110 transition-all duration-500 border border-white/5", stat.bg, stat.color)}>
                  <stat.icon className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-4xl md:text-6xl font-headline font-black tracking-tighter text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      {sponsors && sponsors.length > 0 && (
        <section className="py-32 bg-muted/20 border-y border-white/5 overflow-hidden">
          <div className="container mx-auto px-4 mb-16 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Le Standard Elite</h2>
              <p className="text-3xl font-headline font-bold uppercase">Soutenus par les meilleurs</p>
            </div>
            <Link href="/sponsors">
              <Button variant="ghost" className="uppercase font-black tracking-widest text-[10px] gap-2 hover:bg-primary/10 hover:text-primary transition-all">
                Devenir Partenaire <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="relative flex overflow-x-hidden group">
            <div className="animate-marquee flex whitespace-nowrap gap-32 items-center py-8">
              {sponsors.map((s: any) => (
                <div key={s.id} className="w-56 h-32 flex items-center justify-center shrink-0 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700 p-6 glass-card rounded-3xl border-transparent hover:border-primary/20">
                  <img src={s.logoUrl} alt={s.name} className="max-w-full max-h-full object-contain" />
                </div>
              ))}
              {/* Duplication pour le défilement infini */}
              {sponsors.map((s: any) => (
                <div key={`${s.id}-dup`} className="w-56 h-32 flex items-center justify-center shrink-0 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700 p-6 glass-card rounded-3xl border-transparent hover:border-primary/20">
                  <img src={s.logoUrl} alt={s.name} className="max-w-full max-h-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden bg-black border-none ring-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Teaser Vidéo OneCup 2026</DialogTitle>
            <DialogDescription>Vidéo de présentation de l'événement.</DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full">
            <iframe
              src={heroVideoUrl ? `https://www.youtube.com/embed/${heroVideoUrl.split('v=')[1] || heroVideoUrl.split('/').pop()}?autoplay=1&modestbranding=1&rel=0` : ""}
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

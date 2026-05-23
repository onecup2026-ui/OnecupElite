
"use client";

import Image from "next/image";
import { Trophy, Users, Zap, Gamepad2, Target, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AboutPage() {
  const trophyImage = PlaceHolderImages.find(img => img.id === 'hero-bg')?.imageUrl || "https://picsum.photos/seed/ball-trophy-prestige/1920/1080";

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-32 bg-primary text-white overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
          <Badge className="bg-white text-primary font-bold uppercase py-2 px-6 rounded-full text-xs tracking-widest">NOTRE VISION</Badge>
          <h1 className="text-6xl md:text-8xl font-headline font-bold uppercase tracking-tighter leading-none">RÉVOLUTIONNER <br/><span className="text-white/50">LE SPORT CONGOLAIS.</span></h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/80 font-medium">
            OneCup Elite est bien plus qu'une série de tournois. C'est le catalyseur des talents de demain, unissant le prestige du football réel à l'innovation de l'e-sport.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      </section>

      {/* Philosophy */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6 group">
              <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-headline font-bold uppercase tracking-tight">Prestige Football</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">Nous offrons au football local une plateforme de standard international, valorisant chaque tacle, chaque but et chaque talent brut.</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-headline font-bold uppercase tracking-tight">Elite PlayStation</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">L'e-sport n'est pas un loisir, c'est une discipline. Nous professionnalisons la scène PlayStation pour révéler les génies tactiques de la manette.</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-headline font-bold uppercase tracking-tight">Innovation Live</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">Streaming HD, statistiques avancées et couverture média totale. Nous transformons chaque match en un spectacle inoubliable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 bg-card/30 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
              <Image 
                src={trophyImage} 
                alt="Ambition OneCup" 
                fill 
                className="object-cover"
                data-ai-hint="soccer winner trophy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-10 left-10 p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
                <p className="text-white text-sm font-bold uppercase tracking-widest">LE STANDARD ELITE</p>
                <p className="text-white/80 text-xs mt-1">Équité • Passion • Excellence</p>
              </div>
            </div>
            <div className="space-y-10">
              <div className="space-y-6">
                <h2 className="text-5xl font-headline font-bold uppercase tracking-tighter leading-none">UNE PLATEFORME <br/><span className="text-primary">SANS LIMITES.</span></h2>
                <p className="text-muted-foreground text-xl leading-relaxed">
                  OneCup Elite est née d'un constat simple : le talent sportif en RDC est immense, mais manque de visibilité. En créant un écosystème hybride qui combine la ferveur des stades et la précision des tournois e-sportifs sur PlayStation, nous offrons une rampe de lancement unique pour tous les passionnés.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="p-8 bg-background rounded-3xl border border-white/5 shadow-xl">
                  <p className="text-5xl font-headline font-bold text-primary tracking-tighter">100%</p>
                  <p className="text-xs uppercase font-bold text-muted-foreground mt-2 tracking-widest">Engagement Élite</p>
                </div>
                <div className="p-8 bg-background rounded-3xl border border-white/5 shadow-xl">
                  <p className="text-5xl font-headline font-bold text-primary tracking-tighter">0.0</p>
                  <p className="text-xs uppercase font-bold text-muted-foreground mt-2 tracking-widest">Compromis Qualité</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

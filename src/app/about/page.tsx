
"use client";

import Image from "next/image";
import { Trophy, Users, Zap, Star, Shield, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-24 bg-primary text-white overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center space-y-6">
          <Badge className="bg-white text-primary font-bold uppercase py-1 px-4">NOTRE MISSION</Badge>
          <h1 className="text-5xl md:text-7xl font-headline font-bold uppercase tracking-tighter">ÉLEVER LE JEU.</h1>
          <p className="text-xl max-w-2xl mx-auto text-white/80">
            OneCup Elite est née de la volonté de professionnaliser et de magnifier le sport compétitif en République Démocratique du Congo.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </section>

      {/* Values */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Trophy className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-2xl font-headline font-bold uppercase">Excellence</h3>
              <p className="text-muted-foreground">Nous visons le plus haut standard dans l'organisation de nos tournois, de l'infrastructure à la diffusion.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-2xl font-headline font-bold uppercase">Communauté</h3>
              <p className="text-muted-foreground">OneCup est un lieu de rassemblement. Nous croyons au pouvoir du sport pour unir et inspirer la jeunesse.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Zap className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-2xl font-headline font-bold uppercase">Innovation</h3>
              <p className="text-muted-foreground">Nous intégrons les meilleures technologies (IA, Live Streaming, Statistiques) pour une expérience immersive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-card/30 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="https://picsum.photos/seed/vision/800/800" 
                alt="Vision OneCup" 
                fill 
                className="object-cover"
                data-ai-hint="stadium crowd"
              />
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-headline font-bold uppercase">UNE VISION PANAFRICAINE</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Ce qui a commencé comme un simple tournoi local est devenu une plateforme de référence. OneCup Elite ne se contente pas d'organiser des matchs ; nous créons des carrières. En mettant en lumière les talents bruts dans un environnement professionnel, nous ouvrons les portes des ligues internationales.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-background rounded-2xl border border-white/5">
                  <p className="text-3xl font-headline font-bold text-primary">2023</p>
                  <p className="text-xs uppercase font-bold text-muted-foreground">Année de Fondation</p>
                </div>
                <div className="p-6 bg-background rounded-2xl border border-white/5">
                  <p className="text-3xl font-headline font-bold text-primary">50k+</p>
                  <p className="text-xs uppercase font-bold text-muted-foreground">Fans Engagés</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

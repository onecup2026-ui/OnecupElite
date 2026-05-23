
"use client";

import Image from "next/image";
import Link from "next/link";
import { Music, Ticket, Star, MapPin, Calendar, ArrowRight, Sparkles, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AfterCupPage() {
  const afterCupImage = PlaceHolderImages.find(img => img.id === 'after-cup')?.imageUrl || "https://picsum.photos/seed/onecup-after/1600/900";

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={afterCupImage}
            alt="After Cup Festival"
            fill
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <Badge variant="outline" className="border-secondary text-secondary px-4 py-1 rounded-full bg-secondary/10 font-bold uppercase tracking-widest animate-bounce">
              LE FINAL ÉPIQUE
            </Badge>
            <h1 className="text-6xl md:text-8xl font-headline font-bold leading-none tracking-tighter uppercase text-white drop-shadow-2xl">
              AFTER <span className="text-secondary">CUP</span> 2026
            </h1>
            <p className="text-xl md:text-2xl text-white font-body max-w-2xl mx-auto drop-shadow-md">
              Célébrez la victoire, vibrez au rythme des meilleurs DJs et vivez une expérience immersive unique pour clôturer la OneCup Elite.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/tickets">
                <Button size="lg" className="h-14 px-10 bg-secondary hover:bg-secondary/90 glow-blue text-lg gap-2 uppercase font-bold">
                  Réserver mon Pass Festival <Ticket className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center">
                <Music className="text-secondary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-headline font-bold uppercase">Line-up Explosif</h3>
              <p className="text-muted-foreground">Une sélection de DJs internationaux et d'artistes locaux pour une ambiance électrique jusqu'à l'aube.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="text-secondary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-headline font-bold uppercase">Show Immersif</h3>
              <p className="text-muted-foreground">Effets pyrotechniques, jeux de lumières lasers et mapping 3D pour une immersion totale.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center">
                <PartyPopper className="text-secondary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-headline font-bold uppercase">Zone VIP</h3>
              <p className="text-muted-foreground">Espaces lounges exclusifs, service premium et rencontres avec les athlètes de la OneCup.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Details & CTA */}
      <section className="py-24 bg-card/30 border-y border-white/5">
        <div className="container mx-auto px-4">
          <Card className="bg-card border-secondary/30 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-12 space-y-8 flex flex-col justify-center">
                <div className="space-y-4">
                  <h2 className="text-4xl font-headline font-bold uppercase">NE MANQUEZ PAS LE FINAL.</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    L'After Cup n'est pas qu'une simple fête, c'est le point culminant de l'engagement, du sport et de la communauté. Retrouvez tous les participants, fans et partenaires dans un cadre grandiose.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-secondary w-5 h-5" />
                    <span className="font-bold uppercase tracking-wider">Samedi 15 Juillet 2026 - 22h00</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-secondary w-5 h-5" />
                    <span className="font-bold uppercase tracking-wider">OneCup Arena - Main Plaza</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/tickets">
                    <Button className="w-full md:w-auto h-14 px-12 bg-secondary hover:bg-secondary/90 glow-blue uppercase font-bold text-lg gap-2">
                      Accéder à la billetterie After Cup <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative min-h-[400px] hidden lg:block">
                <Image
                  src="https://picsum.photos/seed/festival-vibe/800/800"
                  alt="Festival Atmosphere"
                  fill
                  className="object-cover"
                  data-ai-hint="festival lights"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

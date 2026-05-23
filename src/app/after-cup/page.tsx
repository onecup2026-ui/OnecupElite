
"use client";

import Image from "next/image";
import Link from "next/link";
import { Music, Ticket, Star, MapPin, Calendar, ArrowRight, Sparkles, PartyPopper, Trophy, Camera, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AfterCupPage() {
  const afterCupImage = PlaceHolderImages.find(img => img.id === 'after-cup')?.imageUrl || "https://picsum.photos/seed/onecup-after/1600/900";

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
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
            <Badge variant="outline" className="border-secondary text-secondary px-6 py-2 rounded-full bg-secondary/10 font-bold uppercase tracking-[0.3em] text-xs animate-pulse">
              L'APOTHÉOSE FINALE
            </Badge>
            <h1 className="text-7xl md:text-9xl font-headline font-bold leading-none tracking-tighter uppercase text-white drop-shadow-2xl">
              AFTER <span className="text-secondary">CUP</span> 2026
            </h1>
            <p className="text-xl md:text-2xl text-white font-body max-w-2xl mx-auto drop-shadow-md font-medium">
              Samedi 25 Juillet : Célébrez la victoire, vibrez au rythme de l'Elite et assistez au sacre des champions.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Link href="/tickets">
                <Button size="lg" className="h-16 px-12 bg-secondary hover:bg-secondary/90 glow-blue text-lg gap-3 uppercase font-bold rounded-2xl">
                  Réserver mon Pass Festival <Ticket className="w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ceremony Schedule */}
      <section className="py-24 bg-background relative z-10 -mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="bg-card border-white/5 p-8 md:p-12 shadow-2xl space-y-8 rounded-[2.5rem]">
              <div className="space-y-2">
                <h2 className="text-3xl font-headline font-bold uppercase">PROGRAMME DU 25 JUILLET</h2>
                <p className="text-muted-foreground">Une journée historique pour clôturer la ONECUP 2026.</p>
              </div>
              
              <div className="space-y-6">
                {[
                  { time: "12:00 - 14:00", label: "Animations et ambiance musicale", icon: Music },
                  { time: "14:00 - 15:30", label: "Activités et invités spéciaux", icon: Star },
                  { time: "15:30 - 17:00", label: "Contenus médias et échanges", icon: Camera },
                  { time: "17:00 - 18:30", label: "CÉRÉMONIE DE REMISE DES TROPHÉES", icon: Trophy, featured: true },
                  { time: "18:30 - 20:00", label: "Photos officielles et interviews", icon: Users },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-6 p-4 rounded-2xl transition-all ${item.featured ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.featured ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary uppercase">{item.time}</p>
                      <h4 className={`font-bold uppercase ${item.featured ? 'text-lg text-foreground' : 'text-sm text-muted-foreground'}`}>{item.label}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-8">
              <div className="bg-secondary/10 border border-secondary/20 rounded-[2.5rem] p-10 space-y-6">
                <Trophy className="w-16 h-16 text-secondary mb-4" />
                <h3 className="text-3xl font-headline font-bold uppercase">LES DISTINCTIONS ÉLITE</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Au-delà du trophée de Champion, nous honorons l'excellence individuelle et collective :
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["Champion ONECUP", "Finaliste", "Troisième place", "Meilleur Joueur", "Meilleur Buteur", "Meilleur Gardien", "Prix Fair-Play", "Prix Révélation"].map((award) => (
                    <li key={award} className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight">
                      <Sparkles className="w-4 h-4 text-secondary" /> {award}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl group">
                <Image
                  src="https://picsum.photos/seed/festival-vibe/800/800"
                  alt="Festival Atmosphere"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint="festival lights"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                  <p className="text-white font-bold uppercase tracking-widest text-xs mb-2">Prestige & Emotion</p>
                  <h4 className="text-white text-2xl font-headline font-bold uppercase">UNE FINALE INOUBLIABLE</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-card/30 border-y border-white/5">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-headline font-bold uppercase max-w-4xl mx-auto">VIVEZ L'HISTOIRE EN DIRECT.</h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Rejoignez-nous le 25 juillet pour célébrer la fin d'une aventure humaine et sportive hors du commun. 
            Les places sont limitées pour la cérémonie de clôture.
          </p>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <MapPin className="text-secondary w-6 h-6" />
              <span className="font-bold uppercase tracking-widest text-sm">ONE CUP ARENA - MAIN PLAZA</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-secondary w-6 h-6" />
              <span className="font-bold uppercase tracking-widest text-sm">SAMEDI 25 JUILLET 2026</span>
            </div>
          </div>
          <Link href="/tickets" className="inline-block mt-8">
            <Button size="lg" className="h-16 px-16 bg-secondary hover:bg-secondary/90 glow-blue uppercase font-bold text-lg rounded-2xl gap-3">
              Acheter mon ticket <ArrowRight className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

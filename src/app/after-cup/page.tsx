"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Music, Star, MapPin, Calendar, Sparkles, Trophy, Camera, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

const OFFICIAL_TICKET_URL = "https://digitaleventcd.vercel.app/";

export default function AfterCupPage() {
  const db = useFirestore();
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const { data: siteConfig } = useDoc(configRef);

  const defaultAfterCup = PlaceHolderImages.find(img => img.id === 'after-cup')?.imageUrl || "https://picsum.photos/seed/onecup-after/1600/900";
  const afterCupImage = siteConfig?.afterCupImageUrl || defaultAfterCup;

  return (
    <div className="flex flex-col">
      {/* Immersive Hero Section */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <Image
            src={afterCupImage}
            alt="After Cup Festival"
            fill
            className="object-contain lg:object-cover opacity-60 animate-in fade-in duration-1000"
            priority
            data-ai-hint="festival lights"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 duration-700">
            <Badge variant="outline" className="border-secondary text-secondary px-8 py-2 rounded-full bg-secondary/10 font-black uppercase tracking-[0.4em] text-xs">
              L'APOTHÉOSE FINALE
            </Badge>
            <h1 className="text-6xl md:text-9xl font-headline font-black leading-none tracking-tighter uppercase text-white drop-shadow-2xl">
              AFTER <span className="text-secondary">CUP</span> 2026
            </h1>
            <p className="text-xl md:text-3xl text-white font-medium max-w-2xl mx-auto drop-shadow-md">
              Vibrez au rythme de l'Elite. Célébrez la victoire, assistez au sacre des champions.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-10">
              <a href={OFFICIAL_TICKET_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="h-20 px-12 bg-secondary hover:bg-secondary/90 glow-blue text-xl gap-3 uppercase font-black rounded-2xl shadow-2xl">
                  Réserver mon Pass Festival <ExternalLink className="w-6 h-6" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Ceremony Schedule */}
      <section className="py-32 bg-background relative z-10 -mt-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <Card className="bg-card border-white/5 p-10 md:p-16 shadow-2xl space-y-12 rounded-[3rem]">
              <div className="space-y-4">
                <h2 className="text-4xl font-headline font-black uppercase tracking-tight">PROGRAMME OFFICIEL</h2>
                <p className="text-muted-foreground text-lg">Une journée historique pour clôturer la saison ONECUP 2026.</p>
              </div>
              
              <div className="space-y-8">
                {[
                  { time: "12:00 - 14:00", label: "Animations & Warm-up DJ", icon: Music },
                  { time: "14:00 - 15:30", label: "Showcase Invités Spéciaux", icon: Star },
                  { time: "15:30 - 17:00", label: "Contenus Médias & Backstage", icon: Camera },
                  { time: "17:00 - 18:30", label: "CÉRÉMONIE DE REMISE DES TROPHÉES", icon: Trophy, featured: true },
                  { time: "18:30 - 20:00", label: "Photos Officielles & Interviews", icon: Users },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-8 p-6 rounded-[2rem] transition-all ${item.featured ? 'bg-primary/10 border border-primary/20 scale-105 shadow-lg' : 'hover:bg-muted/50'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.featured ? 'bg-primary text-white shadow-lg' : 'bg-muted text-muted-foreground'}`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-primary uppercase tracking-widest">{item.time}</p>
                      <h4 className={`font-black uppercase tracking-tight ${item.featured ? 'text-2xl text-foreground' : 'text-lg text-muted-foreground'}`}>{item.label}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-12">
              <div className="bg-secondary/10 border border-secondary/20 rounded-[3rem] p-12 md:p-16 space-y-8 shadow-inner">
                <Trophy className="w-20 h-20 text-secondary mb-4" />
                <h3 className="text-4xl font-headline font-black uppercase tracking-tight">DISTINCTIONS ÉLITE</h3>
                <p className="text-muted-foreground text-xl leading-relaxed font-medium">
                  Au-delà du titre suprême, nous honorons l'excellence et le talent brut :
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  {["Champion ONECUP", "Finaliste Elite", "Médaillé de Bronze", "MVP du Tournoi", "Meilleur Buteur", "Gant d'Or", "Prix Fair-Play", "Prix Révélation"].map((award) => (
                    <li key={award} className="flex items-center gap-3 text-sm font-black uppercase tracking-tighter">
                      <Sparkles className="w-5 h-5 text-secondary animate-pulse" /> {award}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-white/10">
                <Image
                  src="https://picsum.photos/seed/festival-vibe/1200/800"
                  alt="Festival Atmosphere"
                  fill
                  className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                  data-ai-hint="festival lights"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-12">
                  <p className="text-white font-black uppercase tracking-[0.4em] text-xs mb-3">Prestige & Emotion</p>
                  <h4 className="text-white text-3xl font-headline font-black uppercase">UNE FINALE LÉGENDAIRE</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-card/30 border-y border-white/5 overflow-hidden relative">
        <div className="container mx-auto px-4 text-center space-y-10 relative z-10">
          <h2 className="text-5xl md:text-8xl font-headline font-black uppercase max-w-5xl mx-auto tracking-tighter leading-none">VIVEZ L'HISTOIRE <br/><span className="text-secondary">EN DIRECT.</span></h2>
          <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
            Rejoignez-nous le 25 juillet pour célébrer la fin d'une aventure humaine et sportive hors du commun. 
            Places très limitées pour la cérémonie.
          </p>
          <div className="flex justify-center items-center gap-10 flex-wrap pt-6">
            <div className="flex items-center gap-4 bg-muted/50 px-8 py-4 rounded-2xl border">
              <MapPin className="text-secondary w-8 h-8" />
              <span className="font-black uppercase tracking-[0.2em] text-sm">ONE CUP ARENA - MAIN PLAZA</span>
            </div>
            <div className="flex items-center gap-4 bg-muted/50 px-8 py-4 rounded-2xl border">
              <Calendar className="text-secondary w-8 h-8" />
              <span className="font-black uppercase tracking-[0.2em] text-sm">SAMEDI 25 JUILLET 2026</span>
            </div>
          </div>
          <div className="inline-block mt-12">
            <a href={OFFICIAL_TICKET_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="h-20 px-20 bg-secondary hover:bg-secondary/90 glow-blue uppercase font-black text-xl rounded-2xl gap-4 shadow-2xl transition-transform hover:scale-105">
                Acheter mon ticket <ExternalLink className="w-6 h-6" />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

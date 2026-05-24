
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Search, Calendar, MapPin, ArrowRight, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function TournamentsPage() {
  const db = useFirestore();
  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const { data: tournaments, loading } = useCollection(tournamentsRef);
  
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return tournaments?.filter((t: any) => {
      return t.name.toLowerCase().includes(search.toLowerCase());
    }) || [];
  }, [tournaments, search]);

  return (
    <div className="container mx-auto px-4 py-20 space-y-20">
      <header className="space-y-6 text-center max-w-4xl mx-auto">
        <Badge variant="outline" className="border-primary/50 text-primary px-6 py-2 rounded-full glass-card font-black uppercase tracking-[0.4em] text-[10px]">
          Saison Officielle 2026
        </Badge>
        <h1 className="text-6xl md:text-8xl font-headline font-black uppercase tracking-tighter leading-none">
          L'ÉLITE <br/><span className="text-primary">EN COMPÉTITION</span>
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto">
          Choisissez votre discipline, formez votre équipe et gravez votre nom dans l'histoire de la OneCup.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-center sticky top-24 z-40 bg-background/50 backdrop-blur-3xl py-8 px-6 rounded-[3rem] border border-white/5 shadow-2xl max-w-4xl mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/50" />
          <Input
            placeholder="Rechercher un tournoi (Foot, PS5...)"
            className="pl-16 h-16 glass-card border-none rounded-[1.5rem] shadow-none text-xl font-bold placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filtered.map((t: any) => (
          <div key={t.id} className="group glass-card rounded-[3rem] overflow-hidden hover:border-primary/50 transition-all duration-700 flex flex-col h-full shadow-xl hover:shadow-[0_64px_128px_-32px_rgba(0,0,0,0.6)] hover:-translate-y-4">
            <div className="relative aspect-[16/11] overflow-hidden">
              <Image
                src={t.imageUrl || "https://picsum.photos/seed/onecup/800/600"}
                alt={t.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
              <div className="absolute top-6 left-6 flex gap-2">
                <Badge className="bg-primary/90 backdrop-blur-md border-none font-black uppercase px-5 py-2 rounded-full shadow-2xl text-[10px] tracking-widest">
                  {t.gameType}
                </Badge>
                {t.teamsRegistered >= (t.maxTeams || 16) && (
                  <Badge className="bg-destructive/90 backdrop-blur-md border-none font-black uppercase px-5 py-2 rounded-full shadow-2xl text-[10px] tracking-widest">
                    Complet
                  </Badge>
                )}
              </div>
              <div className="absolute bottom-6 left-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                <span className="text-[10px] font-black uppercase text-white tracking-[0.2em] drop-shadow-md">Live Registration</span>
              </div>
            </div>
            
            <div className="p-10 flex flex-col flex-1 space-y-8">
              <h3 className="text-3xl font-headline font-black uppercase leading-[0.9] tracking-tighter transition-colors group-hover:text-primary">{t.name}</h3>
              
              <div className="grid grid-cols-1 gap-5">
                <div className="flex items-center gap-4 group/item">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-all group-hover/item:bg-primary group-hover/item:text-white">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Date</span>
                    <span className="font-bold text-sm">{t.startDate ? new Date(t.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Juillet 2026"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-all group-hover/item:bg-primary group-hover/item:text-white">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Lieu</span>
                    <span className="font-bold text-sm">{t.locationStade || "OneCup Arena"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-auto">
                <Link href={`/tournaments/${t.id}`}>
                  <Button className="w-full h-16 gap-4 bg-primary hover:bg-primary/90 glow-blue transition-all uppercase font-black text-xs rounded-2xl group-hover:scale-[1.02]">
                    DÉTAILS DU TOURNOI <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-40 glass-card rounded-[4rem] border-dashed border-white/10">
          <Flame className="w-20 h-20 text-primary/20 mx-auto mb-6 animate-pulse" />
          <h3 className="text-3xl font-headline font-black uppercase tracking-tighter">L'arène est vide</h3>
          <p className="text-muted-foreground text-lg mt-4">Aucun tournoi ne correspond à votre recherche pour le moment.</p>
          <Button onClick={() => setSearch("")} variant="link" className="mt-6 text-primary font-black uppercase tracking-widest text-[10px]">
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}

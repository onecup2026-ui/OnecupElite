
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Search, Calendar, MapPin, ArrowRight, Zap } from "lucide-react";
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
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4 text-center max-w-4xl mx-auto">
        <Badge variant="outline" className="border-primary text-primary font-bold uppercase tracking-widest">ÉDITION ONECUP 2026</Badge>
        <h1 className="text-5xl md:text-7xl font-headline font-bold uppercase tracking-tighter">TOURNNOIS <span className="text-primary">OFFICIELS</span></h1>
        <p className="text-muted-foreground text-xl">
          Découvrez toutes les compétitions de la saison OneCup. Choisissez votre tournoi et rejoignez l'élite.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-center sticky top-16 z-40 bg-background/80 backdrop-blur py-6 border-b border-white/5">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un tournoi (Foot, PlayStation...)"
            className="pl-12 h-14 bg-card border-white/10 rounded-2xl shadow-sm text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((t: any) => (
          <div key={t.id} className="group bg-card border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-2xl">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={t.imageUrl || "https://picsum.photos/seed/onecup/800/600"}
                alt={t.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <Badge className="absolute top-6 left-6 bg-primary glow-blue border-none font-bold uppercase px-4 py-1.5 rounded-full shadow-lg">
                {t.gameType}
              </Badge>
            </div>
            
            <div className="p-8 flex flex-col flex-1 space-y-6">
              <h3 className="text-2xl font-headline font-bold uppercase leading-tight tracking-tighter">{t.name}</h3>
              
              <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground font-medium">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar className="w-4 h-4" />
                  </div>
                  {t.startDate ? new Date(t.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : "Juillet 2026"}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="w-4 h-4" />
                  </div>
                  {t.locationStade || "OneCup Arena"}
                </div>
              </div>

              <div className="pt-4 mt-auto">
                <Link href={`/tournaments/${t.id}`}>
                  <Button className="w-full h-14 gap-3 bg-primary glow-blue transition-all uppercase font-black text-sm rounded-2xl">
                    Participer <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-32 border border-dashed border-white/10 rounded-[3rem] bg-card/30">
          <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold uppercase tracking-widest text-muted-foreground">Aucun tournoi trouvé</h3>
          <p className="text-muted-foreground mt-2">Réessayez avec un autre mot-clé.</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";

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
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12 space-y-4">
        <h1 className="text-4xl font-bold uppercase tracking-tight">Les Tournois OneCup</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Découvrez toutes nos compétitions sportives et e-sportives prévues pour la saison 2026.
        </p>
      </header>

      {/* Simplified Filter Bar */}
      <div className="mb-10 flex items-center max-w-md bg-white border rounded-lg p-1 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <div className="pl-3 text-muted-foreground">
          <Search className="w-5 h-5" />
        </div>
        <Input
          placeholder="Rechercher un tournoi..."
          className="border-none focus-visible:ring-0 text-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-xl" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((t: any) => (
            <div key={t.id} className="flex flex-col border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
              <div className="relative aspect-video">
                <Image
                  src={t.imageUrl || "https://picsum.photos/seed/tournament/800/600"}
                  alt={t.name}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 text-primary hover:bg-white font-bold px-3 py-1">
                  {t.gameType}
                </Badge>
              </div>
              
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold uppercase leading-tight">{t.name}</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{t.startDate ? new Date(t.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : "Prochainement"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{t.locationStade || "OneCup Arena"}</span>
                  </div>
                </div>

                <div className="pt-4 mt-auto">
                  <Link href={`/tournaments/${t.id}`}>
                    <Button className="w-full font-bold h-11" variant="outline">
                      En savoir plus <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-slate-50">
            <h3 className="text-xl font-bold uppercase mb-2">Aucun tournoi trouvé</h3>
            <p className="text-muted-foreground">Essayez un autre mot-clé ou réinitialisez votre recherche.</p>
            <Button onClick={() => setSearch("")} variant="link" className="mt-4 text-primary">
              Voir tous les tournois
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
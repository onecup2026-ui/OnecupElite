
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Calendar, Trophy, ArrowRight, ChevronRight } from "lucide-react";
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

  const featuredTournament = filtered.find((t: any) => t.isFeatured) || filtered[0];
  const otherTournaments = filtered.filter(t => t.id !== featuredTournament?.id);

  return (
    <div className="bg-[#f3f3f3] min-h-screen">
      {/* FIFA-style Hero Banner */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              <h1 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter text-slate-900 leading-none">
                COMPÉTITIONS <br/><span className="text-primary">ONECUP ELITE</span>
              </h1>
            </div>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
              Découvrez le sommet du football et de l'e-sport en RDC. Suivez le calendrier des tournois qui définissent l'excellence.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Search & Filter Bar (FIFA style) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-4 rounded-2xl shadow-sm border">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Rechercher une compétition..."
              className="pl-12 h-12 bg-slate-50 border-none rounded-xl text-base font-bold placeholder:font-medium focus-visible:ring-2 focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {["Tous", "Football", "PlayStation"].map((cat) => (
              <Button key={cat} variant="ghost" className="rounded-full px-6 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-100">
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Tournament (If any) */}
        {featuredTournament && !search && (
          <div className="group relative rounded-[2.5rem] overflow-hidden bg-slate-900 aspect-[16/9] md:aspect-[21/9] min-h-[300px] shadow-2xl">
            <Image
              src={featuredTournament.imageUrl || "https://picsum.photos/seed/fifa-featured/1600/900"}
              alt={featuredTournament.name}
              fill
              className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-[3s]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 md:p-16 space-y-4 max-w-3xl">
              <Badge className="bg-primary px-4 py-1.5 font-black uppercase tracking-[0.2em] text-[10px] rounded-full">COMPÉTITION PHARE</Badge>
              <h2 className="text-3xl md:text-6xl font-headline font-black text-white uppercase tracking-tighter leading-none">
                {featuredTournament.name}
              </h2>
              <div className="flex flex-wrap items-center gap-6 text-white/80 font-bold uppercase text-xs tracking-widest">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {featuredTournament.locationStade}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {featuredTournament.startDate ? new Date(featuredTournament.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : "À venir"}</div>
              </div>
              <Link href={`/tournaments/${featuredTournament.id}`} className="inline-block pt-4">
                <Button size="lg" className="h-14 px-10 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-black uppercase text-xs gap-3">
                  Voir les détails <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-[450px] bg-white animate-pulse rounded-[2rem] border shadow-sm" />
            ))
          ) : filtered.length > 0 ? (
            (search ? filtered : otherTournaments).map((t: any) => (
              <Link href={`/tournaments/${t.id}`} key={t.id} className="group">
                <div className="flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={t.imageUrl || "https://picsum.photos/seed/tournament/800/600"}
                      alt={t.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Badge className="absolute top-6 left-6 bg-white/95 text-slate-900 font-black px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-lg shadow-lg">
                      {t.gameType}
                    </Badge>
                  </div>
                  
                  <div className="p-8 space-y-6 flex-1 flex flex-col">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-slate-900 leading-tight group-hover:text-primary transition-colors">
                        {t.name}
                      </h3>
                      <div className="h-1 w-12 bg-slate-100 group-hover:w-full group-hover:bg-primary/20 transition-all duration-500 rounded-full" />
                    </div>
                    
                    <div className="space-y-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{t.startDate ? new Date(t.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Prochainement"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{t.locationStade || "OneCup Arena"}</span>
                      </div>
                    </div>

                    <div className="pt-6 mt-auto border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Consulter l'événement</span>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-24 text-center border-2 border-dashed rounded-[3rem] bg-white">
              <Trophy className="w-20 h-20 text-slate-200 mx-auto mb-6" />
              <h3 className="text-2xl font-headline font-black uppercase text-slate-900 mb-2">Aucun tournoi trouvé</h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto">Nous n'avons pas trouvé de compétition correspondant à votre recherche.</p>
              <Button onClick={() => setSearch("")} variant="link" className="mt-4 text-primary font-black uppercase tracking-widest text-xs">
                Voir toutes les compétitions
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

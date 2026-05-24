
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Calendar, Trophy, ArrowRight, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function TournamentsPage() {
  const db = useFirestore();
  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const { data: tournaments, loading } = useCollection(tournamentsRef);
  
  const [search, setSearch] = useState("");
  const [timeLeft, setTimeLeft] = useState({ days: 18, hours: 10, minutes: 51, seconds: 31 });

  // Simulation du compte à rebours FIFA style
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        return { ...prev, seconds: 59, minutes: prev.minutes - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => {
    return tournaments?.filter((t: any) => {
      return t.name.toLowerCase().includes(search.toLowerCase());
    }) || [];
  }, [tournaments, search]);

  const featuredTournaments = useMemo(() => {
    return filtered.slice(0, 3); // On prend les 3 premiers pour le carrousel
  }, [filtered]);

  const otherTournaments = useMemo(() => {
    return filtered.slice(3);
  }, [filtered]);

  return (
    <div className="bg-[#f3f3f3] min-h-screen font-body">
      {/* FIFA Countdown Bar */}
      <div className="bg-black text-white py-2 px-4 border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Road to OneCup 2026</span>
          </div>
          <div className="flex gap-4 md:gap-8 items-center">
            {[
              { val: timeLeft.days, unit: "jours" },
              { val: timeLeft.hours, unit: "heures" },
              { val: timeLeft.minutes, unit: "minutes" },
              { val: timeLeft.seconds, unit: "secs" },
            ].map((t, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-lg md:text-2xl font-black leading-none">{t.val.toString().padStart(2, '0')}</span>
                <span className="text-[8px] uppercase font-bold text-white/60 tracking-tighter">{t.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Carousel (FIFA Style) */}
      {!search && featuredTournaments.length > 0 && (
        <section className="relative w-full bg-[#0051a3]">
          <Carousel className="w-full" opts={{ loop: true }}>
            <CarouselContent>
              {featuredTournaments.map((t: any, idx) => (
                <CarouselItem key={t.id}>
                  <div className="relative w-full aspect-[16/9] md:aspect-[21/9] min-h-[400px] flex flex-col">
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={t.imageUrl || "https://picsum.photos/seed/fifa-slide/1920/1080"}
                        alt={t.name}
                        fill
                        className="object-contain lg:object-cover"
                        priority={idx === 0}
                      />
                    </div>
                    {/* Dark Overlay for Text Visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0051a3] via-transparent to-transparent z-10" />
                    
                    <div className="container mx-auto px-4 relative z-20 mt-auto pb-12 md:pb-20 space-y-4 md:space-y-6 animate-in slide-in-from-bottom-10 duration-700">
                      <p className="text-white text-xs md:text-sm font-black uppercase tracking-widest opacity-80">
                        {t.gameType} • ONECUP ELITE 2026
                      </p>
                      <h2 className="text-3xl md:text-6xl lg:text-7xl font-headline font-black text-white uppercase tracking-tighter leading-[0.9] max-w-4xl">
                        {t.name}
                      </h2>
                      <div className="pt-2">
                        <Link href={`/tournaments/${t.id}`}>
                          <Button size="lg" className="bg-white text-[#0051a3] hover:bg-white/90 rounded-full h-12 md:h-14 px-8 md:px-12 font-black uppercase text-xs md:text-sm shadow-xl transition-transform hover:scale-105">
                            {t.startDate ? new Date(t.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Dates à venir"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="left-8 bg-white/10 border-white/20 text-white hover:bg-white/20" />
              <CarouselNext className="right-8 bg-white/10 border-white/20 text-white hover:bg-white/20" />
            </div>
          </Carousel>
        </section>
      )}

      <div className="container mx-auto px-4 py-8 md:py-16 space-y-8 md:space-y-12">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Rechercher une compétition..."
              className="pl-12 h-12 bg-slate-50 border-none rounded-xl text-base font-bold placeholder:font-medium focus-visible:ring-2 focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {["Tous", "Football", "PlayStation"].map((cat) => (
              <Button key={cat} variant="ghost" className="rounded-full px-6 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-colors">
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-[450px] bg-white animate-pulse rounded-[2.5rem] border shadow-sm" />
            ))
          ) : filtered.length > 0 ? (
            (search ? filtered : otherTournaments).map((t: any) => (
              <Link href={`/tournaments/${t.id}`} key={t.id} className="group">
                <div className="flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 h-full group-hover:-translate-y-2">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={t.imageUrl || "https://picsum.photos/seed/tournament/800/600"}
                      alt={t.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Badge className="absolute top-6 left-6 bg-white/95 text-slate-900 font-black px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-lg shadow-lg">
                      {t.gameType}
                    </Badge>
                  </div>
                  
                  <div className="p-8 space-y-6 flex-1 flex flex-col">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-slate-900 leading-[1.1] group-hover:text-primary transition-colors">
                        {t.name}
                      </h3>
                      <div className="h-1 w-12 bg-primary rounded-full group-hover:w-full transition-all duration-500" />
                    </div>
                    
                    <div className="space-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{t.startDate ? new Date(t.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Prochainement"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{t.locationStade || "OneCup Arena"}</span>
                      </div>
                    </div>

                    <div className="pt-6 mt-auto border-t border-slate-50 flex items-center justify-between group">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Détails de la compétition</span>
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

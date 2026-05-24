"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, ChevronRight, Zap, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function TournamentsPage() {
  const db = useFirestore();
  const tournamentsRef = useMemo(() => (db ? query(collection(db, "tournaments"), orderBy("createdAt", "desc")) : null), [db]);
  const { data: tournaments, loading } = useCollection(tournamentsRef);

  return (
    <div className="bg-[#f3f3f3] min-h-screen">
      {/* Immersive FIFA Header */}
      <section className="relative h-[55vh] md:h-[65vh] bg-primary overflow-hidden flex items-end pb-16 md:pb-24">
        <div className="absolute inset-0 z-0">
           <Image 
             src="https://picsum.photos/seed/fifa-competitions/1920/1080" 
             alt="Elite Competitions" 
             fill 
             className="object-cover opacity-50"
             priority
           />
           <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="animate-fifa-in space-y-6">
            <Badge className="bg-white text-primary px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
              COMPÉTITIONS OFFICIELLES
            </Badge>
            <h1 className="text-6xl md:text-9xl font-headline font-black text-white uppercase tracking-tighter leading-none">
              REJOINDRE <br/> <span className="text-white/60">L'ARÈNE.</span>
            </h1>
            <p className="text-white/80 text-xl md:text-2xl max-w-2xl font-medium">
              Découvrez les tournois qui redéfinissent l'excellence sportive. Inscrivez votre équipe et mesurez-vous aux meilleurs.
            </p>
          </div>
        </div>
      </section>

      {/* Competitions Grid */}
      <div className="container mx-auto px-4 py-20 -mt-16 md:-mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-[500px] bg-white animate-pulse rounded-[3rem] shadow-lg" />
            ))
          ) : tournaments?.map((t: any) => (
            <Link href={`/tournaments/${t.id}`} key={t.id} className="group">
              <div className="bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-slate-100 h-full flex flex-col group-hover:-translate-y-4">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={t.imageUrl || "https://picsum.photos/seed/tournament/800/600"}
                    alt={t.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-8 left-8">
                    <Badge className="bg-white/95 text-primary px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl border-none">
                      {t.gameType}
                    </Badge>
                  </div>
                  <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary fill-primary" />
                      <span className="font-black text-xs uppercase tracking-widest">{t.teamsRegistered || 0}/{t.maxTeams || 16} Équipes</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-10 space-y-8 flex-1 flex flex-col">
                  <div className="space-y-4">
                    <h3 className="text-3xl md:text-4xl font-headline font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                      {t.name}
                    </h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-slate-400">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-bold uppercase text-[10px] tracking-widest">Juillet 2026</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-bold uppercase text-[10px] tracking-widest">{t.locationStade}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
                     <span className="font-black uppercase text-xs tracking-widest text-primary">S'inscrire</span>
                     <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                        <ChevronRight className="w-6 h-6" />
                     </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {!loading && (!tournaments || tournaments.length === 0) && (
            <div className="col-span-full py-24 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
              <Trophy className="w-20 h-20 text-slate-200 mx-auto mb-6" />
              <h3 className="text-2xl font-headline font-black uppercase text-slate-400">Aucune compétition pour le moment</h3>
              <p className="text-slate-400 font-medium">Revenez bientôt pour l'annonce de la saison 2026.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
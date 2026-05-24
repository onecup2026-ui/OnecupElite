"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function TournamentsPage() {
  const db = useFirestore();
  const tournamentsRef = useMemo(() => (db ? query(collection(db, "tournaments"), orderBy("createdAt", "desc")) : null), [db]);
  const { data: tournaments, loading } = useCollection(tournamentsRef);

  return (
    <div className="bg-[#f3f3f3] min-h-screen">
      {/* Section Elite Carrousel */}
      <section className="relative h-[60vh] md:h-[70vh] bg-primary overflow-hidden flex items-end pb-20">
        <div className="absolute inset-0 opacity-40">
           <Image 
             src="https://picsum.photos/seed/fifa-bg/1920/1080" 
             alt="Elite Background" 
             fill 
             className="object-cover"
           />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="animate-fifa-in space-y-4">
            <span className="bg-white text-primary px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">A LA UNE</span>
            <h1 className="text-5xl md:text-8xl font-headline font-black text-white uppercase tracking-tighter leading-none">
              LE GRAND <br/> <span className="text-white/60">CHAMPIONNAT.</span>
            </h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-[450px] bg-white animate-pulse rounded-[2.5rem]" />
            ))
          ) : tournaments?.map((t: any) => (
            <Link href={`/tournaments/${t.id}`} key={t.id} className="group">
              <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 h-full flex flex-col group-hover:-translate-y-2">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={t.imageUrl || "https://picsum.photos/seed/tournament/800/600"}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/95 px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest text-primary shadow-lg">
                      {t.gameType}
                    </span>
                  </div>
                </div>
                <div className="p-10 space-y-6 flex-1 flex flex-col">
                  <h3 className="text-3xl font-headline font-black uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-auto flex items-center gap-2">
                    <Zap className="w-3 h-3 text-primary" /> {t.locationStade}
                  </p>
                  <div className="pt-6 border-t flex items-center justify-between">
                     <span className="font-black uppercase text-[10px] tracking-widest text-primary">Découvrir</span>
                     <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <ChevronRight />
                     </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
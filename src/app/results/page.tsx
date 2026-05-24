
"use client";

import { useMemo } from "react";
import { Trophy, Zap, AlertCircle, Loader2, ArrowRight, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function ResultsPage() {
  const db = useFirestore();

  const matchesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "matches"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: matches, loading } = useCollection(matchesQuery);

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-primary text-white py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10 space-y-4 text-center">
          <Badge className="bg-white text-primary px-6 py-2 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl">LIVE SCOREBOARD</Badge>
          <h1 className="text-5xl md:text-8xl font-headline font-black uppercase tracking-tighter leading-none">RÉSULTATS <br/><span className="text-white/40">EN DIRECT.</span></h1>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
      </header>

      <div className="container mx-auto px-4 py-16 -mt-12 relative z-20 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[3rem] shadow-xl">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Mise à jour des scores...</p>
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {matches.map((match: any) => (
              <Card key={match.id} className="bg-white border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-[3rem]">
                <CardHeader className="bg-slate-50/50 py-6 px-10 flex flex-row items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="h-8 w-8 rounded-full p-0 flex items-center justify-center font-black border-primary text-primary text-[10px]">#{match.matchNumber || 1}</Badge>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{match.tournamentName || "Tournoi Elite"}</span>
                  </div>
                  <Badge className={match.status === "En Cours" ? "bg-red-500" : "bg-slate-900"}>
                    <span className="font-black uppercase text-[9px] tracking-widest">{match.status}</span>
                  </Badge>
                </CardHeader>
                <CardContent className="p-10 md:p-16">
                  <div className="flex items-center justify-between gap-8">
                    <div className="flex flex-col items-center gap-6 flex-1 text-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center font-headline font-black text-4xl border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                        {match.team1Id?.[0] || "A"}
                      </div>
                      <span className="font-black uppercase text-sm tracking-tight text-slate-900">{match.team1Id}</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="text-6xl md:text-8xl font-headline font-black text-primary tabular-nums tracking-tighter leading-none">
                        {match.scoreTeam1} : {match.scoreTeam2}
                      </div>
                      <Badge variant="outline" className="border-none text-slate-300 font-black text-[10px] uppercase tracking-[0.5em]">Score</Badge>
                    </div>

                    <div className="flex flex-col items-center gap-6 flex-1 text-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center font-headline font-black text-4xl border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                        {match.team2Id?.[0] || "B"}
                      </div>
                      <span className="font-black uppercase text-sm tracking-tight text-slate-900">{match.team2Id}</span>
                    </div>
                  </div>

                  {match.status === "Terminé" && match.winnerId && (
                    <div className="mt-12 pt-10 border-t border-slate-100 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.4em] mb-4">Qualifié</p>
                      <div className="inline-flex items-center gap-4 bg-primary/5 px-8 py-3 rounded-2xl text-primary font-black uppercase text-xl shadow-inner">
                        <Trophy className="w-6 h-6 animate-bounce" />
                        <span>{match.winnerId}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[4rem] shadow-xl border-none space-y-6">
            <Search className="w-24 h-24 text-slate-100 mx-auto" />
            <h3 className="text-2xl font-headline font-black uppercase text-slate-400">Aucun match enregistré</h3>
          </div>
        )}
      </div>
    </div>
  );
}

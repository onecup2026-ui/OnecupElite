
"use client";

import { useMemo } from "react";
import { Trophy, Zap, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function ResultsPage() {
  const db = useFirestore();

  const matchesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "matches"), orderBy("matchNumber", "asc"));
  }, [db]);

  const { data: matches, loading } = useCollection(matchesQuery);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4 text-center max-w-3xl mx-auto">
        <Badge variant="outline" className="border-primary text-primary px-3 py-1 font-bold">LIVE SCOREBOARD</Badge>
        <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter uppercase">PROGRESSION <span className="text-primary">ONECUP</span></h1>
        <p className="text-muted-foreground text-xl">
          Suivez la route vers la gloire. Chaque match, chaque but nous rapproche du sacre final.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground italic font-medium">Synchronisation des scores en cours...</p>
        </div>
      ) : matches && matches.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {matches.map((match: any) => (
            <Card key={match.id} className="bg-card border-white/5 hover:border-primary/20 transition-all overflow-hidden shadow-xl rounded-[2rem]">
              <CardHeader className="bg-muted/10 py-4 px-8 flex flex-row items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="h-7 w-7 rounded-full p-0 flex items-center justify-center font-black border-primary text-primary">#{match.matchNumber}</Badge>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{match.tournamentName}</span>
                </div>
                <Badge variant={match.status === "En Cours" ? "destructive" : "secondary"} className="text-[10px] font-bold uppercase tracking-widest px-3">
                  {match.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex flex-col items-center gap-4 flex-1">
                    <div className="w-20 h-20 bg-muted/30 rounded-2xl flex items-center justify-center font-headline font-bold text-3xl border border-white/5 group-hover:scale-105 transition-transform">
                      {match.team1Id?.[0] || "A"}
                    </div>
                    <span className="font-bold uppercase text-center text-xs tracking-tight">{match.team1Id}</span>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="text-5xl md:text-6xl font-headline font-bold text-primary tabular-nums tracking-tighter">
                      {match.scoreTeam1} : {match.scoreTeam2}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">Score</span>
                  </div>

                  <div className="flex flex-col items-center gap-4 flex-1">
                    <div className="w-20 h-20 bg-muted/30 rounded-2xl flex items-center justify-center font-headline font-bold text-3xl border border-white/5 group-hover:scale-105 transition-transform">
                      {match.team2Id?.[0] || "B"}
                    </div>
                    <span className="font-bold uppercase text-center text-xs tracking-tight">{match.team2Id}</span>
                  </div>
                </div>

                {match.status === "Terminé" && match.winnerId && (
                  <div className="mt-10 pt-8 border-t border-white/5 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.3em] mb-3">Qualifié pour la suite</p>
                    <div className="flex items-center justify-center gap-3 text-primary font-bold uppercase text-lg">
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
        <div className="text-center py-24 bg-muted/5 rounded-[3rem] border border-dashed border-white/10">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
          <h3 className="text-xl font-bold uppercase tracking-widest">En attente du coup d'envoi</h3>
          <p className="text-muted-foreground font-medium mt-2">Les scores s'afficheront ici dès le début de la ONECUP.</p>
        </div>
      )}
    </div>
  );
}

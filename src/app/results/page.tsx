
"use client";

import { useMemo } from "react";
import { Trophy, Calendar, Zap, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function ResultsPage() {
  const db = useFirestore();

  const matchesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "matches"), orderBy("scheduledTime", "desc"));
  }, [db]);

  const { data: matches, loading } = useCollection(matchesQuery);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4 text-center">
        <Badge variant="outline" className="border-primary text-primary px-3 py-1 font-bold">RÉSULTATS LIVE</Badge>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase">SCOREBOARD ONECUP</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Suivez l'évolution des tournois en temps réel. Découvrez qui domine le classement Elite.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground italic">Synchronisation des scores...</p>
        </div>
      ) : matches && matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {matches.map((match: any) => (
            <Card key={match.id} className="bg-card border-white/5 hover:border-primary/20 transition-all overflow-hidden shadow-xl">
              <CardHeader className="bg-muted/30 py-3 px-6 flex flex-row items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{match.tournamentName}</span>
                </div>
                <Badge variant={match.status === "En Cours" ? "destructive" : "secondary"} className="text-[10px] font-bold">
                  {match.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center font-headline font-bold text-2xl border-2 border-primary/20">
                      {match.team1?.[0] || "A"}
                    </div>
                    <span className="font-bold uppercase text-center text-sm">{match.team1}</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 px-6">
                    <div className="text-5xl font-headline font-bold text-primary tabular-nums">
                      {match.scoreTeam1} : {match.scoreTeam2}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Score Final</span>
                  </div>

                  <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center font-headline font-bold text-2xl border-2 border-primary/20">
                      {match.team2?.[0] || "B"}
                    </div>
                    <span className="font-bold uppercase text-center text-sm">{match.team2}</span>
                  </div>
                </div>

                {match.winner && (
                  <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mb-2">Vainqueur</p>
                    <div className="flex items-center justify-center gap-2 text-primary font-bold uppercase">
                      <Trophy className="w-4 h-4" />
                      <span>{match.winner}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-muted/5 rounded-3xl border border-dashed border-white/10">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
          <h3 className="text-xl font-bold uppercase">Aucun Match Joué</h3>
          <p className="text-muted-foreground">Les scores s'afficheront ici dès le début des tournois.</p>
        </div>
      )}
    </div>
  );
}

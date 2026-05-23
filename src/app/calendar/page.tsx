
"use client";

import { useMemo } from "react";
import { Trophy, MapPin, Clock, ArrowRight, CalendarDays, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import Link from "next/link";
import { format, parseISO, isValid, compareAsc } from "date-fns";
import { fr } from "date-fns/locale";

export default function CalendarPage() {
  const db = useFirestore();

  const tournamentsQuery = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const { data: tournaments, loading } = useCollection(tournamentsQuery);

  // Helper to parse date strings safely
  const parseTournamentDate = (dateStr: string) => {
    if (!dateStr) return null;
    const d = parseISO(dateStr);
    return isValid(d) ? d : null;
  };

  // Aggregates all events (main tournament start + phases) into a single flat list
  const allEvents = useMemo(() => {
    if (!tournaments) return [];
    
    const events: any[] = [];

    tournaments.forEach((t: any) => {
      // Main event
      const mainDate = parseTournamentDate(t.date);
      if (mainDate) {
        events.push({
          id: `${t.id}-main`,
          tournamentId: t.id,
          tournamentName: t.name,
          sport: t.sport,
          location: t.location,
          prize: t.prize,
          imageUrl: t.imageUrl,
          date: mainDate,
          label: "Lancement du Tournoi",
          isMain: true
        });
      }

      // Schedule phases
      if (t.schedule && Array.isArray(t.schedule)) {
        t.schedule.forEach((phase: any, idx: number) => {
          const phaseDate = parseTournamentDate(phase.date);
          if (phaseDate) {
            events.push({
              id: `${t.id}-phase-${idx}`,
              tournamentId: t.id,
              tournamentName: t.name,
              sport: t.sport,
              location: t.location,
              prize: t.prize,
              imageUrl: t.imageUrl,
              date: phaseDate,
              label: phase.label,
              isMain: false
            });
          }
        });
      }
    });

    // Sort by date ascending
    return events.sort((a, b) => compareAsc(a.date, b.date));
  }, [tournaments]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4 text-center">
        <Badge variant="outline" className="border-primary text-primary px-3 py-1 font-bold">PROGRAMME OFFICIEL</Badge>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase">L'AGENDA COMPLET ÉLITE</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Retrouvez toutes les étapes clés : des phases de poules jusqu'au sacre final. 
          Chaque date mentionnée est un rendez-vous avec l'histoire de OneCup.
        </p>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Zap className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-muted-foreground italic">Chargement du programme en cours...</p>
          </div>
        ) : allEvents.length > 0 ? (
          <div className="space-y-6">
            {allEvents.map((event) => (
              <Card key={event.id} className="bg-card border-white/5 hover:border-primary/30 transition-all duration-300 group overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Date Column */}
                  <div className="md:w-32 bg-primary/5 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-white/5">
                    <span className="text-3xl font-headline font-bold text-primary">
                      {format(event.date, "dd")}
                    </span>
                    <span className="text-xs uppercase font-bold text-muted-foreground">
                      {format(event.date, "MMM yyyy", { locale: fr })}
                    </span>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-full md:w-32 aspect-square relative rounded-xl overflow-hidden shrink-0">
                      <img 
                        src={event.imageUrl || "https://picsum.photos/seed/event/300/300"} 
                        alt={event.tournamentName}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{event.tournamentName}</span>
                      </div>
                      <h3 className="text-2xl font-headline font-bold text-foreground uppercase tracking-tight">
                        {event.label}
                      </h3>
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> TBA</span>
                        <Badge variant="secondary" className="text-[10px] h-5">{event.sport}</Badge>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Link href={`/tournaments/${event.tournamentId}`}>
                        <Button variant="ghost" className="text-primary font-bold gap-2 uppercase text-xs group/btn hover:bg-primary/10">
                          Détails <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-muted/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center gap-4">
            <CalendarDays className="w-16 h-16 text-muted-foreground opacity-10" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold uppercase">Agenda Vide</h3>
              <p className="text-muted-foreground text-sm">
                Aucun événement n'a été programmé pour le moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

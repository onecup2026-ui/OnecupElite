
"use client";

import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, Trophy, MapPin, Clock, ArrowRight, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import Link from "next/link";
import { format, isSameDay, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";

export default function CalendarPage() {
  const db = useFirestore();
  const { data: tournaments, loading } = useCollection(db ? collection(db, "tournaments") : null);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Helper to parse date strings safely
  const parseTournamentDate = (dateStr: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isValid(d) ? d : null;
  };

  // Extract all event details (main tournament or specific phases) for a given date
  const eventsForSelectedDate = useMemo(() => {
    if (!date || !tournaments) return [];
    const results: any[] = [];

    tournaments.forEach((t: any) => {
      // Check main date
      const tMainDate = parseTournamentDate(t.date);
      if (tMainDate && isSameDay(tMainDate, date)) {
        results.push({
          type: 'tournament',
          tournament: t,
          label: "Début du tournoi",
          time: "09:00"
        });
      }

      // Check schedule phases
      if (t.schedule && Array.isArray(t.schedule)) {
        t.schedule.forEach((phase: any) => {
          const pDate = parseTournamentDate(phase.date);
          if (pDate && isSameDay(pDate, date)) {
            results.push({
              type: 'phase',
              tournament: t,
              label: phase.label,
              time: "TBA"
            });
          }
        });
      }
    });

    return results;
  }, [date, tournaments]);

  // Identify all dates that have either a tournament or a phase for calendar indicators
  const allEventDates = useMemo(() => {
    if (!tournaments) return [];
    const dates: Date[] = [];
    
    tournaments.forEach((t: any) => {
      const d = parseTournamentDate(t.date);
      if (d) dates.push(d);
      
      if (t.schedule && Array.isArray(t.schedule)) {
        t.schedule.forEach((phase: any) => {
          const pd = parseTournamentDate(phase.date);
          if (pd) dates.push(pd);
        });
      }
    });
    
    return dates;
  }, [tournaments]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4 text-center md:text-left">
        <Badge variant="outline" className="border-primary text-primary px-3 py-1 font-bold">AGENDA ONECUP</Badge>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase">PROGRAMME ET PHASES ÉLITE</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Suivez chaque étape du tournoi. Des phases éliminatoires jusqu'à la grande finale, ne manquez aucun temps fort.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Picker */}
        <Card className="bg-card/50 border-white/5 shadow-2xl h-fit">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-primary font-bold">Calendrier interactif</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={fr}
              className="rounded-md border border-white/5 bg-background/50"
              modifiers={{
                hasEvent: allEventDates,
              }}
              modifiersStyles={{
                hasEvent: { 
                  fontWeight: 'bold', 
                  color: 'hsl(var(--primary))',
                  background: 'hsla(var(--primary), 0.1)'
                }
              }}
            />
            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-xs text-muted-foreground">Sélectionnez une date en bleu pour voir le programme détaillé.</p>
            </div>
          </CardContent>
        </Card>

        {/* Events List for selected day */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-2xl font-headline font-bold uppercase">
              {date ? format(date, "EEEE d MMMM", { locale: fr }) : "Choisissez une date"}
            </h2>
            <Badge variant="secondary" className="font-bold">
              {eventsForSelectedDate.length} Événement(s)
            </Badge>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12 opacity-50 italic">Synchronisation avec Firestore...</div>
            ) : eventsForSelectedDate.length > 0 ? (
              eventsForSelectedDate.map((event: any, idx: number) => (
                <Card key={`${event.tournament.id}-${idx}`} className="bg-card border-white/5 hover:border-primary/30 transition-all duration-300 group overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-56 h-40 relative">
                      <img 
                        src={event.tournament.imageUrl || "https://picsum.photos/seed/event/500/400"} 
                        alt={event.tournament.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className={event.type === 'phase' ? 'bg-secondary glow-blue' : 'bg-primary'}>
                          {event.type === 'phase' ? 'PHASE CLÉ' : 'TOURNOI'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-primary" />
                          <span className="text-sm font-bold uppercase tracking-widest">{event.tournament.name}</span>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <h3 className="text-2xl font-headline font-bold text-primary uppercase leading-none">
                            {event.label}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4" /> {event.time} • <MapPin className="w-4 h-4" /> {event.tournament.location}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                           <Badge variant="outline" className="text-[10px] uppercase">{event.tournament.sport}</Badge>
                           <span className="text-xs font-bold text-muted-foreground">CASH PRIZE : {event.tournament.prize}</span>
                        </div>
                      </div>
                      
                      <div className="pt-6 flex justify-end">
                        <Link href={`/tournaments/${event.tournament.id}`}>
                          <Button variant="ghost" className="text-primary font-bold gap-2 uppercase text-xs p-0 h-auto hover:bg-transparent group/btn">
                            PAGE DU TOURNOI <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-24 bg-muted/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                <ListChecks className="w-16 h-16 text-muted-foreground opacity-10" />
                <div className="space-y-1">
                  <h3 className="text-xl font-bold uppercase">Repos Guerrier</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Aucune phase de compétition n'est prévue pour cette date précise. Profitez-en pour vous entraîner !
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, Trophy, MapPin, Clock, ArrowRight } from "lucide-react";
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
    const d = new Date(dateStr);
    return isValid(d) ? d : null;
  };

  // Filter tournaments for the selected date
  const selectedTournaments = useMemo(() => {
    if (!date || !tournaments) return [];
    return tournaments.filter((t: any) => {
      const tDate = parseTournamentDate(t.date);
      return tDate && isSameDay(tDate, date);
    });
  }, [date, tournaments]);

  // Identify all dates that have tournaments for the calendar indicators
  const tournamentDates = useMemo(() => {
    if (!tournaments) return [];
    return tournaments
      .map((t: any) => parseTournamentDate(t.date))
      .filter((d): d is Date => d !== null);
  }, [tournaments]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4">
        <Badge variant="outline" className="border-primary text-primary px-3 py-1 font-bold">AGENDA ONECUP</Badge>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase">CALENDRIER DES ÉVÉNEMENTS</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Planifiez vos prochaines compétitions. Retrouvez toutes les dates clés de la saison OneCup Elite.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Picker */}
        <Card className="bg-card/50 border-white/5 shadow-2xl h-fit">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-primary font-bold">Sélectionner une date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={fr}
              className="rounded-md border border-white/5 bg-background/50"
              modifiers={{
                hasEvent: tournamentDates,
              }}
              modifiersStyles={{
                hasEvent: { 
                  fontWeight: 'bold', 
                  color: 'hsl(var(--primary))',
                  textDecoration: 'underline'
                }
              }}
            />
            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-xs text-muted-foreground">Les dates soulignées indiquent un événement programmé.</p>
            </div>
          </CardContent>
        </Card>

        {/* Events List for selected day */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-2xl font-headline font-bold uppercase">
              {date ? format(date, "EEEE d MMMM", { locale: fr }) : "Sélectionnez une date"}
            </h2>
            <Badge variant="secondary" className="font-bold">
              {selectedTournaments.length} Événement(s)
            </Badge>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 opacity-50 italic">Chargement des tournois...</div>
            ) : selectedTournaments.length > 0 ? (
              selectedTournaments.map((tournament: any) => (
                <Card key={tournament.id} className="bg-card border-white/5 hover:border-primary/30 transition-all duration-300 group overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-48 h-32 relative">
                      <img 
                        src={tournament.imageUrl || "https://picsum.photos/seed/calendar-event/400/300"} 
                        alt={tournament.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-bold">{tournament.sport}</Badge>
                          <span className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 09:00 - 18:00
                          </span>
                        </div>
                        <h3 className="text-xl font-bold uppercase group-hover:text-primary transition-colors">{tournament.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-primary" /> {tournament.location}
                        </p>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <Link href={`/tournaments/${tournament.id}`}>
                          <Button variant="ghost" className="text-primary font-bold gap-2 uppercase text-xs p-0 h-auto hover:bg-transparent group/btn">
                            DÉTAILS DU TOURNOI <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                <CalendarIcon className="w-12 h-12 text-muted-foreground opacity-20" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold uppercase">Aucun tournoi ce jour</h3>
                  <p className="text-muted-foreground text-sm">Parcourez le calendrier pour trouver d'autres dates.</p>
                </div>
              </div>
            )}
          </div>

          {/* Upcomming list summary */}
          {date && selectedTournaments.length === 0 && tournaments && tournaments.length > 0 && (
            <div className="pt-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Prochains rendez-vous importants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournaments.slice(0, 4).map((t: any) => (
                  <Link href={`/tournaments/${t.id}`} key={t.id}>
                    <div className="p-4 rounded-xl border border-white/5 bg-card/30 hover:bg-card/50 transition-colors flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary">
                        <span className="text-xs font-bold leading-none">{t.date.split(' ')[0]}</span>
                        <Trophy className="w-4 h-4 mt-1" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-sm truncate uppercase">{t.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{t.sport} • {t.prize}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

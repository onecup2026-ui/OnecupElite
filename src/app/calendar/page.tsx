
"use client";

import { Trophy, MapPin, Clock, CalendarDays, Zap, Camera, Users, Coffee, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const schedule = [
  {
    phase: "1. Phase de Préparation",
    dates: "15 Juillet",
    events: [
      { time: "09:00 - 11:00", label: "Accueil des équipes & contrôle dossiers", icon: Users },
      { time: "11:00 - 12:30", label: "Tirage au sort du tableau (bracket)", icon: Zap },
      { time: "12:30 - 14:00", label: "Pause déjeuner", icon: Coffee },
      { time: "14:00 - 16:00", label: "Briefing général (règlement et discipline)", icon: Trophy },
      { time: "16:00 - 17:30", label: "Communication et photos officielles", icon: Camera },
    ]
  },
  {
    phase: "2. Phase Éliminatoire (Huitièmes)",
    dates: "16 - 18 Juillet",
    events: [
      { time: "16 Juillet", label: "Matchs 1, 2 et 3 (09:00 - 17:45)", icon: Trophy },
      { time: "17 Juillet", label: "Matchs 4, 5 et 6 (09:00 - 17:45)", icon: Trophy },
      { time: "18 Juillet", label: "Matchs 7 et 8 (09:00 - 11:15)", icon: Trophy },
      { time: "18 Juillet PM", label: "Communication et repos", icon: Coffee },
    ]
  },
  {
    phase: "3. Quarts & Demi-finales",
    dates: "19 - 22 Juillet",
    events: [
      { time: "19 Juillet", label: "Quarts de finale 1 & 2", icon: Zap },
      { time: "20 Juillet", label: "Quarts de finale 3 & 4", icon: Zap },
      { time: "21 Juillet", label: "Journée de Repos - Interviews Médias", icon: Camera },
      { time: "22 Juillet", label: "Demi-finales 1 & 2 (Matin)", icon: Star },
    ]
  },
  {
    phase: "4. La Grande Finale",
    dates: "23 - 24 Juillet",
    events: [
      { time: "23 Juillet", label: "Préparation finale & Entraînements", icon: Users },
      { time: "24 Juillet - 09:00", label: "Match pour la 3ème place", icon: Trophy },
      { time: "24 Juillet - 11:30", label: "FINALE ONECUP 2026", icon: Star },
      { time: "24 Juillet - 15:30", label: "Célébration & Clôture", icon: Zap },
    ]
  },
  {
    phase: "5. After Cup & Prestige",
    dates: "25 Juillet",
    events: [
      { time: "12:00 - 15:30", label: "Animations & After Cup Festival", icon: Zap },
      { time: "17:00 - 18:30", label: "Cérémonie de Remise des Trophées", icon: Trophy },
      { time: "18:30 - 20:00", label: "Photos officielles & Fin ONECUP", icon: Camera },
    ]
  }
];

export default function CalendarPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4 text-center">
        <Badge variant="outline" className="border-primary text-primary px-4 py-1 font-bold tracking-widest uppercase">
          PROGRAMME OFFICIEL 2026
        </Badge>
        <h1 className="text-4xl md:text-7xl font-headline font-bold tracking-tighter uppercase">L'AGENDA ONECUP ELITE</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
          Découvrez la chronologie complète du tournoi le plus attendu de l'année. 
          Des coulisses du tirage au sort jusqu'au sacre final du 24 juillet.
        </p>
      </header>

      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="15 Juillet" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 bg-muted p-1 rounded-2xl mb-12 h-auto">
            {schedule.map((item) => (
              <TabsTrigger key={item.dates} value={item.dates} className="py-3 uppercase font-bold text-[10px] md:text-xs">
                {item.dates}
              </TabsTrigger>
            ))}
          </TabsList>

          {schedule.map((item) => (
            <TabsContent key={item.dates} value={item.dates} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h2 className="text-3xl font-headline font-bold uppercase text-primary">{item.phase}</h2>
                <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase text-xs">
                  <MapPin className="w-4 h-4" /> ONE CUP ARENA - KINSHASA
                </div>
              </div>

              <div className="grid gap-4">
                {item.events.map((event, idx) => (
                  <Card key={idx} className="bg-card border-white/5 hover:border-primary/20 transition-all group overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                        <div className="md:w-48 bg-muted/30 p-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
                          <div className="flex items-center gap-2 text-primary mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="font-bold text-sm">{event.time}</span>
                          </div>
                        </div>
                        <div className="flex-1 p-6 flex items-center gap-6">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <event.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold uppercase tracking-tight">{event.label}</h3>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Événement Officiel</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <section className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 md:p-12 text-center max-w-4xl mx-auto space-y-6">
        <h3 className="text-2xl font-headline font-bold uppercase">INFOS PRATIQUES</h3>
        <p className="text-muted-foreground">
          Tous les matchs de 16-18 juillet au 24 juillet se déroulent au format élimination directe avec une durée de 2 x 45 minutes. 
          Les spectateurs sont priés d'arriver 30 minutes avant le début de chaque rencontre.
        </p>
        <div className="flex flex-wrap justify-center gap-8 pt-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-primary w-5 h-5" />
            <span className="font-bold uppercase text-xs">15 - 24 JUILLET : TOURNOI</span>
          </div>
          <div className="flex items-center gap-2 text-secondary">
            <Star className="w-5 h-5 fill-secondary" />
            <span className="font-bold uppercase text-xs">25 JUILLET : AFTER CUP</span>
          </div>
        </div>
      </section>
    </div>
  );
}

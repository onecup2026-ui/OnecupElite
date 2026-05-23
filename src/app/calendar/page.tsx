
"use client";

import { Trophy, MapPin, Clock, CalendarDays, Zap, Camera, Users, Coffee, Star, ArrowRight, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const schedule = [
  {
    phase: "1. Phase de Préparation",
    dates: "15 Juillet",
    description: "Le coup d'envoi administratif et stratégique. C'est ici que le destin des équipes se joue.",
    events: [
      { time: "09:00 - 11:00", label: "Accueil des équipes & contrôle dossiers", icon: Users, type: "Admin" },
      { time: "11:00 - 12:30", label: "Tirage au sort du tableau (bracket)", icon: Zap, type: "Crucial" },
      { time: "12:30 - 14:00", label: "Pause déjeuner", icon: Coffee, type: "Repos" },
      { time: "14:00 - 16:00", label: "Briefing général (règlement et discipline)", icon: Trophy, type: "Technique" },
      { time: "16:00 - 17:30", label: "Communication et photos officielles", icon: Camera, type: "Média" },
    ]
  },
  {
    phase: "2. Phase Éliminatoire (Huitièmes)",
    dates: "16 - 18 Juillet",
    description: "16 équipes entrent dans l'arène, seules 8 survivront à cette première épreuve.",
    events: [
      { time: "16 Juillet", label: "Matchs 1, 2 et 3 (09:00 - 17:45)", icon: Trophy, type: "Match" },
      { time: "17 Juillet", label: "Matchs 4, 5 et 6 (09:00 - 17:45)", icon: Trophy, type: "Match" },
      { time: "18 Juillet", label: "Matchs 7 et 8 (09:00 - 11:15)", icon: Trophy, type: "Match" },
      { time: "18 Juillet PM", label: "Communication et repos", icon: Coffee, type: "Repos" },
    ]
  },
  {
    phase: "3. Quarts & Demi-finales",
    dates: "19 - 22 Juillet",
    description: "Le niveau s'élève. Chaque erreur est fatale. Le chemin vers la gloire se précise.",
    events: [
      { time: "19 Juillet", label: "Quarts de finale 1 & 2", icon: Zap, type: "Match" },
      { time: "20 Juillet", label: "Quarts de finale 3 & 4", icon: Zap, type: "Match" },
      { time: "21 Juillet", label: "Journée de Repos - Interviews Médias", icon: Camera, type: "Média" },
      { time: "22 Juillet", label: "Demi-finales 1 & 2 (Matin)", icon: Star, type: "Elite" },
    ]
  },
  {
    phase: "4. La Grande Finale",
    dates: "23 - 24 Juillet",
    description: "Le moment de vérité. Un seul champion pour l'éternité.",
    events: [
      { time: "23 Juillet", label: "Préparation finale & Entraînements", icon: Users, type: "Prep" },
      { time: "24 Juillet - 09:00", label: "Match pour la 3ème place", icon: Trophy, type: "Match" },
      { time: "24 Juillet - 11:30", label: "FINALE ONECUP 2026", icon: Star, type: "FINALE" },
      { time: "24 Juillet - 15:30", label: "Célébration & Clôture", icon: Zap, type: "Event" },
    ]
  },
  {
    phase: "5. After Cup & Prestige",
    dates: "25 Juillet",
    description: "Célébration de l'excellence et festival de clôture.",
    events: [
      { time: "12:00 - 15:30", label: "Animations & After Cup Festival", icon: Zap, type: "Festif" },
      { time: "17:00 - 18:30", label: "Cérémonie de Remise des Trophées", icon: Trophy, type: "Prestige" },
      { time: "18:30 - 20:00", label: "Photos officielles & Fin ONECUP", icon: Camera, type: "Clôture" },
    ]
  }
];

export default function CalendarPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      <header className="space-y-6 text-center max-w-4xl mx-auto">
        <Badge variant="outline" className="border-primary/50 text-primary px-6 py-2 font-bold tracking-[0.3em] uppercase bg-primary/5 animate-pulse">
          CHRONOLOGIE OFFICIELLE 2026
        </Badge>
        <h1 className="text-5xl md:text-8xl font-headline font-bold tracking-tighter uppercase leading-none">
          L'ÉPOPÉE <span className="text-primary">ONECUP</span>
        </h1>
        <p className="text-muted-foreground text-xl leading-relaxed">
          Suivez chaque seconde de l'événement qui redéfinit le sport en RDC. 
          Des coulisses du tirage au sort jusqu'à l'extase de la finale.
        </p>
        <div className="flex justify-center gap-4">
           <Button variant="ghost" className="gap-2 uppercase font-bold text-xs"><Share2 className="w-4 h-4" /> Partager l'agenda</Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="15 Juillet" className="w-full">
          <TabsList className="flex flex-wrap md:grid md:grid-cols-5 bg-muted/30 p-1.5 rounded-[2rem] mb-16 h-auto border border-white/5">
            {schedule.map((item) => (
              <TabsTrigger key={item.dates} value={item.dates} className="flex-1 py-4 uppercase font-bold text-[10px] md:text-xs rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">
                {item.dates}
              </TabsTrigger>
            ))}
          </TabsList>

          {schedule.map((item) => (
            <TabsContent key={item.dates} value={item.dates} className="space-y-10 outline-none animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-l-4 border-primary pl-8 py-2">
                <div className="space-y-2">
                   <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase text-foreground leading-none">{item.phase}</h2>
                   <p className="text-muted-foreground text-lg max-w-2xl">{item.description}</p>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 px-6 py-3 rounded-2xl border border-white/5">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-bold uppercase text-xs tracking-widest">ONE CUP ARENA</span>
                </div>
              </div>

              <div className="grid gap-6">
                {item.events.map((event, idx) => (
                  <Card key={idx} className="bg-card border-white/5 hover:border-primary/40 transition-all duration-500 group overflow-hidden hover:shadow-[0_0_30px_-10px_rgba(51,85,255,0.3)] cursor-default translate-y-0 hover:-translate-y-1">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                        <div className="md:w-56 bg-muted/20 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 group-hover:bg-primary/5 transition-colors">
                          <div className="flex items-center gap-3 text-primary mb-2">
                            <Clock className="w-5 h-5" />
                            <span className="font-bold text-lg tabular-nums tracking-tight">{event.time}</span>
                          </div>
                          <Badge variant="outline" className="w-fit text-[10px] border-primary/20 text-primary uppercase font-black px-3 py-1 bg-white/5">
                            {event.type}
                          </Badge>
                        </div>
                        <div className="flex-1 p-8 flex items-center justify-between gap-8">
                          <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-[1.25rem] bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                              <event.icon className="w-8 h-8" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold uppercase tracking-tighter group-hover:text-primary transition-colors duration-300">{event.label}</h3>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Accès Public Autorisé</p>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="hidden md:flex rounded-full opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-4">
                            <ArrowRight className="w-5 h-5 text-primary" />
                          </Button>
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

      <section className="relative overflow-hidden rounded-[3rem] p-12 md:p-20 text-center max-w-5xl mx-auto group">
        <div className="absolute inset-0 bg-primary/5 border border-primary/20 transition-all group-hover:bg-primary/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 space-y-8">
          <Trophy className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
          <h3 className="text-3xl md:text-5xl font-headline font-bold uppercase tracking-tighter">PRÊT POUR L'ACTION ?</h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Ne manquez aucun moment de cette édition historique. 
            Les billets pour la finale et l'After Cup sont disponibles en quantité limitée.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Button size="lg" className="h-16 px-12 bg-primary hover:bg-primary/90 glow-blue uppercase font-bold text-sm rounded-2xl gap-3 transition-transform hover:scale-105">
              Réserver mes places <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

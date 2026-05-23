
"use client";

import { ShieldCheck, Info, Users, Trophy, AlertTriangle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export default function RulesPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4 max-w-3xl">
        <Badge variant="outline" className="border-primary text-primary px-3 py-1 font-bold uppercase">CHARTE OFFICIELLE</Badge>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase">RÈGLEMENT GÉNÉRAL</h1>
        <p className="text-muted-foreground text-lg">
          L'équité, le respect et la performance sont les piliers de la OneCup Elite. Voici les règles régissant nos compétitions.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border-white/5 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 uppercase font-headline">
                <FileText className="text-primary w-6 h-6" /> 1. Inscriptions & Admissibilité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Chaque équipe doit être composée du nombre exact de joueurs requis par le format du tournoi. Les joueurs doivent être inscrits sur la plateforme OneCup avec une identité valide.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Âge minimum : 16 ans (autorisation parentale requise pour les mineurs).</li>
                <li>Frais d'inscription payés en totalité avant le tirage au sort.</li>
                <li>Respect du calendrier officiel des matchs.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 uppercase font-headline">
                <ShieldCheck className="text-primary w-6 h-6" /> 2. Fair-Play & Éthique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="uppercase font-bold text-sm">Comportement sur le terrain</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Tout manque de respect envers les arbitres, les officiels ou les adversaires entraînera une disqualification immédiate. La violence physique ou verbale est strictement interdite.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="uppercase font-bold text-sm">Anti-Dopage & Triche</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Pour l'e-sport, l'utilisation de logiciels tiers ou de "glitches" est interdite. Pour le sport physique, les substances interdites par la charte olympique sont prohibées.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Sanctions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded bg-yellow-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-yellow-500 w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs uppercase">Avertissement</p>
                  <p className="text-[10px] text-muted-foreground">Pour infractions mineures ou retards répétés.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded bg-red-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-red-500 w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs uppercase">Exclusion</p>
                  <p className="text-[10px] text-muted-foreground">Retrait immédiat de la compétition sans remboursement.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Besoin d'aide ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Une question sur un point spécifique du règlement ? Contactez nos arbitres.</p>
              <Button variant="outline" className="w-full uppercase font-bold text-xs h-10">Contacter un Officiel</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

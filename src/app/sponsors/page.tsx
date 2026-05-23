
"use client";

import { useMemo } from "react";
import { Heart, Globe, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";

export default function SponsorsPage() {
  const db = useFirestore();
  const sponsorsRef = useMemo(() => (db ? collection(db, "sponsors") : null), [db]);
  const { data: sponsors, loading } = useCollection(sponsorsRef);

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      <header className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="border-primary text-primary px-3 py-1 font-bold uppercase tracking-widest">ÉCOSYSTÈME</Badge>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase">NOS PARTENAIRES ÉLITES</h1>
        <p className="text-muted-foreground text-lg">
          La OneCup Elite ne serait rien sans le soutien de nos partenaires. Ensemble, nous construisons le futur du sport et du divertissement en RDC.
        </p>
      </header>

      {/* Sponsors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted/50 border-none" />
          ))
        ) : sponsors && sponsors.length > 0 ? (
          sponsors.map((sponsor: any) => (
            <Card key={sponsor.id} className="group hover:border-primary/50 transition-all duration-300 shadow-xl overflow-hidden bg-card border-white/5">
              <CardContent className="p-8 flex flex-col items-center justify-center space-y-6">
                <div className="h-20 w-full flex items-center justify-center bg-white rounded-xl p-4 shadow-inner">
                  <img 
                    src={sponsor.logoUrl} 
                    alt={sponsor.name} 
                    className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-bold uppercase text-lg">{sponsor.name}</h3>
                  <Badge variant="secondary" className="text-[10px] uppercase">Partenaire Officiel</Badge>
                </div>
                {sponsor.websiteUrl && (
                  <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="ghost" className="w-full gap-2 group/btn font-bold uppercase text-xs">
                      Visiter le site <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
            <p className="text-muted-foreground">Aucun partenaire enregistré pour le moment.</p>
          </div>
        )}
      </div>

      {/* CTA Partner */}
      <section className="bg-primary glow-blue rounded-3xl p-8 md:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl text-center lg:text-left">
          <h2 className="text-3xl font-headline font-bold uppercase">Devenez Partenaire Elite</h2>
          <p className="text-white/80">
            Associez votre image à l'événement sportif le plus dynamique de la région. Bénéficiez d'une visibilité sans précédent auprès d'une audience jeune et engagée.
          </p>
        </div>
        <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold uppercase h-14 px-8 shrink-0">
          Nous contacter <Zap className="ml-2 w-5 h-5 fill-primary" />
        </Button>
      </section>
    </div>
  );
}

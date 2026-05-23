
"use client";

import { Ticket as TicketIcon, ExternalLink, ShieldCheck, Zap, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import Image from "next/image";

export default function TicketsPage() {
  const db = useFirestore();
  const { data: tickets, loading } = useCollection(db ? collection(db, "tickets") : null);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4 text-center max-w-3xl mx-auto">
        <Badge variant="outline" className="border-primary text-primary px-3 py-1 font-bold uppercase tracking-widest">ACCÈS OFFICIEL</Badge>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase">BILLETTERIE ÉLITE</h1>
        <p className="text-muted-foreground text-lg">
          Réservez vos places pour les événements les plus attendus de la saison OneCup. 
          Tous nos liens redirigent vers des plateformes de billetterie sécurisées.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="bg-card border-white/5 h-[400px] animate-pulse" />
          ))
        ) : tickets && tickets.length > 0 ? (
          tickets.map((ticket: any) => (
            <Card key={ticket.id} className="bg-card border-white/5 hover:border-primary/30 transition-all duration-300 group overflow-hidden flex flex-col shadow-2xl">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={ticket.imageUrl || "https://picsum.photos/seed/ticket/800/600"}
                  alt={ticket.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
                />
                <Badge className="absolute top-4 right-4 bg-primary glow-blue font-bold text-lg px-4 py-1">
                  {ticket.price || "TBA"}
                </Badge>
              </div>
              
              <CardHeader className="flex-grow">
                <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase tracking-widest mb-2">
                  <Zap className="w-3 h-3" /> {ticket.tournamentName || "Événement OneCup"}
                </div>
                <CardTitle className="text-2xl font-headline font-bold uppercase leading-tight group-hover:text-primary transition-colors">
                  {ticket.title}
                </CardTitle>
                {ticket.description && (
                  <p className="text-muted-foreground text-sm mt-3 line-clamp-3">
                    {ticket.description}
                  </p>
                )}
              </CardHeader>
              
              <CardFooter className="p-6 border-t border-white/5">
                <a href={ticket.externalUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full h-12 bg-primary hover:bg-primary/90 glow-blue gap-2 uppercase font-bold text-sm">
                    Réserver sur la plateforme <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-24 text-center border border-dashed border-white/10 rounded-3xl bg-card/30">
            <TicketIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
            <h3 className="text-xl font-bold uppercase">Aucun billet disponible</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              Les ventes pour les prochains tournois n'ont pas encore commencé. Restez connectés pour les annonces officielles.
            </p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <section className="bg-primary/5 rounded-3xl p-8 border border-primary/20 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="bg-primary/10 p-4 rounded-2xl shrink-0">
          <ShieldCheck className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-bold uppercase">Transactions Sécurisées</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pour votre sécurité, OneCup Elite collabore exclusivement avec des partenaires de billetterie reconnus. 
            Assurez-vous de toujours passer par nos liens officiels pour éviter toute fraude. En cas de doute, 
            contactez notre support via le chatbot.
          </p>
        </div>
      </section>
    </div>
  );
}

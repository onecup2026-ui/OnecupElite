
"use client";

import { useMemo } from "react";
import { Ticket as TicketIcon, ExternalLink, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";

const OFFICIAL_TICKET_URL = "https://digitaleventcd.vercel.app/";

export default function TicketsPage() {
  const db = useFirestore();
  const ticketsRef = useMemo(() => (db ? collection(db, "tickets") : null), [db]);
  const { data: tickets, loading } = useCollection(ticketsRef);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4 text-center max-w-3xl mx-auto">
        <Badge variant="outline" className="border-primary text-primary px-3 py-1 font-bold uppercase tracking-widest">ACCÈS OFFICIEL</Badge>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase">BILLETTERIE ÉLITE</h1>
        <p className="text-muted-foreground text-lg">
          Réservez vos places pour les événements les plus attendus de la saison OneCup. 
          Tous nos liens redirigent vers notre plateforme de billetterie sécurisée.
        </p>
      </header>

      {/* Main Official Ticket CTA */}
      <section className="max-w-4xl mx-auto">
        <Card className="bg-primary glow-blue border-none overflow-hidden rounded-[2.5rem] text-white">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 space-y-6 flex flex-col justify-center">
              <Badge className="bg-white text-primary w-fit font-bold uppercase">OFFRE PRINCIPALE</Badge>
              <h2 className="text-3xl font-headline font-bold uppercase leading-none">PASS FESTIVAL & FINALE ONECUP</h2>
              <p className="text-white/80 text-sm">Accès complet à la grande finale du 24 juillet et au festival After Cup du 25 juillet.</p>
              <a href={OFFICIAL_TICKET_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-black uppercase w-full md:w-auto h-14 px-8 rounded-xl gap-2">
                  Acheter sur Digital Event <ExternalLink className="w-5 h-5" />
                </Button>
              </a>
            </div>
            <div className="relative aspect-video md:aspect-auto">
              <img 
                src="https://picsum.photos/seed/onecup-ticket-main/800/600" 
                alt="Tickets" 
                className="absolute inset-0 w-full h-full object-cover opacity-80"
                data-ai-hint="crowd concert"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-transparent hidden md:block" />
            </div>
          </div>
        </Card>
      </section>

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
                <a href={ticket.externalUrl || OFFICIAL_TICKET_URL} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full h-12 bg-primary hover:bg-primary/90 glow-blue gap-2 uppercase font-bold text-sm">
                    Réserver sur Digital Event <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-card/30">
            <TicketIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
            <h3 className="text-xl font-bold uppercase">Ventes bientôt ouvertes</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              Les billets pour les phases éliminatoires arrivent. Restez connectés.
            </p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <section className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/20 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="bg-primary/10 p-6 rounded-2xl shrink-0">
          <ShieldCheck className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-bold uppercase">Transactions Sécurisées</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pour votre sécurité, OneCup Elite collabore exclusivement avec <strong>Digital Event</strong>. 
            Assurez-vous de toujours passer par nos liens officiels pour éviter toute fraude.
          </p>
        </div>
      </section>
    </div>
  );
}

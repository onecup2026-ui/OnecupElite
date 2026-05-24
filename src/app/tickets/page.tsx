"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Ticket as TicketIcon, ExternalLink, ShieldCheck, Zap, ArrowRight, Star } from "lucide-react";
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
    <div className="bg-[#f3f3f3] min-h-screen">
      {/* Immersive FIFA Style Header */}
      <section className="relative h-[50vh] bg-secondary flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/seed/onecup-ticketing/1920/1080"
            alt="Elite Ticketing"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10 pb-16">
          <div className="max-w-4xl space-y-6 animate-fifa-in">
            <Badge className="bg-primary text-white px-8 py-2 rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl">
              ACCÈS OFFICIEL
            </Badge>
            <h1 className="text-6xl md:text-9xl font-headline font-black text-white uppercase tracking-tighter leading-none">
              BILLETTERIE <br/><span className="text-white/40">ÉLITE.</span>
            </h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Official Pass */}
          <div className="lg:col-span-8 space-y-12">
            <Card className="bg-primary glow-blue border-none overflow-hidden rounded-[4rem] text-white shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-12 md:p-16 space-y-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <Star className="text-white fill-white w-6 h-6" />
                    <span className="font-black uppercase text-xs tracking-[0.5em]">OFFRE SUPRÊME</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-headline font-black uppercase leading-[0.9] tracking-tighter">PASS FESTIVAL <br/>& FINALE 2026</h2>
                  <p className="text-white/80 text-lg font-medium">L'expérience totale : Accès VIP à la Grande Finale du 24 Juillet et au Festival After Cup du 25 Juillet.</p>
                  <a href={OFFICIAL_TICKET_URL} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-black uppercase w-full h-20 text-xl rounded-3xl gap-3 shadow-2xl transition-transform hover:scale-105 active:scale-95">
                      Réserver mon Pass <ExternalLink className="w-6 h-6" />
                    </Button>
                  </a>
                </div>
                <div className="relative aspect-square md:aspect-auto">
                  <Image 
                    src="https://picsum.photos/seed/onecup-vip-pass/1000/1000" 
                    alt="VIP Tickets" 
                    fill 
                    className="object-cover opacity-90"
                    data-ai-hint="luxury stadium"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-transparent hidden md:block" />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {loading ? (
                Array(2).fill(0).map((_, i) => <div key={i} className="h-64 bg-white animate-pulse rounded-[3rem]" />)
              ) : (
                tickets?.map((ticket: any) => (
                  <Card key={ticket.id} className="bg-white rounded-[3rem] border-none shadow-xl group hover:shadow-2xl transition-all duration-700 overflow-hidden flex flex-col">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={ticket.imageUrl || "https://picsum.photos/seed/ticket-standard/800/600"}
                        alt={ticket.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute top-8 right-8">
                        <Badge className="bg-primary text-white font-black text-xl px-6 py-2 rounded-2xl shadow-2xl">
                          {ticket.price || "TBA"}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader className="p-10 flex-grow">
                      <div className="flex items-center gap-3 text-primary font-black uppercase text-[10px] tracking-[0.3em] mb-4">
                        <Zap className="w-4 h-4 fill-primary" /> {ticket.tournamentName || "ÉVÉNEMENT ONECUP"}
                      </div>
                      <CardTitle className="text-3xl font-headline font-black uppercase leading-tight tracking-tight">
                        {ticket.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardFooter className="p-10 pt-0">
                      <a href={ticket.externalUrl || OFFICIAL_TICKET_URL} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button className="w-full h-16 bg-slate-900 hover:bg-black text-white gap-3 uppercase font-black text-xs tracking-widest rounded-2xl">
                          Acheter Maintenant <ArrowRight className="w-4 h-4" />
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Secure Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="bg-white rounded-[3rem] p-10 shadow-xl border-none space-y-8">
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-headline font-black uppercase tracking-tight">Transactions 100% Sécurisées</h4>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Pour votre sécurité, OneCup Elite collabore exclusivement avec <strong>Digital Event</strong>. 
                  Assurez-vous de toujours passer par nos liens officiels pour garantir l'authenticité de vos titres d'accès.
                </p>
              </div>
              <ul className="space-y-4 pt-4 border-t border-slate-50">
                {["Confirmation immédiate", "E-billet sur smartphone", "Support client 24/7", "Revendeurs interdits"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {item}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="bg-secondary rounded-[3rem] p-10 text-white space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full" />
               <h5 className="text-xl font-headline font-black uppercase tracking-tight">Besoin d'un accès de groupe ?</h5>
               <p className="text-white/60 text-sm font-medium">Pour les délégations scolaires ou les entreprises, contactez notre service Prestige.</p>
               <Button variant="outline" className="w-full h-14 rounded-2xl border-white/20 text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest">
                 Contactez-nous
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
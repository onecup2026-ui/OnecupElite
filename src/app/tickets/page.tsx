"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Ticket as TicketIcon, ExternalLink, ShieldCheck, Zap, ArrowRight, Star, CreditCard, Lock } from "lucide-react";
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
    <div className="bg-[#f8f9fa] min-h-screen">
      {/* Header FIFA Style Immersif */}
      <section className="relative h-[40vh] md:h-[50vh] bg-secondary flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/seed/onecup-crowd/1920/1080"
            alt="Elite Ticketing"
            fill
            className="object-cover opacity-40 grayscale-[0.5]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10 pb-12 md:pb-20">
          <div className="max-w-4xl space-y-6">
            <Badge className="bg-primary text-white px-6 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">
              BILLETTERIE OFFICIELLE
            </Badge>
            <h1 className="text-5xl md:text-8xl font-headline font-black text-white uppercase tracking-tighter leading-[0.85]">
              PRENEZ VOTRE <br/><span className="text-white/40">PLACE.</span>
            </h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Featured Pass Card - Ultra Premium */}
            <Card className="bg-white border-none overflow-hidden rounded-[3rem] shadow-2xl group transition-all duration-700">
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-[45%] aspect-square md:aspect-auto overflow-hidden">
                  <Image 
                    src="https://picsum.photos/seed/onecup-vip/800/800" 
                    alt="VIP Experience" 
                    fill 
                    className="object-cover transition-transform duration-[3s] group-hover:scale-110"
                    data-ai-hint="luxury stadium"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent hidden md:block" />
                  <div className="absolute top-6 left-6 md:hidden">
                     <Badge className="bg-primary text-white font-black text-xl px-4 py-2 rounded-xl">VIP</Badge>
                  </div>
                </div>
                <div className="flex-1 p-8 md:p-14 space-y-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-primary">
                    <Star className="w-5 h-5 fill-primary" />
                    <span className="font-black uppercase text-[10px] tracking-[0.4em]">EXPÉRIENCE SUPRÊME</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-headline font-black uppercase leading-tight tracking-tighter text-slate-900">PASS FESTIVAL <br/>& GRANDE FINALE</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Vivez le sacre des champions le 24 Juillet et vibrez au festival After Cup le 25 Juillet. Accès exclusif, catering premium et visibilité optimale.
                  </p>
                  <div className="pt-4">
                    <a href={OFFICIAL_TICKET_URL} target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-black uppercase w-full h-16 rounded-2xl gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                        Réserver mon Pass Elite <ExternalLink className="w-5 h-5" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            {/* Standard Tickets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {loading ? (
                Array(2).fill(0).map((_, i) => <div key={i} className="h-80 bg-white animate-pulse rounded-[2.5rem]" />)
              ) : (
                tickets?.map((ticket: any) => (
                  <Card key={ticket.id} className="bg-white rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col group">
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      <Image
                        src={ticket.imageUrl || "https://picsum.photos/seed/onecup-ticket-std/600/400"}
                        alt={ticket.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                      <div className="absolute top-6 right-6">
                        <Badge className="bg-white/90 backdrop-blur-md text-primary font-black text-lg px-5 py-1.5 rounded-xl shadow-lg border-none">
                          {ticket.price || "15.000 FC"}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader className="p-8 pb-4">
                      <div className="flex items-center gap-2 text-primary font-black uppercase text-[9px] tracking-[0.3em] mb-3">
                        <Zap className="w-3.5 h-3.5 fill-primary" /> {ticket.tournamentName || "MATCH OFFICIEL"}
                      </div>
                      <CardTitle className="text-2xl font-headline font-black uppercase leading-none tracking-tight text-slate-900">
                        {ticket.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardFooter className="p-8 pt-4 mt-auto">
                      <a href={ticket.externalUrl || OFFICIAL_TICKET_URL} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button variant="outline" className="w-full h-14 border-2 border-slate-100 hover:border-primary hover:bg-primary/5 text-slate-900 gap-2 uppercase font-black text-[10px] tracking-widest rounded-xl transition-all">
                          Acheter <ArrowRight className="w-4 h-4" />
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Secure Information Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border-none space-y-10">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-headline font-black uppercase tracking-tight text-slate-900">Achat Sécurisé</h4>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    Toutes les transactions sont traitées exclusivement par notre partenaire de confiance <strong>Digital Event</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                 {[
                   { icon: Lock, label: "Cryptage SSL 256-bit", desc: "Données protégées" },
                   { icon: CreditCard, label: "Paiements Mobiles", desc: "M-Pesa, Orange, Airtel" },
                   { icon: TicketIcon, label: "E-Billet Instantané", desc: "Reçu par SMS/Email" },
                 ].map((item, i) => (
                   <div key={i} className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                       <item.icon className="w-5 h-5 text-slate-400" />
                     </div>
                     <div>
                       <p className="font-black uppercase text-[10px] tracking-widest text-slate-900">{item.label}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase">{item.desc}</p>
                     </div>
                   </div>
                 ))}
              </div>

              <div className="pt-6 border-t border-slate-50">
                <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Besoin d'aide ?</p>
                  <Button variant="ghost" className="w-full h-12 text-primary font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-white" asChild>
                    <a href="mailto:support@onecup.cd">support@onecup.cd</a>
                  </Button>
                </div>
              </div>
            </Card>

            <div className="bg-[#0051a3] rounded-[2.5rem] p-10 text-white space-y-6 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
               <h5 className="text-2xl font-headline font-black uppercase tracking-tight relative z-10">DÉLÉGATIONS & GROUPES</h5>
               <p className="text-white/70 text-sm font-medium relative z-10">
                 Vous êtes une école ou une entreprise ? Profitez de tarifs préférentiels pour vos groupes de 10 personnes et plus.
               </p>
               <Button className="w-full h-14 bg-white text-[#0051a3] hover:bg-white/90 font-black uppercase text-[10px] tracking-widest rounded-xl relative z-10">
                 Demander un devis
               </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
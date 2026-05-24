
"use client";

import Image from "next/image";
import { ExternalLink, ShieldCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const OFFICIAL_TICKET_URL = "https://digitaleventcd.vercel.app/";

export default function TicketsPage() {
  return (
    <div className="bg-[#f8f9fa] min-h-screen flex flex-col items-center py-12 md:py-24 px-4">
      <div className="max-w-3xl w-full space-y-12 text-center">
        
        {/* Header Minimaliste */}
        <div className="space-y-4">
          <Badge className="bg-primary text-white px-6 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">
            BILLETTERIE OFFICIELLE
          </Badge>
          <h1 className="text-4xl md:text-7xl font-headline font-black text-slate-900 uppercase tracking-tighter leading-none">
            RÉSERVEZ VOTRE <br/><span className="text-primary">EXPÉRIENCE.</span>
          </h1>
        </div>

        {/* L'Affiche (Poster) */}
        <div className="relative aspect-[3/4] md:aspect-[4/5] w-full max-w-md mx-auto rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
          <Image
            src="https://picsum.photos/seed/onecup-poster/800/1000"
            alt="Affiche Officielle OneCup 2026"
            fill
            className="object-cover transition-transform duration-[3s] group-hover:scale-110"
            priority
            data-ai-hint="sports poster"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-10 left-0 right-0 text-white px-8">
            <p className="font-black uppercase text-xs tracking-[0.4em] opacity-80 mb-2">Grande Finale & Festival</p>
            <p className="text-2xl font-headline font-black uppercase tracking-tighter">Juillet 2026</p>
          </div>
        </div>

        {/* Description & Action */}
        <div className="max-w-xl mx-auto space-y-8">
          <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
            Vivez l'apothéose du sport et du divertissement. Accédez aux matchs de l'élite et au festival After Cup avec votre billet officiel.
          </p>
          
          <div className="space-y-4">
            <a href={OFFICIAL_TICKET_URL} target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button size="lg" className="w-full h-20 md:h-24 bg-primary hover:bg-primary/90 text-white font-black uppercase text-xl md:text-2xl rounded-3xl gap-4 shadow-[0_20px_50px_-10px_rgba(0,81,163,0.4)] transition-all hover:scale-[1.02] active:scale-95">
                <Ticket className="w-8 h-8" /> Acheter mon billet <ExternalLink className="w-6 h-6" />
              </Button>
            </a>
            
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Paiement 100% sécurisé via Digital Event</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

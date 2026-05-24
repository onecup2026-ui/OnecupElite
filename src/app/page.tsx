"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

export default function Home() {
  const db = useFirestore();
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const { data: siteConfig } = useDoc(configRef);

  const heroImage = siteConfig?.heroImageUrl || "https://picsum.photos/seed/onecup-elite/1920/1080";
  const heroTitle = siteConfig?.heroTitle || "L'ÉLITE DU SPORT\nEN RDC.";

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f3f3]">
      {/* Black Ticker */}
      <div className="bg-black text-white py-2 overflow-hidden">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee px-4">
          {Array(10).fill(0).map((_, i) => (
            <span key={i} className="text-[10px] font-black uppercase tracking-[0.3em]">
              ROAD TO ONECUP ELITE 2026 • INSCRIPTIONS OUVERTES • PRIX RECORD • 
            </span>
          ))}
        </div>
      </div>

      {/* Main Hero Section */}
      <section className="relative h-[80vh] flex items-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="OneCup Banner"
            fill
            className="object-contain lg:object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl space-y-8 animate-fifa-in">
            <h1 className="text-6xl md:text-9xl font-headline font-black tracking-tighter uppercase leading-[0.85] text-white whitespace-pre-line drop-shadow-2xl">
              {heroTitle}
            </h1>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/tournaments">
                <Button size="lg" className="h-20 px-16 text-xl font-black uppercase rounded-2xl bg-white text-primary hover:bg-white/90 glow-blue transition-transform hover:scale-105">
                  Participer <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Entry Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-primary rounded-[3rem] p-12 text-white flex flex-col justify-between h-[500px] overflow-hidden group shadow-2xl relative">
             <Zap className="w-20 h-20 opacity-20 absolute -right-4 -top-4 group-hover:scale-125 transition-transform" />
             <div className="space-y-4">
               <h3 className="text-4xl font-headline font-black uppercase">Tournois Elite</h3>
               <p className="text-white/80 font-medium">Rejoignez les meilleures équipes du pays dans l'arène ultime.</p>
             </div>
             <Link href="/tournaments">
               <Button variant="secondary" className="w-full h-16 rounded-2xl font-black uppercase">Voir le calendrier</Button>
             </Link>
          </div>
          <div className="bg-white rounded-[3rem] p-12 text-slate-900 flex flex-col justify-between h-[500px] border border-slate-200 shadow-xl overflow-hidden relative group">
             <Trophy className="w-20 h-20 text-primary opacity-10 absolute -right-4 -top-4 group-hover:scale-125 transition-transform" />
             <div className="space-y-4">
               <h3 className="text-4xl font-headline font-black uppercase">Actualités</h3>
               <p className="text-slate-500 font-medium">Suivez les résultats et les moments forts en temps réel.</p>
             </div>
             <Link href="/news">
               <Button className="w-full h-16 rounded-2xl font-black uppercase">Lire le journal</Button>
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
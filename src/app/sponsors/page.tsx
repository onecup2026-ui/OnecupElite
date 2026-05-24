
"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Heart, Globe, ArrowRight, ShieldCheck, Zap, Loader2, Sparkles } from "lucide-react";
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
    <div className="bg-white min-h-screen">
      {/* Header FIFA Style */}
      <header className="bg-secondary text-white py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10 text-center space-y-6">
          <Badge variant="outline" className="border-primary text-primary px-8 py-2 rounded-full font-black uppercase tracking-widest text-[10px]">Écosystème Elite</Badge>
          <h1 className="text-6xl md:text-9xl font-headline font-black uppercase tracking-tighter leading-none">NOS <span className="text-white/40">PARTENAIRES.</span></h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Propulsé par des marques qui croient en l'excellence et le futur du sport en RDC.
          </p>
        </div>
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/sponsors-bg/1920/1080')] opacity-10 bg-cover bg-center grayscale" />
      </header>

      <div className="container mx-auto px-4 py-24 space-y-24">
        {/* Sponsors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-64 animate-pulse bg-slate-50 rounded-[3rem]" />
            ))
          ) : sponsors && sponsors.length > 0 ? (
            sponsors.map((sponsor: any) => (
              <Card key={sponsor.id} className="group hover:border-primary/50 transition-all duration-700 shadow-xl hover:shadow-2xl overflow-hidden bg-white border-none rounded-[3rem] flex flex-col">
                <CardContent className="p-10 flex flex-col items-center justify-center space-y-8 flex-1">
                  <div className="h-32 w-full flex items-center justify-center bg-slate-50/50 rounded-3xl p-6 shadow-inner transition-transform group-hover:scale-105 duration-500">
                    <img 
                      src={sponsor.logoUrl || "https://picsum.photos/seed/logo/200/200"} 
                      alt={sponsor.name} 
                      className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-black uppercase text-xl tracking-tight leading-none text-slate-900">{sponsor.name}</h3>
                    <Badge className="bg-primary/10 text-primary border-none text-[9px] uppercase font-black px-4 py-1 tracking-widest">
                      {sponsor.category || "Partenaire Elite"}
                    </Badge>
                  </div>
                </CardContent>
                {sponsor.websiteUrl && (
                  <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="px-10 pb-10">
                    <Button variant="ghost" className="w-full gap-3 font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 text-primary border border-primary/10 rounded-2xl h-12">
                      Découvrir la marque <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                )}
              </Card>
            ))
          ) : (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 rounded-[4rem] space-y-4">
              <Sparkles className="w-16 h-16 text-slate-100 mx-auto" />
              <p className="text-slate-300 font-black uppercase tracking-widest text-xs">Opportunités de partenariat disponibles</p>
            </div>
          )}
        </div>

        {/* CTA Section Premium */}
        <section className="bg-primary rounded-[4rem] p-12 md:p-24 text-white flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,81,163,0.4)]">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://picsum.photos/seed/stadium-crowd/1200/800')] opacity-10 bg-cover bg-center mix-blend-overlay" />
          <div className="space-y-6 max-w-2xl text-center lg:text-left relative z-10">
            <h2 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter leading-none">DEVENEZ <br/>PARTENAIRE ELITE.</h2>
            <p className="text-white/80 text-xl font-medium leading-relaxed">
              Associez votre image à l'événement le plus prestigieux de l'année. Bénéficiez d'une visibilité nationale unique.
            </p>
          </div>
          <a href="mailto:onecup2026@gmail.com" className="shrink-0 relative z-10 w-full lg:w-auto">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-black uppercase h-24 px-16 rounded-[2rem] text-xl shadow-2xl w-full">
              Nous Contacter <Zap className="ml-3 w-8 h-8 fill-primary" />
            </Button>
          </a>
        </section>
      </div>
    </div>
  );
}


"use client";

import { useMemo } from "react";
import { Trophy, Award, Users, Star, ShieldCheck, Zap, ArrowRight, Target, Shield, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

export default function RewardsPage() {
  const db = useFirestore();
  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const { data: tournaments } = useCollection(tournamentsRef);

  const stats = useMemo(() => {
    if (!tournaments) return { totalTeams: 0, maxPossible: 0 };
    return tournaments.reduce((acc, t: any) => ({
      totalTeams: acc.totalTeams + (t.teamsRegistered || 0),
      maxPossible: acc.maxPossible + (t.maxTeams || 16)
    }), { totalTeams: 0, maxPossible: 0 });
  }, [tournaments]);

  return (
    <div className="bg-white min-h-screen">
      {/* Header Prestigieux - Plus Compact */}
      <header className="bg-primary text-white py-16 md:py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10 text-center space-y-4">
          <Badge className="bg-white/20 text-white px-6 py-1 rounded-full font-black uppercase tracking-widest text-[10px] backdrop-blur-sm border-white/10">
            L'EXCELLENCE RÉCOMPENSÉE
          </Badge>
          <h1 className="text-4xl md:text-7xl font-headline font-black uppercase tracking-tighter leading-none">
            PRIME <span className="text-white/40">& PRESTIGE.</span>
          </h1>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
      </header>

      <div className="container mx-auto px-4 py-12 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* L'AFFICHE OFFICIELLE (POSTER STYLE) */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="rounded-[2.5rem] border-none overflow-hidden shadow-2xl bg-slate-900 text-white relative group">
              {/* Background Effect */}
              <div className="absolute inset-0 z-0 opacity-20">
                <Image 
                  src="https://picsum.photos/seed/trophy-glow/1200/800" 
                  alt="Poster BG" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-slate-900 to-black" />
              </div>

              <CardContent className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center">
                {/* Visual Side */}
                <div className="w-full md:w-1/3 flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <Trophy className="w-24 h-24 text-primary animate-float" />
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Sacre Elite</p>
                    <h2 className="text-3xl font-headline font-black uppercase leading-none">CHAMPION <br/>2026</h2>
                  </div>
                </div>

                {/* Info Side */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="h-px w-8 bg-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Cagnotte Officielle</span>
                    </div>
                    <h3 className="text-6xl md:text-8xl font-headline font-black tracking-tighter text-white leading-none">
                      1.000.000<span className="text-primary text-3xl md:text-5xl ml-2 uppercase">FC</span>
                    </h3>
                    <p className="text-lg font-headline font-bold text-slate-400 uppercase tracking-tight">
                      UN MILLION DE FRANCS CONGOLAIS
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Finaliste</p>
                      <p className="text-xl font-black">250.000 <span className="text-[10px] text-primary">FC</span></p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Distinctions</p>
                      <p className="text-xl font-black uppercase text-primary">Prestige+</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {/* Footer Affiche */}
              <div className="bg-primary/20 backdrop-blur-md border-t border-white/10 py-4 px-10 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Garantie par ONE CUP Platform</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-white/40" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{stats.totalTeams} / {stats.maxPossible} ÉQUIPES EN LICE</span>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="rounded-3xl p-8 bg-slate-50 border-none space-y-4">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                   <Star className="w-6 h-6 text-primary" />
                 </div>
                 <h4 className="text-lg font-headline font-black uppercase tracking-tight">Statut Elite</h4>
                 <p className="text-slate-500 text-xs font-medium leading-relaxed">Chaque participant reçoit un certificat officiel et une exposition médiatique nationale.</p>
               </Card>
               <Card className="rounded-3xl p-8 bg-slate-50 border-none space-y-4">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                   <Zap className="w-6 h-6 text-primary" />
                 </div>
                 <h4 className="text-lg font-headline font-black uppercase tracking-tight">Rapidité</h4>
                 <p className="text-slate-500 text-xs font-medium leading-relaxed">Remise des prix instantanée lors de la cérémonie de l'After Cup le 25 juillet.</p>
               </Card>
            </div>
          </div>

          {/* SIDEBAR COMPACTE */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2rem] bg-slate-50 border-none p-8 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Distinctions Individuelles</h3>
              <div className="space-y-4">
                {[
                  { label: "MVP ONECUP", icon: Zap },
                  { label: "Soulier d'Or", icon: Target },
                  { label: "Gant d'Or", icon: ShieldCheck },
                  { label: "Le Rempart Elite", icon: Shield },
                  { label: "Maestro du Jeu", icon: Award },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="w-8 h-8 shrink-0 bg-primary/5 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-black uppercase text-[10px] tracking-tight">{item.label}</span>
                    <Badge variant="outline" className="ml-auto text-[7px] border-primary/20 text-primary uppercase px-1">Prix Surprise</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[2rem] bg-primary p-8 text-white space-y-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Trophy className="w-20 h-20" />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-lg font-headline font-black uppercase leading-tight">Visez le <br/>Sommet.</h3>
                <p className="text-white/70 text-xs font-medium">Inscrivez votre équipe pour prétendre au million.</p>
                <Button asChild className="w-full h-12 bg-white text-primary hover:bg-white/90 rounded-xl font-black uppercase text-[10px] tracking-widest">
                  <Link href="/tournaments">S'inscrire <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


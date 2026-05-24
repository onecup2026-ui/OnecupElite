"use client";

import { useMemo } from "react";
import { Trophy, Award, Users, TrendingUp, Star, ShieldCheck, Zap, ArrowRight, Target, Shield, LayoutDashboard, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import Link from "next/link";
import { PrizePoolTracker } from "@/components/shared/prize-pool-tracker";

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

  const prizeTiers = [
    { rank: "Champion ONECUP", amount: 1000000, percentage: 70 },
    { rank: "Finaliste Elite", amount: 250000, percentage: 20 },
    { rank: "Prix Individuels & Surprises", amount: 0, percentage: 10, isSurprise: true },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Header Prestigieux */}
      <header className="bg-primary text-white py-24 md:py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10 text-center space-y-8">
          <Badge className="bg-white text-primary px-8 py-2 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl">
            L'ENJEU SUPRÊME
          </Badge>
          <h1 className="text-5xl md:text-9xl font-headline font-black uppercase tracking-tighter leading-none">
            RÉCOMPENSES <br/><span className="text-white/40">& PRESTIGE.</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/80 font-medium">
            Entrez dans l'histoire. Une cagnotte d'élite et des distinctions de prestige pour ceux qui osent viser le sommet.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </header>

      <div className="container mx-auto px-4 py-20 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Section Cagnotte */}
          <div className="lg:col-span-8 space-y-12">
            <Card className="rounded-[3rem] border-none overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,81,163,0.3)] bg-white">
              <div className="bg-primary py-4 px-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                  <span className="text-[10px] font-black uppercase text-white/80 tracking-[0.3em]">Cagnotte Elite en Direct</span>
                </div>
                <TrendingUp className="w-4 h-4 text-white/40" />
              </div>
              
              <CardContent className="p-10 md:p-16 space-y-12">
                <div className="text-center space-y-6">
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] px-6 py-2 rounded-full font-black tracking-[0.2em] mb-4 uppercase">
                    ENJEUX HISTORIQUES
                  </Badge>
                  
                  <div className="space-y-4">
                    <h2 className="text-5xl md:text-8xl font-headline font-black text-slate-900 tracking-tighter leading-none flex flex-col items-center justify-center gap-2">
                      <span className="text-primary text-3xl md:text-5xl uppercase tracking-widest mb-2">UN MILLION</span>
                      <div className="flex items-center gap-4">
                        <span>1 000 000</span>
                        <span className="text-primary text-4xl md:text-6xl">FC</span>
                      </div>
                    </h2>
                    <p className="text-2xl md:text-3xl font-headline font-bold text-slate-400 uppercase tracking-tight">
                      FRANCS CONGOLAIS POUR LE CHAMPION
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    <span className="font-black uppercase text-xs tracking-[0.4em] text-primary">Record de Participation</span>
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-10">
                  {prizeTiers.map((tier, idx) => (
                    <div key={idx} className={`p-8 rounded-[2rem] border transition-all hover:scale-[1.02] ${idx === 0 ? "bg-slate-900 text-white border-slate-900 shadow-2xl" : "bg-white border-slate-100 text-slate-900"}`}>
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${idx === 0 ? "bg-primary text-white" : "bg-slate-50 text-slate-400"}`}>
                          {idx === 0 ? <Award className="w-5 h-5" /> : <span className="font-black text-sm">{idx + 1}</span>}
                        </div>
                        <Badge className={idx === 0 ? "bg-primary" : "bg-slate-100 text-slate-500 border-none"}>
                           {tier.percentage}%
                        </Badge>
                      </div>
                      <h4 className="font-black uppercase text-xs tracking-widest mb-2 opacity-60">{tier.rank}</h4>
                      <p className="text-3xl font-headline font-black tracking-tighter">
                        {tier.isSurprise ? "PRIX SURPRISE" : `${tier.amount.toLocaleString()} FC`}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="rounded-[3rem] p-10 bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Users className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary">Inscriptions Actuelles</h3>
                  <div className="flex items-baseline gap-4">
                    <span className="text-7xl font-headline font-black tracking-tighter">{stats.totalTeams}</span>
                    <span className="text-2xl text-white/40 font-bold">/ {stats.maxPossible} Équipes</span>
                  </div>
                  <p className="text-white/60 font-medium text-sm">Rejoignez les meilleures formations de la RDC dans la course vers l'Elite.</p>
                  <Button asChild className="bg-white text-slate-900 hover:bg-white/90 rounded-2xl h-14 px-8 font-black uppercase mt-6">
                    <Link href="/tournaments">Voir les tournois <ArrowRight className="ml-2 w-5 h-5" /></Link>
                  </Button>
                </div>
              </Card>

              <Card className="rounded-[3rem] p-10 bg-white border border-slate-100 shadow-xl space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Status Elite</h3>
                <p className="text-slate-500 font-medium text-sm">Chaque participant reçoit un certificat officiel ONECUP et une visibilité média accrue sur nos réseaux partenaires.</p>
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Vérifié par la Fédération</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar Distinctions */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-[3rem] bg-slate-50 border-none p-10 space-y-8">
              <h3 className="text-xl font-headline font-black uppercase tracking-tight">Distinctions Individuelles</h3>
              <div className="space-y-6">
                {[
                  { label: "MVP ONECUP", desc: "Meilleur joueur + Prix Surprise", icon: Zap },
                  { label: "Soulier d'Or", desc: "Meilleur buteur + Prix Surprise", icon: Target },
                  { label: "Gant d'Or", desc: "Meilleur gardien + Prix Surprise", icon: ShieldCheck },
                  { label: "Maestro du Jeu", desc: "Meilleur milieu + Prix Surprise", icon: LayoutDashboard },
                  { label: "Le Rempart Elite", desc: "Meilleur défenseur + Prix Surprise", icon: Shield },
                  { label: "Prix Fair-Play", desc: "Équipe la plus exemplaire", icon: Award },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 shrink-0 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-xs tracking-tight">{item.label}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[3rem] bg-primary p-10 text-white space-y-6 shadow-2xl text-center">
              <Trophy className="w-16 h-16 opacity-50 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-black uppercase tracking-tighter">PRÊT POUR LE SACRE ?</h3>
                <p className="text-white/70 text-sm font-medium">Inscrivez votre équipe dès aujourd'hui.</p>
              </div>
              <Button asChild className="w-full h-16 bg-white text-primary hover:bg-white/90 rounded-2xl font-black uppercase text-xs tracking-widest">
                <Link href="/tournaments">S'inscrire maintenant</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

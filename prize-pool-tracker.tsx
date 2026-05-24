"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrizePoolProps {
  currentPool: number;
  targetPool: number;
  tiers: { rank: string; amount: number; percentage: number; isSurprise?: boolean }[];
}

export function PrizePoolTracker({ currentPool, targetPool, tiers }: PrizePoolProps) {
  const progressValue = (currentPool / targetPool) * 100;

  return (
    <Card className="rounded-[3rem] border-none overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,81,163,0.3)] bg-white">
      {/* Top Banner with Pulse */}
      <div className="bg-primary py-4 px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
          <span className="text-[10px] font-black uppercase text-white/80 tracking-[0.3em]">Cagnotte Elite en Direct</span>
        </div>
        <TrendingUp className="w-4 h-4 text-white/40" />
      </div>
      
      <CardContent className="p-10 md:p-16 space-y-12">
        {/* Main Display Area */}
        <div className="text-center space-y-6">
          <Badge className="bg-primary/10 text-primary border-none text-[10px] px-6 py-2 rounded-full font-black tracking-[0.2em] mb-4">
            ENJEUX HISTORIQUES
          </Badge>
          
          <div className="space-y-2">
            <h2 className="text-6xl md:text-9xl font-headline font-black text-slate-900 tracking-tighter leading-none flex flex-col md:flex-row items-center justify-center gap-4">
              <span>UN MILLION</span>
              <span className="text-primary text-4xl md:text-6xl">FC</span>
            </h2>
            <p className="text-2xl md:text-3xl font-headline font-bold text-slate-400 uppercase tracking-tight">
              POUR LE CHAMPION SUPRÊME
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-4">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="font-black uppercase text-xs tracking-[0.4em] text-primary">Record de Participation</span>
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
        </div>

        {/* Progress Bar with Target */}
        <div className="space-y-6 pt-10 border-t border-slate-50">
          <div className="flex items-end justify-between px-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collecte Actuelle</p>
              <p className="font-black text-xl text-primary">{Math.round(progressValue)}%</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pot Total Estimé</p>
              <p className="font-black text-xl text-slate-900">1 500 000 FC</p>
            </div>
          </div>
          
          <div className="relative h-6 bg-slate-50 rounded-full border border-slate-100 p-1">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2"
              style={{ width: `${progressValue}%` }}
            >
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Breakdown of Winners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-10">
          {tiers.map((tier, idx) => (
            <div key={idx} className={cn(
              "p-8 rounded-[2rem] border transition-all hover:scale-[1.02]",
              idx === 0 ? "bg-slate-900 text-white border-slate-900 shadow-2xl" : "bg-white border-slate-100 text-slate-900"
            )}>
              <div className="flex items-start justify-between mb-6">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  idx === 0 ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
                )}>
                  {idx === 0 ? <Award className="w-5 h-5" /> : <span className="font-black text-sm">{idx + 1}</span>}
                </div>
                <Badge className={idx === 0 ? "bg-primary" : "bg-slate-100 text-slate-500 border-none"}>
                   {tier.percentage}%
                </Badge>
              </div>
              <h4 className="font-black uppercase text-xs tracking-widest mb-2 opacity-60">{tier.rank}</h4>
              <p className="text-3xl font-headline font-black tracking-tighter">
                {tier.isSurprise ? (
                  <span className="text-xl uppercase">Prix Surprise</span>
                ) : (
                  <>
                    {tier.amount.toLocaleString()} <span className="text-sm">FC</span>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

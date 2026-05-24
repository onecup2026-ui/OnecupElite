
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, DollarSign, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrizePoolProps {
  currentPool: number;
  targetPool: number;
  tiers: { rank: string; amount: number; percentage: number }[];
}

export function PrizePoolTracker({ currentPool, targetPool, tiers }: PrizePoolProps) {
  const progressValue = (currentPool / targetPool) * 100;

  return (
    <Card className="glass-card rounded-[3rem] border-primary/20 overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.6)]">
      <CardHeader className="bg-primary/5 p-8 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-headline font-black uppercase tracking-tighter">Cagnotte Elite</CardTitle>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Actualisé en direct</span>
          </div>
        </div>
        <TrendingUp className="w-10 h-10 text-primary animate-pulse opacity-50" />
      </CardHeader>
      
      <CardContent className="p-10 space-y-10">
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <span className="text-5xl md:text-6xl font-headline font-black text-primary tabular-nums tracking-tighter">
                {currentPool.toLocaleString()} <span className="text-2xl">FC</span>
              </span>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Montant Actuel</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-lg font-black uppercase tracking-tighter text-foreground/80">{targetPool.toLocaleString()} FC</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Objectif 2026</p>
            </div>
          </div>
          
          <div className="relative pt-2">
            <Progress value={progressValue} className="h-4 bg-muted border border-white/5 rounded-full" />
            <div 
              className="absolute top-0 w-8 h-8 bg-primary rounded-full glow-blue border-4 border-background flex items-center justify-center -translate-y-1/4 transition-all duration-1000"
              style={{ left: `calc(${progressValue}% - 16px)` }}
            >
              <Target className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Structure des gains</h4>
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Projections</span>
          </div>
          
          <div className="grid gap-3">
            {tiers.map((tier, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl glass-card border-transparent hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all group-hover:scale-110",
                    idx === 0 ? "bg-primary text-white glow-blue" : "bg-muted/50 text-muted-foreground"
                  )}>
                    {idx === 0 ? <Award className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div>
                    <p className="font-black uppercase text-xs tracking-tight group-hover:text-primary transition-colors">{tier.rank}</p>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-1 bg-primary/20 rounded-full overflow-hidden">
                        <span className="block h-full bg-primary" style={{ width: `${tier.percentage}%` }} />
                      </span>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase">{tier.percentage}% de la pool</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-headline font-black text-foreground text-lg tracking-tighter">{tier.amount.toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">FC</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

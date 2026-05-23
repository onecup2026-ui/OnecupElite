
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, DollarSign } from "lucide-react";

interface PrizePoolProps {
  currentPool: number;
  targetPool: number;
  tiers: { rank: string; amount: number; percentage: number }[];
}

export function PrizePoolTracker({ currentPool, targetPool, tiers }: PrizePoolProps) {
  const progressValue = (currentPool / targetPool) * 100;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-headline font-bold">LIVE PRIZE POOL</CardTitle>
        <TrendingUp className="w-5 h-5 text-primary animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-headline font-bold text-primary">
            ${currentPool.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-sm">/ target ${targetPool.toLocaleString()}</span>
        </div>
        
        <Progress value={progressValue} className="h-2 mb-8 bg-muted" />

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Distribution Tiers</h4>
          {tiers.map((tier, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/5">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs",
                  idx === 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {idx + 1}
                </div>
                <div>
                  <p className="font-bold text-sm">{tier.rank}</p>
                  <p className="text-xs text-muted-foreground">{tier.percentage}% of pool</p>
                </div>
              </div>
              <p className="font-headline font-bold text-primary">${tier.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { cn } from "@/lib/utils";

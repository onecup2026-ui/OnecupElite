
"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Target, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

export default function Home() {
  const db = useFirestore();
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const { data: siteConfig } = useDoc(configRef);

  const heroImage = siteConfig?.heroImageUrl || "https://picsum.photos/seed/onecup-arena-elite/1920/1080";
  const heroTitle = siteConfig?.heroTitle || "Préparez-vous pour la plus grande Coupe du Monde de l'Histoire";

  // Countdown logic
  const [timeLeft, setTimeLeft] = useState({ days: 18, hours: 9, minutes: 41, seconds: 9 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ONE CUP Style Countdown Ticker */}
      <div className="bg-black text-white py-1.5 px-4 border-b border-white/10 overflow-hidden">
        <div className="container mx-auto flex items-center justify-start gap-8 md:gap-16">
          <div className="flex items-center shrink-0">
             <span className="font-headline font-black text-[10px] uppercase tracking-widest">ONE CUP 2026™</span>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-xl font-bold tabular-nums">{timeLeft.days}</span>
              <span className="text-[8px] uppercase text-white/50 tracking-tighter">jours</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-xl font-bold tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[8px] uppercase text-white/50 tracking-tighter">heures</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-xl font-bold tabular-nums">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[8px] uppercase text-white/50 tracking-tighter">minutes</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-xl font-bold tabular-nums">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[8px] uppercase text-white/50 tracking-tighter">secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* ONE CUP Style Immersive Hero Section */}
      <section className="relative w-full">
        {/* Image Container */}
        <div className="relative aspect-[4/5] md:aspect-[21/9] w-full overflow-hidden">
          <Image
            src={heroImage}
            alt="OneCup Elite Arena"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Info Block (Blue) */}
        <div className="bg-[#0051a3] text-white p-10 md:p-20">
          <div className="container mx-auto max-w-5xl space-y-8">
            <p className="font-bold text-lg text-white/90 uppercase tracking-widest">ONE CUP ELITE 2026™</p>
            <h1 className="text-4xl md:text-7xl font-headline font-bold tracking-tight leading-tight text-white">
              {heroTitle}
            </h1>
            
            <div className="pt-6">
               <Link href="/tournaments">
                 <Button className="h-16 bg-white text-[#0051a3] hover:bg-white/90 rounded-full font-bold text-lg px-10 shadow-2xl transition-transform hover:scale-105">
                    11 juin - 19 juillet 2026
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6 group">
              <div className="w-16 h-16 bg-[#0051a3]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#0051a3] transition-colors duration-500">
                <Target className="w-8 h-8 text-[#0051a3] group-hover:text-white" />
              </div>
              <h3 className="text-3xl font-headline font-black uppercase tracking-tighter">100%<br/><span className="text-[#0051a3]">ÉQUITÉ</span></h3>
              <p className="text-muted-foreground font-medium text-lg">Un règlement strict pour garantir la justice sportive à chaque match.</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-16 h-16 bg-[#0051a3]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#0051a3] transition-colors duration-500">
                <Zap className="w-8 h-8 text-[#0051a3] group-hover:text-white" />
              </div>
              <h3 className="text-3xl font-headline font-black uppercase tracking-tighter">LIVE<br/><span className="text-[#0051a3]">DATA</span></h3>
              <p className="text-muted-foreground font-medium text-lg">Suivez les statistiques et les scores en temps réel sur tous vos écrans.</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-16 h-16 bg-[#0051a3]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#0051a3] transition-colors duration-500">
                <Star className="w-8 h-8 text-[#0051a3] group-hover:text-white" />
              </div>
              <h3 className="text-3xl font-headline font-black uppercase tracking-tighter">GLOBAL<br/><span className="text-[#0051a3]">REACH</span></h3>
              <p className="text-muted-foreground font-medium text-lg">Une visibilité média sans précédent pour les talents émergents.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

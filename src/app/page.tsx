
"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Target, Zap, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDoc, useFirestore, useCollection } from "@/firebase";
import { doc, collection } from "firebase/firestore";

export default function Home() {
  const db = useFirestore();
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const { data: siteConfig } = useDoc(configRef);

  const sponsorsRef = useMemo(() => (db ? collection(db, "sponsors") : null), [db]);
  const { data: sponsors, loading: sponsorsLoading } = useCollection(sponsorsRef);

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
      {/* ONE CUP Style Countdown Ticker - ULTRA SMALL */}
      <div className="bg-black text-white py-1 px-4 border-b border-white/10 overflow-hidden">
        <div className="container mx-auto flex items-center justify-start gap-4 md:gap-12">
          <div className="flex items-center shrink-0">
             <span className="font-headline font-black text-[8px] md:text-[10px] uppercase tracking-widest">ONE CUP 2026™</span>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs md:text-sm font-bold tabular-nums">{timeLeft.days}</span>
              <span className="text-[6px] md:text-[8px] uppercase text-white/50 tracking-tighter">j</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs md:text-sm font-bold tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[6px] md:text-[8px] uppercase text-white/50 tracking-tighter">h</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs md:text-sm font-bold tabular-nums">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[6px] md:text-[8px] uppercase text-white/50 tracking-tighter">m</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs md:text-sm font-bold tabular-nums">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[6px] md:text-[8px] uppercase text-white/50 tracking-tighter">s</span>
            </div>
          </div>
        </div>
      </div>

      {/* ONE CUP Style Immersive Hero Section */}
      <section className="relative w-full">
        <div className="relative aspect-[4/5] md:aspect-[21/9] w-full overflow-hidden">
          <Image
            src={heroImage}
            alt="OneCup Elite Arena"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="bg-[#0051a3] text-white p-8 md:p-20">
          <div className="container mx-auto max-w-5xl space-y-6 md:space-y-8">
            <p className="font-bold text-sm md:text-lg text-white/90 uppercase tracking-widest">ONE CUP ELITE 2026™</p>
            <h1 className="text-3xl md:text-7xl font-headline font-bold tracking-tight leading-tight text-white">
              {heroTitle}
            </h1>
            
            <div className="pt-4 md:pt-6">
               <Link href="/tournaments">
                 <Button className="h-12 md:h-16 bg-white text-[#0051a3] hover:bg-white/90 rounded-full font-bold text-sm md:text-lg px-8 md:px-10 shadow-2xl transition-transform hover:scale-105">
                    15 - 25 juillet 2026
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - COMPACT VERSION */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="space-y-3 md:space-y-4 group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0051a3]/10 rounded-xl flex items-center justify-center group-hover:bg-[#0051a3] transition-colors duration-500">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-[#0051a3] group-hover:text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-headline font-black uppercase tracking-tighter leading-tight">100%<br/><span className="text-[#0051a3]">ÉQUITÉ</span></h3>
              <p className="text-muted-foreground font-medium text-sm md:text-base leading-relaxed">Un règlement strict pour garantir la justice sportive à chaque match.</p>
            </div>
            <div className="space-y-3 md:space-y-4 group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0051a3]/10 rounded-xl flex items-center justify-center group-hover:bg-[#0051a3] transition-colors duration-500">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-[#0051a3] group-hover:text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-headline font-black uppercase tracking-tighter leading-tight">LIVE<br/><span className="text-[#0051a3]">DATA</span></h3>
              <p className="text-muted-foreground font-medium text-sm md:text-base leading-relaxed">Suivez les statistiques et les scores en temps réel sur tous vos écrans.</p>
            </div>
            <div className="space-y-3 md:space-y-4 group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0051a3]/10 rounded-xl flex items-center justify-center group-hover:bg-[#0051a3] transition-colors duration-500">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-[#0051a3] group-hover:text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-headline font-black uppercase tracking-tighter leading-tight">GLOBAL<br/><span className="text-[#0051a3]">REACH</span></h3>
              <p className="text-muted-foreground font-medium text-sm md:text-base leading-relaxed">Une visibilité média sans précédent pour les talents émergents.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Marquee Section */}
      <section className="bg-[#0051a3] py-12 md:py-20 overflow-hidden">
        <div className="container mx-auto px-4 mb-10 text-center">
           <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.6em] text-white/40">ONE CUP PARTNERS</span>
        </div>
        
        {sponsorsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-white/20" />
          </div>
        ) : (
          <div className="relative flex overflow-x-hidden">
            <div className="flex animate-marquee-reverse whitespace-nowrap items-center">
              {[...(sponsors || []), ...(sponsors || []), ...(sponsors || [])].map((sponsor: any, i) => (
                <div key={`${sponsor.id}-${i}`} className="mx-8 md:mx-16 shrink-0 flex items-center justify-center">
                  <img 
                    src={sponsor.logoUrl} 
                    alt={sponsor.name} 
                    className="h-10 md:h-16 w-auto object-contain brightness-0 invert opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
            <div className="absolute top-0 flex animate-marquee-reverse whitespace-nowrap items-center" aria-hidden="true">
               {[...(sponsors || []), ...(sponsors || []), ...(sponsors || [])].map((sponsor: any, i) => (
                <div key={`clone-${sponsor.id}-${i}`} className="mx-8 md:mx-16 shrink-0 flex items-center justify-center">
                  <img 
                    src={sponsor.logoUrl} 
                    alt={sponsor.name} 
                    className="h-10 md:h-16 w-auto object-contain brightness-0 invert opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Archive Section - ONE CUP+ Style */}
      <section className="relative w-full min-h-[60vh] md:h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/seed/onecup-archives-history/1920/1080"
            alt="Archives ONE CUP+"
            fill
            className="object-cover grayscale"
            priority
            data-ai-hint="vintage soccer stadium"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center space-y-8 max-w-4xl py-20">
          <h2 className="text-4xl md:text-8xl font-headline font-black text-white uppercase tracking-tighter leading-none">
            Archives <span className="text-white/40">ONE CUP+</span>
          </h2>
          <p className="text-lg md:text-2xl text-white/80 font-medium leading-relaxed">
            La bibliothèque la plus complète au monde de matches, séquences vidéo et temps forts de la ONE CUP. Revivez les moments qui ont marqué l'histoire et vibrez au rythme de la passion.
          </p>
          <div className="pt-6">
            <Link href="/news">
              <Button variant="outline" className="h-14 md:h-16 px-10 md:px-14 border-white text-white hover:bg-white hover:text-black rounded-full font-black uppercase tracking-widest text-[10px] md:text-xs transition-all bg-transparent">
                À découvrir
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

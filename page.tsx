"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Calendar, MapPin, Trophy, Ticket, ShieldCheck, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDoc, useFirestore, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

export default function Home() {
  const db = useFirestore();
  const [isMounted, setIsMounted] = useState(false);
  
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const { data: siteConfig } = useDoc(configRef);

  const sponsorsRef = useMemo(() => (db ? collection(db, "sponsors") : null), [db]);
  const { data: sponsors, loading: sponsorsLoading } = useCollection(sponsorsRef);

  const tournamentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "tournaments"), orderBy("createdAt", "desc"), limit(3));
  }, [db]);
  const { data: featuredTournaments, loading: tournamentsLoading } = useCollection(tournamentsQuery);

  const carouselImages = useMemo(() => {
    const defaults = [
      "https://picsum.photos/seed/onecup-1/1920/1080",
      "https://picsum.photos/seed/onecup-2/1920/1080",
      "https://picsum.photos/seed/onecup-3/1920/1080",
      "https://picsum.photos/seed/onecup-4/1920/1080"
    ];
    if (siteConfig?.carouselImages && Array.isArray(siteConfig.carouselImages)) {
      const filtered = siteConfig.carouselImages.filter((img: string) => img !== "");
      return filtered.length >= 4 ? filtered.slice(0, 4) : [...filtered, ...defaults.slice(filtered.length)];
    }
    return defaults;
  }, [siteConfig]);

  const heroTitle = siteConfig?.heroTitle || "La Plus Grande Coupe du Monde de l'Histoire";
  const afterCupImage = siteConfig?.afterCupImageUrl || "https://picsum.photos/seed/after-cup-fest/1600/900";
  const targetDateStr = siteConfig?.targetDate || "2026-07-15T00:00:00";

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setIsMounted(true);
    const targetDate = new Date(targetDateStr).getTime();
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Ticker Compact */}
      <div className="bg-black text-white py-2 px-4 border-b border-white/10 overflow-hidden sticky top-0 z-[110]">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <span className="font-headline font-black text-[8px] md:text-[10px] uppercase tracking-[0.4em] whitespace-nowrap">ONE CUP 2026™</span>
          <div className="flex items-center gap-4">
            {isMounted && Object.entries(timeLeft).map(([unit, val]) => (
              <div key={unit} className="flex items-baseline gap-1">
                <span className="text-xs md:text-sm font-black tabular-nums">{String(val).padStart(2, '0')}</span>
                <span className="text-[7px] md:text-[8px] uppercase text-white/40">{unit[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Stories Carousel */}
      <section className="relative w-full overflow-hidden">
        <Carousel
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 6000 })]}
          className="w-full"
        >
          <CarouselContent>
            {carouselImages.map((img, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-[3/4] md:aspect-[21/9] w-full overflow-hidden">
                  <Image src={img} alt={`Elite Slide ${index + 1}`} fill className="object-cover" priority={index === 0} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="absolute inset-x-0 bottom-0 py-16 md:py-32 pointer-events-none">
          <div className="container mx-auto px-6 md:px-20 space-y-6">
             <Badge className="bg-primary text-white border-none text-[9px] md:text-[11px] tracking-[0.5em] uppercase px-6 py-1.5 pointer-events-auto shadow-2xl">L'ÉLITE DU SPORT</Badge>
             <h1 className="text-5xl md:text-[10rem] font-headline font-black tracking-tighter leading-[0.85] text-white uppercase max-w-5xl pointer-events-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {heroTitle}
             </h1>
             <div className="pt-8 pointer-events-auto">
                <Link href="/tournaments">
                  <Button className="h-16 md:h-20 bg-white text-primary hover:bg-slate-100 rounded-full font-black px-12 gap-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] transition-all hover:scale-105 uppercase text-sm tracking-widest">
                    ENTRER DANS L'ARÈNE <ChevronRight className="w-6 h-6" />
                  </Button>
                </Link>
             </div>
          </div>
        </div>
      </section>

      {/* AFFICHE CAGNOTTE PRESTIGE HORIZONTALE - Version Finale Ultra Compacte */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <Link href="/rewards" className="group">
            <div className="relative overflow-hidden rounded-[3rem] md:rounded-[5rem] bg-slate-950 p-10 md:p-20 flex flex-col md:flex-row items-center justify-between gap-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-4 border border-white/5">
              <Trophy className="absolute -bottom-16 -left-16 w-80 h-80 text-white/5 -rotate-12 pointer-events-none" />
              
              <div className="relative z-10 space-y-8 text-center md:text-left">
                <Badge className="bg-primary text-white border-none px-8 py-2 rounded-full font-black text-xs uppercase tracking-[0.5em]">CAGNOTTE ELITE 2026</Badge>
                <div className="space-y-2">
                   <h2 className="text-5xl md:text-9xl font-headline font-black text-white uppercase tracking-tighter leading-none">UN MILLION <br/> <span className="text-primary">DE FRANCS.</span></h2>
                   <p className="text-[10px] md:text-xl text-white/40 font-black uppercase tracking-[0.4em]">LE SACRE SUPRÊME DU CHAMPION</p>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-8 md:pl-20">
                <div className="text-white flex items-end">
                   <span className="text-9xl md:text-[16rem] font-headline font-black leading-none tracking-tighter animate-fifa-in">1</span>
                   <span className="text-primary text-6xl md:text-8xl font-headline font-black mb-4 md:mb-8">M</span>
                </div>
                <Button className="h-16 md:h-20 px-16 bg-white text-slate-950 hover:bg-primary hover:text-white rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all shadow-2xl">VOIR LES RÉCOMPENSES</Button>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Tournois Réels */}
      <section className="py-24 md:py-32 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4 space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-4">
              <Badge variant="outline" className="border-primary text-primary px-8 py-2 text-[10px] font-black uppercase tracking-[0.3em] bg-primary/5">Recrutement en cours</Badge>
              <h2 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter leading-none">LES <span className="text-primary">COMPÉTITIONS.</span></h2>
            </div>
            <Link href="/tournaments">
              <Button variant="outline" className="rounded-full h-14 px-10 font-black uppercase text-[10px] tracking-widest gap-3 border-2">TOUT DÉCOUVRIR <ChevronRight className="w-5 h-5" /></Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {tournamentsLoading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="aspect-[4/5] bg-white animate-pulse rounded-[3rem]" />)
            ) : featuredTournaments?.map((t: any) => (
              <Link href={`/tournaments/${t.id}`} key={t.id} className="group">
                <div className="bg-white border-none shadow-xl overflow-hidden rounded-[3rem] transition-all hover:shadow-2xl hover:-translate-y-4 h-full flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image src={t.imageUrl || "https://picsum.photos/seed/elite-t/800/1000"} alt={t.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    <Badge className="absolute top-8 left-8 bg-primary text-white text-[10px] uppercase font-black px-6 py-2 rounded-xl shadow-2xl">{t.gameType}</Badge>
                    <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-white">
                       <span className="font-black text-[10px] uppercase tracking-widest">{t.teamsRegistered || 0} / {t.maxTeams || 16} PLACES VALIDÉES</span>
                       <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="p-10 space-y-8 flex-1 flex flex-col">
                    <h3 className="font-headline font-black uppercase text-3xl leading-none group-hover:text-primary transition-colors">{t.name}</h3>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-auto">
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {t.startDate?.split('T')[0]}</div>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {t.locationStade}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Immersive After Cup Section */}
      <section className="relative w-full py-40 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <Image src={afterCupImage} alt="After Cup Festival" fill className="object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-[3s]" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl space-y-10">
            <Badge className="bg-secondary text-white px-10 py-3 rounded-full font-black text-[11px] uppercase tracking-[0.5em] border border-white/20 shadow-2xl">
              L'APOTHÉOSE FINALE
            </Badge>
            <h2 className="text-6xl md:text-[10rem] font-headline font-black text-white uppercase tracking-tighter leading-none">AFTER <span className="text-primary">CUP</span> 2026</h2>
            <p className="text-xl md:text-3xl text-white/60 font-medium leading-relaxed max-w-4xl">Le festival de clôture où l'élite célèbre sa victoire sous les projecteurs de Kinshasa.</p>
            <div className="flex flex-col sm:flex-row items-center gap-8 pt-10">
              <Link href="/tickets">
                <Button className="h-20 px-16 bg-primary hover:bg-primary/90 text-white rounded-[2rem] font-black uppercase text-sm gap-5 shadow-[0_30px_60px_-15px_rgba(0,81,163,0.5)] transition-all hover:scale-105">
                  <Ticket className="w-6 h-6" /> RÉSERVER MON ACCÈS
                </Button>
              </Link>
              <div className="flex items-center gap-4 text-white/40 border border-white/10 px-8 py-4 rounded-2xl backdrop-blur-md">
                <ShieldCheck className="w-6 h-6 text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Billetterie Certifiée</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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
  const afterCupDescription = siteConfig?.afterCupDescription || "Vibrez au rythme de l'Elite. Célébrez la victoire, assistez au sacre des champions.";
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

  const stats = useMemo(() => {
    if (!featuredTournaments) return { teams: 0 };
    return { teams: featuredTournaments.reduce((acc, t: any) => acc + (t.teamsRegistered || 0), 0) };
  }, [featuredTournaments]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Ticker Compact */}
      <div className="bg-black text-white py-1.5 px-4 border-b border-white/10 overflow-hidden sticky top-0 z-[110]">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <span className="font-headline font-black text-[8px] md:text-[10px] uppercase tracking-widest whitespace-nowrap">ONE CUP 2026™</span>
          <div className="flex items-center gap-3 md:gap-6">
            {isMounted && Object.entries(timeLeft).map(([unit, val]) => (
              <div key={unit} className="flex items-baseline gap-0.5">
                <span className="text-[10px] md:text-sm font-black tabular-nums">{String(val).padStart(2, '0')}</span>
                <span className="text-[6px] md:text-[8px] uppercase text-white/40">{unit[0]}</span>
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="absolute inset-x-0 bottom-0 py-12 md:py-24 pointer-events-none">
          <div className="container mx-auto px-6 md:px-20 flex flex-col items-start gap-4">
             <Badge className="bg-primary text-white border-none text-[8px] md:text-[10px] tracking-[0.4em] uppercase px-4 py-1 pointer-events-auto">ONE CUP ELITE™</Badge>
             <h1 className="text-4xl md:text-8xl font-headline font-black tracking-tighter leading-[0.9] text-white uppercase max-w-4xl pointer-events-auto drop-shadow-2xl">
                {heroTitle}
             </h1>
             <div className="pt-4 pointer-events-auto">
                <Link href="/tournaments">
                  <Button className="h-12 md:h-16 bg-white text-primary hover:bg-slate-100 rounded-full font-black px-10 gap-3 shadow-xl transition-all hover:scale-105 uppercase text-xs">
                    REJOINDRE L'ARÈNE <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
             </div>
          </div>
        </div>
      </section>

      {/* AFFICHE CAGNOTTE HORIZONTALE COMPACTE */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <Link href="/rewards" className="group">
            <div className="relative overflow-hidden rounded-[2rem] md:rounded-[4rem] bg-slate-950 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl transition-all border border-white/5 hover:-translate-y-2">
              <Trophy className="absolute -bottom-10 -left-10 w-64 h-64 text-white/5 -rotate-12 pointer-events-none" />
              
              <div className="relative z-10 space-y-6 text-center md:text-left">
                <Badge className="bg-primary text-white border-none px-6 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.4em]">Cagnotte Elite 2026</Badge>
                <div className="space-y-1">
                   <h2 className="text-4xl md:text-7xl font-headline font-black text-white uppercase tracking-tighter leading-none">UN MILLION <span className="text-primary">DE FRANCS.</span></h2>
                   <p className="text-[10px] md:text-lg text-white/30 font-black uppercase tracking-[0.4em]">POUR LE CHAMPION DE L'ÉDITION ÉLITE</p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                   <div className="border-l-2 border-primary pl-4">
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Inscrits</p>
                      <p className="text-xl font-black text-white">{stats.teams} ÉQUIPES</p>
                   </div>
                   <div className="border-l-2 border-primary pl-4">
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Niveau</p>
                      <p className="text-xl font-black text-white">ELITE+</p>
                   </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-6 md:pl-10">
                <div className="text-white flex items-end">
                   <span className="text-8xl md:text-[12rem] font-headline font-black leading-none tracking-tighter animate-fifa-in">1</span>
                   <span className="text-primary text-5xl md:text-7xl font-headline font-black mb-2 md:mb-4">M</span>
                </div>
                <Button className="h-14 md:h-16 px-12 bg-white text-slate-950 hover:bg-primary hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">VOIR LES PRIX</Button>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Tournois Réels */}
      <section className="py-20 md:py-32 bg-slate-50 border-y">
        <div className="container mx-auto px-4 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Badge variant="outline" className="border-primary text-primary px-6 py-1 text-[9px] font-black uppercase tracking-widest bg-primary/5">Inscriptions Ouvertes</Badge>
              <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">LES TOURNOIS <span className="text-primary">ACTUELS.</span></h2>
            </div>
            <Link href="/tournaments">
              <Button variant="outline" className="rounded-full h-12 px-8 font-black uppercase text-[10px] tracking-widest gap-2">Découvrir tout <ChevronRight className="w-4 h-4" /></Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tournamentsLoading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="aspect-[4/5] bg-white animate-pulse rounded-[2rem]" />)
            ) : featuredTournaments?.map((t: any) => (
              <Link href={`/tournaments/${t.id}`} key={t.id} className="group">
                <Card className="bg-white border-none shadow-sm overflow-hidden rounded-[2.5rem] transition-all hover:shadow-2xl hover:-translate-y-3 h-full flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image src={t.imageUrl || "https://picsum.photos/seed/elite-t/800/1000"} alt={t.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <Badge className="absolute top-6 left-6 bg-primary text-white text-[9px] uppercase font-black px-4 py-1">{t.gameType}</Badge>
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                       <span className="font-black text-[10px] uppercase tracking-widest">{t.teamsRegistered || 0} / {t.maxTeams || 16} PLACES</span>
                       <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="p-8 space-y-6 flex-1 flex flex-col">
                    <h3 className="font-headline font-black uppercase text-2xl leading-none">{t.name}</h3>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-auto">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" /> {t.startDate?.split('T')[0]}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary" /> {t.locationStade}</div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* After Cup Immersive Section */}
      <section className="relative w-full py-32 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <Image src={afterCupImage} alt="After Cup Festival" fill className="object-cover opacity-30 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl space-y-8">
            <Badge className="bg-secondary text-white px-8 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] border border-white/10">
              L'APOTHÉOSE FINALE
            </Badge>
            <h2 className="text-5xl md:text-8xl font-headline font-black text-white uppercase tracking-tighter leading-none">AFTER <span className="text-primary">CUP</span> FESTIVAL</h2>
            <p className="text-lg md:text-2xl text-white/60 font-medium leading-relaxed max-w-3xl">{afterCupDescription}</p>
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
              <Link href="/tickets">
                <Button className="h-16 px-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase text-xs gap-4 shadow-2xl transition-all hover:scale-105">
                  <Ticket className="w-5 h-5" /> RÉSERVER MON PASS
                </Button>
              </Link>
              <div className="flex items-center gap-4 text-white/40">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Billetterie Officielle</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Horizontal Marquee */}
      <section className="bg-white py-24 border-b overflow-hidden">
        <div className="container mx-auto px-4 mb-16 text-center">
           <span className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-300">PARTENAIRES OFFICIELS ONECUP ELITE</span>
        </div>
        {sponsorsLoading ? (
          <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-200" /></div>
        ) : (
          <div className="relative flex overflow-x-hidden">
            <div className="flex animate-marquee-reverse whitespace-nowrap items-center">
              {[...(sponsors || []), ...(sponsors || []), ...(sponsors || [])].map((s: any, i) => (
                <div key={`${s.id}-${i}`} className="mx-16 md:mx-24 shrink-0 grayscale hover:grayscale-0 opacity-40 hover:opacity-100 transition-all">
                  <img src={s.logoUrl} alt={s.name} className="h-10 md:h-14 w-auto object-contain" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Elite Archives Bottom */}
      <section className="relative w-full min-h-[50vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image src="https://picsum.photos/seed/history-one/1920/1080" alt="Archives OneCup" fill className="object-cover grayscale" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center space-y-10 py-24">
          <h2 className="text-4xl md:text-7xl font-headline font-black text-white uppercase tracking-tighter leading-none">Archives <br/><span className="text-white/30">ONE CUP ELITE+</span></h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-medium">Explorez l'héritage et revivez les finales légendaires.</p>
          <div className="pt-4">
            <Link href="/news">
              <Button variant="outline" className="h-14 px-12 border-white/20 text-white hover:bg-white hover:text-black rounded-full font-black uppercase tracking-widest text-[10px] transition-all bg-transparent">DÉCOUVRIR LE JOURNAL</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

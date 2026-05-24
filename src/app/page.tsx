"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Target, Zap, Star, Loader2, Trophy, Ticket, ExternalLink, ShieldCheck, ChevronRight, Calendar, MapPin, Users, Award, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDoc, useFirestore, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function Home() {
  const db = useFirestore();
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
      return siteConfig.carouselImages.length >= 4 ? siteConfig.carouselImages : [...siteConfig.carouselImages, ...defaults.slice(siteConfig.carouselImages.length)];
    }
    return defaults;
  }, [siteConfig]);

  const heroTitle = siteConfig?.heroTitle || "La Plus Grande Coupe du Monde de l'Histoire";
  const afterCupImage = siteConfig?.afterCupImageUrl || "https://picsum.photos/seed/after-cup-fest/1600/900";
  const afterCupDescription = siteConfig?.afterCupDescription || "Vibrez au rythme de l'Elite. Célébrez la victoire, assistez au sacre des champions.";
  const targetDateStr = siteConfig?.targetDate || "2026-07-15T00:00:00";

  // Registration stats
  const stats = useMemo(() => {
    if (!featuredTournaments) return { teams: 0 };
    return { teams: featuredTournaments.reduce((acc, t: any) => acc + (t.teamsRegistered || 0), 0) };
  }, [featuredTournaments]);

  // Dynamic Countdown logic
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
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
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Ticker TRES PETIT */}
      <div className="bg-black text-white py-1 px-4 border-b border-white/10">
        <div className="container mx-auto flex items-center justify-start gap-4 md:gap-12">
          <span className="font-headline font-black text-[8px] md:text-[10px] uppercase tracking-widest">ONE CUP 2026™</span>
          <div className="flex items-center gap-4">
            {Object.entries(timeLeft).map(([unit, val]) => (
              <div key={unit} className="flex items-baseline gap-0.5">
                <span className="text-xs md:text-sm font-bold">{String(val).padStart(2, '0')}</span>
                <span className="text-[6px] md:text-[8px] uppercase text-white/50">{unit[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HERO CAROUSEL "STATUS STYLE" */}
      <section className="relative w-full group">
        <Carousel
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 5000 })]}
          className="w-full"
        >
          <CarouselContent>
            {carouselImages.map((img, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-[4/5] md:aspect-[21/9] w-full overflow-hidden">
                  <Image src={img} alt={`Slide ${index + 1}`} fill className="object-cover" priority={index === 0} />
                  <div className="absolute inset-0 bg-black/30" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="absolute inset-0 flex items-center bg-gradient-to-t from-[#0051a3] via-transparent to-transparent md:bg-none">
          <div className="container mx-auto px-6 md:px-20 mt-auto pb-10 md:pb-0 md:static">
            <div className="max-w-4xl space-y-4 md:space-y-6 md:bg-[#0051a3] md:p-16 md:shadow-2xl md:-mb-20 relative z-10 md:rounded-t-[3rem]">
              <Badge className="bg-white/20 text-white border-white/20 text-[10px] tracking-[0.3em]">ONE CUP ELITE 2026™</Badge>
              <h1 className="text-3xl md:text-7xl font-headline font-black tracking-tight leading-tight text-white uppercase">
                {heroTitle}
              </h1>
              <div className="pt-4">
                <Link href="/tournaments">
                  <Button className="h-12 md:h-16 bg-white text-[#0051a3] hover:bg-white/90 rounded-full font-black px-10 gap-3 shadow-xl transition-transform hover:scale-105">
                    REJOINDRE L'ARÈNE <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REWARDS & PRIZE SUMMARY */}
      <section className="pt-32 pb-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
             <div className="space-y-8">
                <Badge variant="outline" className="border-primary text-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.4em]">ENJEUX FINAUX</Badge>
                <div className="space-y-2">
                  <h2 className="text-5xl md:text-8xl font-headline font-black text-slate-900 leading-none tracking-tighter uppercase">
                    LA GRANDE <br/><span className="text-primary">CAGNOTTE.</span>
                  </h2>
                  <p className="text-2xl md:text-4xl font-headline font-bold text-slate-400 uppercase tracking-tight">
                    UN MILLION DE FRANCS CONGOLAIS
                  </p>
                </div>
                <div className="flex gap-12 pt-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inscriptions</p>
                      <p className="text-3xl font-black text-slate-900">{stats.teams} <span className="text-sm opacity-40">Equipes</span></p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prestige</p>
                      <p className="text-3xl font-black text-slate-900">100% <span className="text-sm opacity-40">Elite</span></p>
                   </div>
                </div>
             </div>

             <div className="relative group cursor-pointer" onClick={() => window.location.href='/rewards'}>
                <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl group-hover:bg-primary/10 transition-all" />
                <Card className="relative bg-slate-900 text-white rounded-[3rem] p-12 border-none shadow-2xl overflow-hidden">
                   <Trophy className="absolute top-10 right-10 w-32 h-32 text-white/5 -rotate-12" />
                   <div className="space-y-6 relative z-10">
                      <Badge className="bg-primary text-white font-black px-4 py-1 rounded-lg">LIVE PRIZE</Badge>
                      <p className="text-7xl md:text-8xl font-headline font-black tracking-tighter leading-none">
                        1<span className="text-primary">M</span>
                      </p>
                      <p className="text-sm font-black uppercase tracking-[0.3em] text-white/60">Francs Congolais pour le Champion</p>
                      <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest gap-2">
                         Détails des Gains <TrendingUp className="w-4 h-4" />
                      </Button>
                   </div>
                </Card>
             </div>
          </div>
        </div>
      </section>

      {/* TOURNOIS RECENTS */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 space-y-12">
          <div className="flex items-end justify-between border-b pb-6">
            <div className="space-y-2">
              <Badge variant="outline" className="border-primary text-primary px-4 py-1 text-[9px] font-black uppercase tracking-widest">Inscriptions Ouvertes</Badge>
              <h2 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter">LES TOURNOIS <span className="text-primary">DU MOMENT.</span></h2>
            </div>
            <Link href="/tournaments">
              <Button variant="link" className="font-black uppercase text-xs tracking-widest gap-2 p-0">Voir tout <ChevronRight className="w-4 h-4" /></Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tournamentsLoading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="h-64 bg-white animate-pulse rounded-3xl" />)
            ) : featuredTournaments?.map((t: any) => (
              <Link href={`/tournaments/${t.id}`} key={t.id} className="group">
                <Card className="bg-white border-none shadow-md overflow-hidden rounded-[2rem] transition-all group-hover:shadow-2xl group-hover:-translate-y-2">
                  <div className="relative aspect-video overflow-hidden">
                    <Image src={t.imageUrl || "https://picsum.photos/seed/tourn/800/600"} alt={t.name} fill className="object-cover transition-transform group-hover:scale-105" />
                    <Badge className="absolute top-4 left-4 bg-primary text-white text-[9px] uppercase font-black">{t.gameType}</Badge>
                  </div>
                  <div className="p-8 space-y-4">
                    <h3 className="font-headline font-black uppercase text-xl line-clamp-1">{t.name}</h3>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {t.startDate?.split('T')[0]}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {t.locationStade}</div>
                    </div>
                    <Button className="w-full h-12 bg-slate-50 hover:bg-primary hover:text-white text-slate-900 border-none shadow-none rounded-xl font-black uppercase text-[10px]">S'inscrire Maintenant</Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AFTER CUP Section */}
      <section className="relative w-full py-24 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <Image src={afterCupImage} alt="After Cup" fill className="object-cover opacity-40 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl space-y-8">
            <Badge className="bg-secondary text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] border border-white/20">L'APOTHÉOSE FINALE</Badge>
            <h2 className="text-5xl md:text-8xl font-headline font-black text-white uppercase tracking-tighter leading-none">AFTER <span className="text-primary">CUP</span> FESTIVAL</h2>
            <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed max-w-2xl">{afterCupDescription}</p>
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
              <Link href="/tickets">
                <Button size="lg" className="h-16 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase text-sm gap-3 shadow-2xl transition-transform hover:scale-105">
                  <Ticket className="w-5 h-5" /> Réserver mon Pass Festival
                </Button>
              </Link>
              <div className="flex items-center gap-4 text-white/60">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Billetterie Officielle</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPONSORS MARQUEE */}
      <section className="bg-white py-20 border-y overflow-hidden">
        <div className="container mx-auto px-4 mb-12 text-center">
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">NOS PARTENAIRES OFFICIELS</span>
        </div>
        {sponsorsLoading ? (
          <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-200" /></div>
        ) : (
          <div className="relative flex overflow-x-hidden">
            <div className="flex animate-marquee-reverse whitespace-nowrap items-center">
              {[...(sponsors || []), ...(sponsors || []), ...(sponsors || [])].map((s: any, i) => (
                <div key={`${s.id}-${i}`} className="mx-12 md:mx-20 shrink-0 flex items-center justify-center grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all">
                  <img src={s.logoUrl} alt={s.name} className="h-8 md:h-12 w-auto object-contain" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ARCHIVES */}
      <section className="relative w-full min-h-[60vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image src="https://picsum.photos/seed/history/1920/1080" alt="Archives" fill className="object-cover grayscale" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center space-y-8 py-24">
          <h2 className="text-4xl md:text-8xl font-headline font-black text-white uppercase tracking-tighter leading-none">Archives <span className="text-white/40">ONE CUP+</span></h2>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-medium">Revivez les moments de légende qui ont forgé l'histoire d'OneCup Elite.</p>
          <div className="pt-6">
            <Link href="/news">
              <Button variant="outline" className="h-16 px-14 border-white text-white hover:bg-white hover:text-black rounded-full font-black uppercase tracking-widest text-xs transition-all bg-transparent">À DÉCOUVRIR</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
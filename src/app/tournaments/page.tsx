
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Search, Calendar, MapPin, ArrowRight, Gamepad2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function TournamentsPage() {
  const db = useFirestore();
  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const { data: tournaments, loading } = useCollection(tournamentsRef);
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return tournaments?.filter((t: any) => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || t.gameType.toLowerCase() === category.toLowerCase() || (category === "esport" && t.gameType.toLowerCase() === "jeux vidéo");
      return matchesSearch && matchesCategory;
    }) || [];
  }, [tournaments, search, category]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4 text-center max-w-4xl mx-auto">
        <Badge variant="outline" className="border-primary text-primary font-bold uppercase tracking-widest">DISCIPLINES ONECUP 2026</Badge>
        <h1 className="text-5xl md:text-7xl font-headline font-bold uppercase tracking-tighter">CHOISISSEZ VOTRE <span className="text-primary">ARÈNE</span></h1>
        <p className="text-muted-foreground text-xl">
          Qu'il s'agisse de dominer le gazon ou de régner sur PlayStation, 
          chaque discipline de la ONECUP offre une chance de devenir une légende.
        </p>
      </header>

      {/* Main Categories Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-card to-muted/20 hover:border-primary/40 transition-all duration-500 shadow-xl">
           <div className="aspect-[21/9] relative overflow-hidden">
             <Image src="https://picsum.photos/seed/foot-pro/1200/600" fill alt="Football" className="object-cover transition-transform duration-700 group-hover:scale-110" />
             <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
             <div className="absolute bottom-6 left-8 flex items-center gap-3">
               <Trophy className="w-8 h-8 text-primary" />
               <h2 className="text-3xl font-headline font-bold uppercase">Ligue Football Élite</h2>
             </div>
           </div>
           <div className="p-8 space-y-4">
              <p className="text-muted-foreground font-medium">Le pilier de la ONECUP. 11 contre 11, intensité maximale, arbitrage professionnel et reconnaissance nationale.</p>
              <Button onClick={() => setCategory("football")} className="gap-2 bg-primary uppercase font-bold text-xs h-10 rounded-xl">Voir l'épreuve Football</Button>
           </div>
        </div>

        <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-card to-muted/20 hover:border-secondary/40 transition-all duration-500 shadow-xl">
           <div className="aspect-[21/9] relative overflow-hidden">
             <Image src="https://picsum.photos/seed/ps5-pro/1200/600" fill alt="E-sport" className="object-cover transition-transform duration-700 group-hover:scale-110" />
             <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
             <div className="absolute bottom-6 left-8 flex items-center gap-3">
               <Gamepad2 className="w-8 h-8 text-secondary" />
               <h2 className="text-3xl font-headline font-bold uppercase">Challenge PS5 Élite</h2>
             </div>
           </div>
           <div className="p-8 space-y-4">
              <p className="text-muted-foreground font-medium">L'arène technologique. Précision, tactique numérique et ambiance électrique pour les virtuoses de la manette.</p>
              <Button onClick={() => setCategory("esport")} className="gap-2 bg-secondary uppercase font-bold text-xs h-10 rounded-xl">Voir l'épreuve E-Sport</Button>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between sticky top-16 z-40 bg-background/80 backdrop-blur py-6 border-b border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une épreuve..."
            className="pl-10 h-12 bg-card border-white/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Tabs value={category} onValueChange={setCategory} className="w-full md:w-auto">
          <TabsList className="bg-muted p-1 h-12">
            <TabsTrigger value="all" className="uppercase font-bold text-xs">Toutes</TabsTrigger>
            <TabsTrigger value="football" className="uppercase font-bold text-xs">Football</TabsTrigger>
            <TabsTrigger value="esport" className="uppercase font-bold text-xs">PlayStation</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((t: any) => (
          <div key={t.id} className="group bg-card border border-white/5 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col h-full shadow-lg">
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={t.imageUrl || "https://picsum.photos/seed/onecup/800/600"}
                alt={t.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <Badge className="absolute top-4 left-4 bg-primary glow-blue border-none font-bold uppercase">{t.gameType}</Badge>
            </div>
            
            <div className="p-8 flex flex-col flex-1 space-y-6">
              <h3 className="text-2xl font-headline font-bold uppercase leading-tight">{t.name}</h3>
              
              <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground font-medium">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  {t.startDate ? new Date(t.startDate).toLocaleDateString() : "Juillet 2026"}
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  {t.locationStade || "OneCup Arena"}
                </div>
              </div>

              <div className="pt-4 mt-auto">
                <Link href={`/tournaments/${t.id}`}>
                  <Button className="w-full h-12 gap-2 bg-primary glow-blue transition-all uppercase font-bold text-xs rounded-xl">
                    Accéder aux détails <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-[2.5rem]">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
          <p className="text-muted-foreground font-bold uppercase tracking-widest">Aucune épreuve trouvée</p>
        </div>
      )}
    </div>
  );
}


"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Search, Filter, Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const tournaments = [
  {
    id: "1",
    name: "Golden Goal League",
    sport: "Football",
    status: "Registration Open",
    date: "June 20, 2026",
    location: "National Stadium",
    prize: "$5,000",
    teams: "16/32",
    image: PlaceHolderImages.find(img => img.id === 'football-tournament')?.imageUrl || ""
  },
  {
    id: "2",
    name: "Cyber Strike Open",
    sport: "Video Games",
    status: "Registration Open",
    date: "July 05, 2026",
    location: "Digital Arena",
    prize: "$10,000",
    teams: "8/16",
    image: PlaceHolderImages.find(img => img.id === 'gaming-tournament')?.imageUrl || ""
  },
  {
    id: "3",
    name: "Beach Spike Pro",
    sport: "Volleyball",
    status: "Upcoming",
    date: "August 12, 2026",
    location: "Azure Coast",
    prize: "$3,000",
    teams: "0/12",
    image: "https://picsum.photos/seed/onecup-volley/800/600"
  }
];

export default function TournamentsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = tournaments.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || t.sport.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">ALL TOURNAMENTS</h1>
        <p className="text-muted-foreground max-w-2xl">
          Browse our catalog of competitive events. From professional leagues to community cups, find your next challenge here.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between sticky top-20 z-40 bg-background/80 backdrop-blur py-4 border-b">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tournament name..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Tabs value={category} onValueChange={setCategory} className="w-full md:w-auto">
          <TabsList className="bg-card border w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="football">Football</TabsTrigger>
            <TabsTrigger value="video games">Esports</TabsTrigger>
            <TabsTrigger value="volleyball">Volleyball</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((t) => (
          <div key={t.id} className="group bg-card border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col h-full shadow-lg">
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={t.image}
                alt={t.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur-md text-foreground border-white/10">{t.sport}</Badge>
              <Badge className="absolute bottom-4 left-4 bg-primary glow-blue border-none">{t.status}</Badge>
            </div>
            
            <div className="p-6 flex flex-col flex-1 space-y-4">
              <h3 className="text-xl font-headline font-bold">{t.name}</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {t.date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {t.location}
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  {t.prize} Pool
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  {t.teams} Teams
                </div>
              </div>

              <div className="pt-4 mt-auto">
                <Link href={`/tournaments/${t.id}`}>
                  <Button className="w-full gap-2 group-hover:bg-primary glow-blue transition-all">
                    View Details <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold">No tournaments found</h3>
          <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
        </div>
      )}
    </div>
  );
}

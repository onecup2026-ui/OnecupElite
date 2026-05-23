
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, Star, DollarSign, Calendar, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrizePoolTracker } from "@/components/shared/prize-pool-tracker";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const stats = [
  { label: "Équipes Actives", value: "128+", icon: Users },
  { label: "Tournois", value: "24", icon: Trophy },
  { label: "Cagnotte Totale", value: "50K€", icon: DollarSign },
  { label: "Partenaires Globaux", value: "15", icon: Star },
];

const upcomingTournaments = [
  {
    id: "t1",
    name: "Summer Pro Football Cup",
    category: "Football",
    date: "15 Juin 2026",
    prize: "10 000€",
    image: PlaceHolderImages.find(img => img.id === 'football-tournament')?.imageUrl || null,
    imageHint: PlaceHolderImages.find(img => img.id === 'football-tournament')?.imageHint || "soccer"
  },
  {
    id: "t2",
    name: "Elite Gaming Series: Warzone",
    category: "Esports",
    date: "02 Juillet 2026",
    prize: "15 000€",
    image: PlaceHolderImages.find(img => img.id === 'gaming-tournament')?.imageUrl || null,
    imageHint: PlaceHolderImages.find(img => img.id === 'gaming-tournament')?.imageHint || "gaming"
  }
];

export default function Home() {
  const heroImageData = PlaceHolderImages.find(img => img.id === 'hero-bg');
  const heroImage = heroImageData?.imageUrl || null;
  const heroHint = heroImageData?.imageHint || "stadium";

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImage && (
            <Image
              src={heroImage}
              alt="OneCup Hero"
              fill
              className="object-cover opacity-50 scale-105"
              priority
              data-ai-hint={heroHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl space-y-6">
            <Badge variant="outline" className="border-primary text-primary px-4 py-1 rounded-full animate-pulse bg-primary/10">
              VERSION 1.0 DISPONIBLE
            </Badge>
            <h1 className="text-6xl md:text-8xl font-headline font-bold leading-none tracking-tighter">
              AU-DELÀ DE LA <span className="text-primary italic">COUPE.</span><br />
              REJOIGNEZ <span className="text-primary">L'ÉLITE.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-body max-w-xl">
              Le premier écosystème pour la gestion de tournois, l'interaction communautaire et les événements sportifs professionnels.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/tournaments">
                <Button size="lg" className="h-14 px-8 bg-primary hover:bg-primary/90 glow-blue text-lg gap-2">
                  Participer <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2 backdrop-blur-sm">
                <Play className="w-5 h-5 fill-current" /> Voir la Promo
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Prize Pool Widget */}
        <div className="hidden xl:block absolute right-24 top-1/2 -translate-y-1/2 w-[400px] animate-float">
          <PrizePoolTracker
            currentPool={52400}
            targetPool={150000}
            tiers={[
              { rank: "Champion Or", amount: 25000, percentage: 50 },
              { rank: "Finaliste Argent", amount: 15000, percentage: 30 },
              { rank: "3ème Place Bronze", amount: 10000, percentage: 20 },
            ]}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2 p-6 rounded-2xl border border-white/5 hover:bg-muted/30 transition-colors">
                <div className="p-3 bg-primary/10 rounded-xl mb-2">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-headline font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-headline font-bold">BATAILLES À VENIR</h2>
              <p className="text-muted-foreground">Le prochain chapitre de la compétition commence ici.</p>
            </div>
            <Link href="/tournaments">
              <Button variant="ghost" className="gap-2 group">
                Tous les événements <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {upcomingTournaments.map((tournament) => (
              <div key={tournament.id} className="group relative overflow-hidden rounded-3xl bg-card border hover:border-primary/50 transition-all duration-500">
                <div className="aspect-[16/9] relative overflow-hidden">
                  {tournament.image && (
                    <Image
                      src={tournament.image}
                      alt={tournament.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      data-ai-hint={tournament.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                  <Badge className="absolute top-6 left-6 bg-primary/90 text-white font-bold">{tournament.category}</Badge>
                </div>
                <div className="p-8 space-y-4">
                  <h3 className="text-2xl font-headline font-bold group-hover:text-primary transition-colors">{tournament.name}</h3>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {tournament.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      {tournament.prize} de Cashprize
                    </div>
                  </div>
                  <div className="pt-4 flex gap-4">
                    <Button className="flex-1 bg-primary hover:bg-primary/90 glow-blue">Rejoindre</Button>
                    <Button variant="outline" className="flex-1">Détails</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsor Marquee */}
      <section className="py-16 bg-muted/20 border-y">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-10 font-bold">Ils nous font confiance</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-32 relative">
                <Image
                  src={`https://picsum.photos/seed/sponsor-logo-${i}/200/60`}
                  alt="Sponsor"
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

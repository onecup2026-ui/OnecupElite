"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowRight, Share2, Bookmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const articles = [
  {
    id: "1",
    title: "Le Golden Goal League : Retour sur une finale historique",
    excerpt: "Revivez les moments forts de la finale qui a opposé les Titans du Sud aux Phénix de l'Ouest. Un match qui restera gravé dans les mémoires.",
    category: "Tournois",
    date: "12 Mai 2026",
    author: "Marc Lavoine",
    image: "https://picsum.photos/seed/news-1/800/500",
    imageHint: "soccer victory"
  },
  {
    id: "2",
    title: "Interview : Le prodige de Warzone nous livre ses secrets",
    excerpt: "Après sa victoire éclatante au Cyber Strike Open, 'X-Slayer' nous explique comment il gère la pression des grands rendez-vous.",
    category: "Esports",
    date: "08 Mai 2026",
    author: "Elena Rossi",
    image: "https://picsum.photos/seed/news-2/800/500",
    imageHint: "gaming headset"
  },
  {
    id: "3",
    title: "OneCup After Cup : La fête s'annonce grandiose",
    excerpt: "Découvrez la programmation complète de la soirée de clôture. Entre DJs internationaux et remises de prix, vous ne voulez pas rater ça.",
    category: "Événements",
    date: "05 Mai 2026",
    author: "Sophie Chen",
    image: "https://picsum.photos/seed/news-3/800/500",
    imageHint: "party lights"
  },
  {
    id: "4",
    title: "Mise à jour : Nouveau système de classement pour la Saison 4",
    excerpt: "Nous avons revu notre algorithme pour garantir des matchs encore plus équilibrés et une progression plus juste pour toutes les équipes.",
    category: "Plateforme",
    date: "01 Mai 2026",
    author: "L'Équipe Technique",
    image: "https://picsum.photos/seed/news-4/800/500",
    imageHint: "technology data"
  }
];

export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4">
        <Badge variant="outline" className="border-primary text-primary px-3 py-1">LE JOURNAL ONECUP</Badge>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase">ACTUALITÉS</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Plongez au cœur de l'action. Résultats, analyses, interviews exclusives et mises à jour de la plateforme OneCup.
        </p>
      </header>

      {/* Featured Article */}
      <div className="relative rounded-3xl overflow-hidden aspect-[21/9] min-h-[400px] group border border-white/5">
        <Image
          src="https://picsum.photos/seed/featured-news/1600/900"
          alt="Featured News"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
          data-ai-hint="stadium crowd"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-12 space-y-4 max-w-3xl">
          <Badge className="bg-primary glow-blue">À LA UNE</Badge>
          <h2 className="text-3xl md:text-5xl font-headline font-bold leading-tight">
            Lancement de la Road to Glory 2026 : Inscrivez votre légende
          </h2>
          <p className="text-muted-foreground text-lg hidden md:block">
            Le plus grand tournoi amateur d'Europe ouvre ses portes. Plus de 500 équipes attendues pour un cashprize record de 100 000€.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 glow-blue gap-2 h-12">
            Lire l'article complet <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <Card key={article.id} className="bg-card/50 border-white/5 hover:border-primary/30 transition-all duration-300 flex flex-col group overflow-hidden">
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                data-ai-hint={article.imageHint}
              />
              <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur-md text-foreground border-white/10">
                {article.category}
              </Badge>
            </div>
            
            <CardHeader className="p-6">
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" />
                  {article.date}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-primary" />
                  {article.author}
                </div>
              </div>
              <CardTitle className="text-xl font-headline font-bold leading-tight group-hover:text-primary transition-colors">
                {article.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-6 flex-grow">
              <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                {article.excerpt}
              </p>
            </CardContent>
            
            <CardFooter className="px-6 py-6 border-t border-white/5 flex items-center justify-between">
              <Link href={`/news/${article.id}`}>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-primary font-bold gap-2 group/btn">
                  LIRE LA SUITE <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Newsletter Section */}
      <section className="bg-primary/5 rounded-3xl p-8 md:p-16 border border-primary/20 text-center space-y-6">
        <h3 className="text-2xl md:text-4xl font-headline font-bold">RESTEZ DANS LE MATCH</h3>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Inscrivez-vous à notre newsletter pour recevoir les dernières annonces de tournois et les exclusivités OneCup directement dans votre boîte mail.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="votre@email.com"
            className="flex-grow h-12 px-6 rounded-full bg-background border border-white/10 focus:border-primary outline-none transition-colors"
          />
          <Button className="bg-primary hover:bg-primary/90 glow-blue rounded-full h-12 px-8 font-bold">
            S'ABONNER
          </Button>
        </div>
      </section>
    </div>
  );
}

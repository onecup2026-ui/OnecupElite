
"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowRight, Share2, Bookmark, Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";

export default function NewsPage() {
  const db = useFirestore();
  const articlesRef = useMemo(() => (db ? collection(db, "articles") : null), [db]);
  const { data: articles, loading } = useCollection(articlesRef);

  const featuredArticle = articles?.[0] || null;
  const otherArticles = articles?.slice(1) || [];

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <header className="space-y-4">
        <Badge variant="outline" className="border-primary text-primary px-3 py-1 font-bold">LE JOURNAL ONECUP</Badge>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase">ACTUALITÉS</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Plongez au cœur de l'action. Résultats, analyses, interviews exclusives et mises à jour de la plateforme OneCup.
        </p>
      </header>

      {/* Featured Article */}
      {featuredArticle && (
        <div className="relative rounded-3xl overflow-hidden aspect-[21/9] min-h-[400px] group border border-white/5 shadow-2xl">
          <Image
            src={featuredArticle.imageUrl || "https://picsum.photos/seed/featured-news/1600/900"}
            alt={featuredArticle.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 md:p-12 space-y-4 max-w-3xl">
            <Badge className="bg-primary glow-blue font-bold uppercase">À LA UNE</Badge>
            <h2 className="text-3xl md:text-5xl font-headline font-bold leading-tight uppercase">
              {featuredArticle.title}
            </h2>
            <p className="text-muted-foreground text-lg hidden md:block line-clamp-2">
              {featuredArticle.excerpt}
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 glow-blue gap-2 h-12 uppercase font-bold">
              Lire l'article complet <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {otherArticles.map((article: any) => (
          <Card key={article.id} className="bg-card/50 border-white/5 hover:border-primary/30 transition-all duration-300 flex flex-col group overflow-hidden shadow-xl">
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={article.imageUrl || "https://picsum.photos/seed/news/800/500"}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur-md text-foreground border-white/10 font-bold uppercase">
                {article.category}
              </Badge>
            </div>
            
            <CardHeader className="p-6">
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 font-bold uppercase">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" />
                  {article.date}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-primary" />
                  {article.author}
                </div>
              </div>
              <CardTitle className="text-xl font-headline font-bold leading-tight group-hover:text-primary transition-colors uppercase">
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
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-primary font-bold gap-2 group/btn uppercase text-xs">
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

      {!loading && articles?.length === 0 && (
        <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-white/10">
          <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold uppercase">Aucune actualité publiée</h3>
          <p className="text-muted-foreground">Revenez plus tard pour les derniers résultats.</p>
        </div>
      )}
    </div>
  );
}

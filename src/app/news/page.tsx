
"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowRight, Newspaper, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function NewsPage() {
  const db = useFirestore();
  const newsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "articles"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: articles, loading } = useCollection(newsQuery);

  const featuredArticle = articles?.[0] || null;
  const otherArticles = articles?.slice(1) || [];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header FIFA Style */}
      <header className="bg-secondary text-white py-16 md:py-24 px-4 overflow-hidden relative">
        <div className="container mx-auto relative z-10 space-y-4">
          <Badge variant="outline" className="border-primary text-primary px-4 py-1 font-black uppercase tracking-widest text-[10px]">Actualités Elite</Badge>
          <h1 className="text-5xl md:text-8xl font-headline font-black uppercase tracking-tighter leading-none">LE JOURNAL <br/><span className="text-white/40">OFFICIEL.</span></h1>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
      </header>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Featured News */}
        {featuredArticle && (
          <div className="relative rounded-[3rem] overflow-hidden aspect-[21/9] min-h-[400px] group border border-white shadow-2xl">
            <Image
              src={featuredArticle.imageUrl || "https://picsum.photos/seed/news-hero/1600/900"}
              alt={featuredArticle.title}
              fill
              className="object-cover opacity-60 transition-transform duration-[2s] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 md:p-16 space-y-6 max-w-4xl">
              <Badge className="bg-primary text-white font-black uppercase px-6 py-2 rounded-xl shadow-lg">À LA UNE</Badge>
              <h2 className="text-3xl md:text-6xl font-headline font-black text-white leading-[0.9] uppercase tracking-tighter">
                {featuredArticle.title}
              </h2>
              <p className="text-white/70 text-lg hidden md:block line-clamp-2 max-w-2xl font-medium">
                {featuredArticle.excerpt}
              </p>
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-16 px-12 rounded-2xl font-black uppercase gap-3 shadow-2xl">
                Lire l'Article <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Other News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {otherArticles.map((article: any) => (
            <Card key={article.id} className="bg-white border-none shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col group overflow-hidden rounded-[2.5rem]">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={article.imageUrl || "https://picsum.photos/seed/news/800/600"}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <Badge className="absolute top-6 left-6 bg-primary/90 text-white font-black uppercase px-4 py-1 text-[9px] rounded-lg">
                  {article.category}
                </Badge>
              </div>
              
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
                  <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" /> {article.date}</div>
                </div>
                <CardTitle className="text-2xl font-headline font-black leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">
                  {article.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="px-8 pb-8 flex-grow">
                <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed font-medium">
                  {article.excerpt}
                </p>
              </CardContent>
              
              <CardFooter className="px-8 py-8 border-t border-slate-50">
                <Button variant="ghost" className="p-0 h-auto font-black uppercase text-xs tracking-widest text-primary gap-2 hover:bg-transparent">
                  Continuer la lecture <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {articles?.length === 0 && (
          <div className="text-center py-32 space-y-6">
            <Newspaper className="w-20 h-20 text-slate-200 mx-auto" />
            <h3 className="text-2xl font-headline font-black uppercase text-slate-400">Aucun article publié</h3>
          </div>
        )}
      </div>
    </div>
  );
}

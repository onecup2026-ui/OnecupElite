
"use client";

import { useState } from "react";
import { MessageSquare, ThumbsUp, Share2, TrendingUp, ShieldCheck, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const initialPosts = [
  {
    id: "p1",
    author: "Marco Rossi",
    handle: "@marcosports",
    time: "2h ago",
    content: "Who's ready for the Golden Goal League? Our team has been training for 3 months straight! Expect fireworks ⚽️🔥",
    likes: 24,
    comments: 12,
    trending: true
  },
  {
    id: "p2",
    author: "Elena Gamer",
    handle: "@elenaxpro",
    time: "4h ago",
    content: "Just saw the prize pool for Cyber Strike Open. $10k is huge! Anyone looking for a sub player for Warzone?",
    likes: 45,
    comments: 28,
    trending: true
  }
];

export default function CommunityPage() {
  const [posts, setPosts] = useState(initialPosts);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Left: Pulse & Topics */}
        <div className="hidden lg:block space-y-6">
          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-primary font-bold">Pulse Insight</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Main Sentiment</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20">Highly Positive</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-tighter">Trending Topics</p>
                {["#GoldenGoal26", "#WarzoneElite", "#TeamSpirit", "#PrizePool"].map((tag) => (
                  <div key={tag} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm font-medium hover:text-primary transition-colors">{tag}</span>
                    <TrendingUp className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <CardTitle className="text-xs uppercase tracking-widest text-primary">Moderated Hub</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Our community is monitored by ONE AI to ensure a toxic-free and professional environment for all athletes.</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold">COMMUNITY HUB</h1>
            <p className="text-muted-foreground">Join the conversation with thousands of players and fans.</p>
          </div>

          <Card className="bg-card border-primary/20 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center p-4 gap-4">
                <Avatar className="w-10 h-10 border border-primary/20">
                  <AvatarImage src="https://picsum.photos/seed/user-current/100/100" />
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <Input placeholder="Share a highlight or start a discussion..." className="bg-muted border-none h-12 rounded-full px-6" />
                <Button size="icon" className="w-12 h-12 rounded-full bg-primary glow-blue">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="bg-card border-white/5 hover:border-white/10 transition-colors">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://picsum.photos/seed/${post.id}/100/100`} />
                    <AvatarFallback>{post.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{post.author}</p>
                      {post.trending && <Badge className="text-[10px] h-4 bg-primary/20 text-primary border-none">Trending</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{post.handle} • {post.time}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{post.content}</p>
                </CardContent>
                <CardFooter className="border-t border-white/5 py-3 flex gap-6">
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                    <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                    <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{post.comments}</span>
                  </button>
                  <button className="ml-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar Right: Trending Events */}
        <div className="hidden lg:block space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Featured Highlights</h3>
          {[1, 2].map((i) => (
            <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer">
              <Image
                src={`https://picsum.photos/seed/highlight-${i}/400/400`}
                alt="Highlight"
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <p className="text-white text-xs font-bold uppercase tracking-wider mb-1">Live Update</p>
                <p className="text-white text-sm font-medium leading-tight">Amazing hat-trick in the Quarter Finals! 🔥</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

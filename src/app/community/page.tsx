
"use client";

import { useState, useMemo } from "react";
import { MessageSquare, ThumbsUp, Share2, TrendingUp, ShieldCheck, Plus, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirestore, useCollection, useUser, useAuth } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function CommunityPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const postsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
  }, [db]);

  const { data: posts, loading } = useCollection(postsQuery);

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Bienvenue !", description: "Vous êtes maintenant connecté." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur de connexion", description: "Impossible de se connecter." });
    }
  };

  const handleCreatePost = () => {
    if (!db || !user || !newPostContent.trim()) return;

    setIsPosting(true);
    const postData = {
      userId: user.uid,
      authorName: user.displayName || "Membre Elite",
      authorPhoto: user.photoURL || "",
      content: newPostContent,
      createdAt: serverTimestamp(),
      likes: 0
    };

    addDoc(collection(db, "posts"), postData)
      .then(() => {
        setNewPostContent("");
        toast({ title: "Message publié", description: "Votre message est maintenant visible par la communauté." });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/posts',
          operation: 'create',
          requestResourceData: postData
        }));
      })
      .finally(() => setIsPosting(false));
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Left: Pulse & Topics */}
        <div className="hidden lg:block space-y-6">
          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-primary font-bold">Aperçu du Pulse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Sentiment Général</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20">Élite Dynamique</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-tighter">Sujets Tendances</p>
                {["#OneCupElite", "#Finale2026", "#EspritDEquipe", "#CagnotteRecord"].map((tag) => (
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
              <CardTitle className="text-xs uppercase tracking-widest text-primary">Hub Modéré</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Notre communauté est sécurisée pour garantir un environnement sain pour tous les athlètes.</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold uppercase">HUB COMMUNAUTAIRE</h1>
            <p className="text-muted-foreground">Exprimez-vous et partagez vos moments forts avec l'élite.</p>
          </div>

          {user ? (
            <Card className="bg-card border-primary/20 shadow-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center p-4 gap-4">
                  <Avatar className="w-10 h-10 border border-primary/20">
                    <AvatarImage src={user.photoURL || ""} />
                    <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <Input 
                    placeholder="Partagez un moment fort..." 
                    className="bg-muted border-none h-12 rounded-full px-6"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreatePost()}
                  />
                  <Button 
                    size="icon" 
                    className="w-12 h-12 rounded-full bg-primary glow-blue shrink-0"
                    disabled={isPosting || !newPostContent.trim()}
                    onClick={handleCreatePost}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-primary/5 border-primary/30 p-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">Connectez-vous pour rejoindre la discussion et partager vos moments.</p>
              <Button onClick={handleLogin} className="bg-primary glow-blue gap-2 uppercase font-bold">
                <LogIn className="w-4 h-4" /> Se connecter avec Google
              </Button>
            </Card>
          )}

          <div className="space-y-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="h-32 bg-muted animate-pulse border-none" />
              ))
            ) : posts && posts.length > 0 ? (
              posts.map((post: any) => (
                <Card key={post.id} className="bg-card border-white/5 hover:border-white/10 transition-colors">
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={post.authorPhoto} />
                      <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{post.authorName}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: fr }) : "À l'instant"}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base leading-relaxed">{post.content}</p>
                  </CardContent>
                  <CardFooter className="border-t border-white/5 py-2 flex gap-6">
                    <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group">
                      <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{post.likes || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="ml-auto flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
                <p className="text-muted-foreground italic">Soyez le premier à lancer la discussion !</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Right: Trending Events fallback */}
        <div className="hidden lg:block space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Moments Forts</h3>
          {[1, 2].map((i) => (
            <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/5">
              <img
                src={`https://picsum.photos/seed/highlight-${i}/400/400`}
                alt="Highlight"
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-4">
                <p className="text-white text-[10px] font-bold uppercase tracking-wider mb-1">Elite Moment</p>
                <p className="text-white text-xs font-medium leading-tight">Vibrez avec la communauté OneCup 2026 🔥</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

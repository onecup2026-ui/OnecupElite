
"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Trophy, Calendar, MapPin, Users, ArrowLeft, Loader2, 
  CheckCircle2, AlertCircle, LogIn, DollarSign, Clock, 
  Phone, ShieldCheck, Info, Star, Share2, FileText, 
  Car, Utensils, Zap, HelpCircle, Medal, MessageCircle, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDoc, useFirestore, useUser, useAuth, useCollection } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp, updateDoc, increment, query, where } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function TournamentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();

  const tournamentRef = useMemo(() => (db && id ? doc(db, "tournaments", id as string) : null), [db, id]);
  const { data: tournament, loading: loadingTournament } = useDoc(tournamentRef);

  const registrationsQuery = useMemo(() => {
    if (!db || !id) return null;
    return query(collection(db, "registrations"), where("tournamentId", "==", id));
  }, [db, id]);
  const { data: registrations } = useCollection(registrationsQuery);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "",
    captainName: "",
    contactPhone: ""
  });

  // Pre-fill captain name when user is available
  useEffect(() => {
    if (user && !formData.captainName) {
      setFormData(prev => ({ ...prev, captainName: user.displayName || "" }));
    }
  }, [user]);

  const isFull = tournament && tournament.teamsRegistered >= (tournament.maxTeams || 16);
  const status = tournament?.teamsRegistered >= tournament?.maxTeams ? "Fermé" : "Ouvert";

  const handleLoginAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || isFull || isSubmitting) return;

    if (!user) {
      if (!auth) return;
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
        toast({ title: "Connexion réussie", description: "Veuillez cliquer à nouveau sur 'Valider' pour finaliser votre inscription." });
      } catch (e) {
        toast({ variant: "destructive", title: "Erreur de connexion" });
      }
      return;
    }

    if (!formData.contactPhone || formData.contactPhone.length < 8) {
      toast({ variant: "destructive", title: "Téléphone requis", description: "Veuillez entrer un numéro de téléphone valide." });
      return;
    }

    setIsSubmitting(true);
    const registrationData = {
      teamName: formData.teamName,
      captainName: formData.captainName,
      contactPhone: formData.contactPhone,
      tournamentId: id,
      tournamentName: tournament.name,
      userId: user.uid,
      status: "En attente",
      registrationDate: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    addDoc(collection(db, "registrations"), registrationData)
      .then(async () => {
        if (tournamentRef) {
          updateDoc(tournamentRef, { teamsRegistered: increment(1) });
        }
        toast({ title: "Inscription validée !", description: "L'organisation OneCup vous contactera bientôt." });
        router.push("/tournaments");
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/registrations',
          operation: 'create',
          requestResourceData: registrationData
        }));
        setIsSubmitting(false);
      });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `ONECUP 2026 - ${tournament?.name}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Lien copié !" });
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : "";
  };

  if (loadingTournament) return <div className="py-24 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" /></div>;
  if (!tournament) return <div className="py-24 text-center">Tournoi introuvable</div>;

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* 1. Hero */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end">
        <div className="absolute inset-0 z-0">
          <Image 
            src={tournament.imageUrl || "https://picsum.photos/seed/onecup/1920/1080"} 
            alt={tournament.name} 
            fill 
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 pb-12 space-y-6">
          <Link href="/tournaments">
            <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-md border-white/20 text-foreground font-bold uppercase text-[10px]">
              <ArrowLeft className="w-4 h-4" /> Tournois
            </Button>
          </Link>
          
          <div className="space-y-2">
            <Badge className={cn(
              "uppercase font-black px-4 py-1.5 text-xs mb-4",
              status === "Ouvert" ? "bg-green-500" : "bg-destructive"
            )}>
              {status === "Ouvert" ? "Inscriptions Ouvertes" : "Complet"}
            </Badge>
            <h1 className="text-5xl md:text-8xl font-headline font-bold text-foreground uppercase tracking-tighter leading-none">
              {tournament.name}
            </h1>
            <p className="text-xl md:text-2xl font-medium text-muted-foreground uppercase tracking-wider">
              « Le rendez-vous de l'Elite Interscolaire »
            </p>
          </div>

          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Dates</p>
                <p className="font-bold">{tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : "Juillet 2026"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Lieu</p>
                <p className="font-bold">{tournament.locationStade || "OneCup Arena"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Description */}
            <section className="space-y-4">
              <h2 className="text-3xl font-headline font-bold uppercase flex items-center gap-3">
                <Info className="text-primary w-8 h-8" /> Présentation
              </h2>
              <div className="text-muted-foreground text-lg leading-relaxed bg-card p-8 rounded-[2rem] border border-white/5 shadow-sm">
                <div className="whitespace-pre-line">{tournament.description || "Un tournoi d'exception pour révéler les nouveaux talents."}</div>
              </div>
            </section>

            {/* Why Participate */}
            <section className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-10 space-y-6">
              <h3 className="text-2xl font-headline font-bold uppercase text-primary">Pourquoi participer ?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: Trophy, text: "Représenter son école" },
                  { icon: DollarSign, text: "Gagner des récompenses" },
                  { icon: Star, text: "Visibilité Médiatique" },
                  { icon: Users, text: "Networking Interscolaire" },
                  { icon: Zap, text: "After Cup Festival" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-white/5">
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="font-bold uppercase text-xs">{item.text}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Rewards */}
            <section className="space-y-6">
              <h2 className="text-3xl font-headline font-bold uppercase flex items-center gap-3">
                <Medal className="text-primary w-8 h-8" /> Récompenses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl text-center space-y-3">
                  <Trophy className="w-10 h-10 text-yellow-500 mx-auto" />
                  <h4 className="font-bold uppercase text-yellow-500">🥇 Or</h4>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Trophée + Médailles + Prime</p>
                </div>
                <div className="p-6 bg-slate-400/10 border border-slate-400/20 rounded-3xl text-center space-y-3">
                  <Medal className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="font-bold uppercase text-slate-400">🥈 Argent</h4>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Médailles + Recognition</p>
                </div>
                <div className="p-6 bg-orange-700/10 border border-orange-700/20 rounded-3xl text-center space-y-3">
                  <Medal className="w-10 h-10 text-orange-700 mx-auto" />
                  <h4 className="font-bold uppercase text-orange-700">🥉 Bronze</h4>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Médailles</p>
                </div>
              </div>
            </section>

            {/* Teaser */}
            {tournament.teaserVideoUrl && (
              <section className="space-y-6">
                 <h2 className="text-3xl font-headline font-bold uppercase">Teaser Officiel</h2>
                 <div 
                  className="aspect-video bg-muted rounded-[2.5rem] flex items-center justify-center border border-white/10 group cursor-pointer overflow-hidden relative shadow-2xl"
                  onClick={() => setIsVideoOpen(true)}
                 >
                    <Image 
                      src={tournament.imageUrl || "https://picsum.photos/seed/teaser/1200/600"} 
                      fill 
                      alt="Teaser Preview" 
                      className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                    <div className="relative z-20 flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center glow-blue group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white fill-current" />
                      </div>
                      <p className="font-bold uppercase tracking-widest text-white text-sm">Lancer la vidéo</p>
                    </div>
                 </div>
              </section>
            )}

          </div>

          {/* Sticky Registration Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="sticky top-24 rounded-[2.5rem] border-primary/20 shadow-2xl overflow-hidden bg-card/80 backdrop-blur-xl transition-all duration-300">
              <CardHeader className="bg-primary p-8">
                <CardTitle className="text-white uppercase font-bold text-center tracking-tighter text-2xl">REJOINDRE L'ELITE</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {isFull ? (
                  <div className="text-center py-8 space-y-4">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                    <p className="font-bold uppercase text-destructive text-lg">Plus de places</p>
                    <p className="text-xs text-muted-foreground uppercase">Toutes les équipes sont confirmées.</p>
                  </div>
                ) : (
                  <form onSubmit={handleLoginAndSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nom de l'équipe</Label>
                      <Input required placeholder="Ex: AS Elite" className="h-12 rounded-xl bg-background" value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nom du Capitaine</Label>
                      <Input required placeholder="Ex: Jean Mukamba" className="h-12 rounded-xl bg-background" value={formData.captainName} onChange={e => setFormData({...formData, captainName: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Numéro WhatsApp</Label>
                      <Input required type="tel" placeholder="+243 ..." className="h-12 rounded-xl bg-background" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="w-full h-16 uppercase font-black text-lg bg-primary glow-blue rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                    >
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : user ? "Valider l'inscription" : "Connexion & Inscription"}
                    </Button>
                    
                    {!user && (
                      <p className="text-[9px] text-center text-muted-foreground uppercase font-bold tracking-tight">
                        Connexion Google requise pour sécuriser votre accès
                      </p>
                    )}
                  </form>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                   <Button variant="outline" className="h-10 rounded-xl uppercase font-bold text-[9px]" asChild>
                     <Link href="/rules">Règlement</Link>
                   </Button>
                   <Button variant="outline" onClick={handleShare} className="h-10 rounded-xl uppercase font-bold text-[9px]">
                     Partager
                   </Button>
                </div>
              </CardContent>
            </Card>

            {/* Practical Info */}
            <Card className="rounded-[2.5rem] border-white/5 bg-muted/20">
              <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold tracking-widest">A savoir</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: ShieldCheck, text: "Sécurité Renforcée" },
                  { icon: Utensils, text: "Restauration Elite" },
                  { icon: Car, text: "Parking Surveillé" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-none ring-0">
          <div className="aspect-video w-full">
            {tournament.teaserVideoUrl && (
              <iframe
                src={getYoutubeEmbedUrl(tournament.teaserVideoUrl) + "?autoplay=1"}
                title="Tournament Teaser"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

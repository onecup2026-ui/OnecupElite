
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
import { Checkbox } from "@/components/ui/checkbox";
import { useDoc, useFirestore, useUser, useAuth } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "",
    captainName: "",
    contactPhone: ""
  });

  useEffect(() => {
    if (user && !formData.captainName) {
      setFormData(prev => ({ ...prev, captainName: user.displayName || "" }));
    }
  }, [user]);

  const isFull = tournament && tournament.teamsRegistered >= (tournament.maxTeams || 16);
  const status = isFull ? "Complet" : "Ouvert";

  const handleLoginAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || isFull || isSubmitting) return;

    if (!user) {
      if (!auth) return;
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
        toast({ title: "Connexion réussie", description: "Veuillez finaliser votre inscription." });
      } catch (e) {
        toast({ variant: "destructive", title: "Erreur de connexion" });
      }
      return;
    }

    if (!formData.teamName.trim() || !formData.contactPhone || !agreedToRules) {
      toast({ variant: "destructive", title: "Formulaire incomplet", description: "Veuillez remplir tous les champs obligatoires." });
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
        toast({ title: "INSCRIPTION RÉUSSIE !", description: "Nous vous contacterons très bientôt sur WhatsApp." });
        router.push("/tournaments");
      })
      .catch((err) => {
        console.error(err);
        setIsSubmitting(false);
      });
  };

  const handleShare = () => {
    const shareData = {
      title: `ONECUP 2026 - ${tournament?.name}`,
      text: `Rejoignez-moi pour le tournoi ${tournament?.name} ! Inscriptions ouvertes sur la plateforme officielle OneCup.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch((err) => console.log('Erreur de partage:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Lien copié !", description: "Le lien du tournoi a été copié dans votre presse-papiers." });
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : "";
  };

  if (loadingTournament) return <div className="py-24 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" /></div>;
  if (!tournament) return <div className="py-24 text-center">Tournoi introuvable ou supprimé.</div>;

  return (
    <div className="bg-background min-h-screen pb-20">
      <section className="relative h-[60vh] min-h-[500px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={tournament.imageUrl || "https://picsum.photos/seed/onecup/1920/1080"} 
            alt={tournament.name} 
            fill 
            className="object-cover opacity-70 scale-105 group-hover:scale-100 transition-transform duration-[2s]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 pb-16 space-y-8">
          <Link href="/tournaments">
            <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-xl border-white/20 text-foreground font-bold uppercase text-[10px] rounded-full px-6 h-10 hover:bg-white/20 transition-all">
              <ArrowLeft className="w-4 h-4" /> Voir tous les tournois
            </Button>
          </Link>
          
          <div className="space-y-4 text-center md:text-left">
            <Badge className={cn(
              "uppercase font-black px-6 py-2 text-xs rounded-full shadow-lg",
              status === "Ouvert" ? "bg-green-500 animate-pulse" : "bg-destructive"
            )}>
              {status === "Ouvert" ? "Inscriptions Ouvertes" : "Tournoi Complet"}
            </Badge>
            <h1 className="text-5xl md:text-8xl font-headline font-bold text-foreground uppercase tracking-tighter leading-[0.9] drop-shadow-2xl">
              {tournament.name}
            </h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                   <Info className="w-6 h-6" />
                </div>
                <h2 className="text-4xl font-headline font-bold uppercase tracking-tighter">L'ÉVÉNEMENT EN DÉTAILS</h2>
              </div>
              <div className="text-muted-foreground text-xl leading-relaxed bg-card/50 p-10 rounded-[3rem] border border-white/5 shadow-inner">
                <div className="whitespace-pre-line font-medium">{tournament.description || "Un tournoi d'exception pour révéler les nouveaux talents de la RDC. Préparez-vous à entrer dans la légende OneCup."}</div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="rounded-[2.5rem] border-white/5 bg-primary/5 p-8 space-y-6 overflow-hidden relative group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
                 <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Prestige & Récompenses</h4>
                 <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500"><Trophy className="w-6 h-6" /></div>
                      <div><p className="font-black uppercase text-sm">🥇 Champion OneCup</p><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trophée Élite + Médailles + Prime</p></div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-slate-300/20 flex items-center justify-center text-slate-400"><Medal className="w-6 h-6" /></div>
                      <div><p className="font-black uppercase text-sm">🥈 Vice-Champion</p><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Médailles d'argent + Prime</p></div>
                    </div>
                 </div>
               </Card>
               
               <Card className="rounded-[2.5rem] border-white/5 p-8 space-y-6 bg-card/50 shadow-xl">
                 <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Localisation & Timing</h4>
                 <div className="space-y-6">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><MapPin className="w-6 h-6" /></div>
                      <div className="space-y-1">
                        <span className="text-sm font-black uppercase block tracking-tighter">{tournament.locationStade || "OneCup Arena"}</span>
                        <span className="text-[10px] text-muted-foreground uppercase block font-bold tracking-widest leading-relaxed">
                          {tournament.locationCommune} {tournament.locationCommune && "•"} {tournament.locationAdresse || "Kinshasa, RDC"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Calendar className="w-6 h-6" /></div>
                      <span className="text-sm font-black uppercase tracking-tighter">
                        {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "JUILLET 2026"}
                      </span>
                    </div>
                 </div>
               </Card>
            </div>

            {tournament.teaserVideoUrl && (
              <section className="space-y-8">
                 <h2 className="text-4xl font-headline font-bold uppercase tracking-tighter">TEASER OFFICIEL</h2>
                 <div 
                  className="aspect-video bg-muted rounded-[3rem] flex items-center justify-center border border-white/10 group cursor-pointer overflow-hidden relative shadow-2xl"
                  onClick={() => setIsVideoOpen(true)}
                 >
                    <Image 
                      src={tournament.imageUrl || "https://picsum.photos/seed/teaser/1200/600"} 
                      fill 
                      alt="Teaser Preview" 
                      className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-[1.5s]" 
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors z-10" />
                    <div className="relative z-20 flex flex-col items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center glow-blue scale-100 group-hover:scale-110 transition-transform shadow-2xl">
                        <Play className="w-10 h-10 text-white fill-current" />
                      </div>
                      <p className="font-black uppercase tracking-[0.3em] text-white text-xs animate-pulse">Lancer le Teaser Vidéo</p>
                    </div>
                 </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <Card className="rounded-[3rem] border-primary/20 shadow-2xl overflow-hidden bg-card/80 backdrop-blur-3xl border-2">
                <CardHeader className="bg-primary p-8 text-center">
                  <h3 className="text-white uppercase font-black tracking-tighter text-2xl">REJOINDRE L'ÉLITE</h3>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  {isFull ? (
                    <div className="text-center py-10 space-y-6">
                      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
                        <AlertCircle className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-black uppercase text-destructive text-xl tracking-tighter">Tournoi complet</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Les 16 places ont été réservées. Restez connectés pour le tirage au sort.</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleLoginAndSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black text-primary tracking-widest">Nom de l'équipe (ou école)</Label>
                        <Input required placeholder="Ex: AS Elite Kinshasa" className="h-14 rounded-2xl bg-background/50 border-primary/20 font-bold" value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black text-primary tracking-widest">Capitaine responsable</Label>
                        <Input required placeholder="Votre nom complet" className="h-14 rounded-2xl bg-background/50" value={formData.captainName} onChange={e => setFormData({...formData, captainName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black text-primary tracking-widest">Numéro WhatsApp (Contact)</Label>
                        <Input required type="tel" placeholder="+243 ..." className="h-14 rounded-2xl bg-background/50" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                      </div>

                      <div className="flex items-start space-x-3 bg-muted/30 p-4 rounded-2xl border border-white/5">
                        <Checkbox 
                          id="rules" 
                          checked={agreedToRules} 
                          onCheckedChange={(checked) => setAgreedToRules(!!checked)} 
                          className="mt-1 border-primary"
                        />
                        <label htmlFor="rules" className="text-[9px] font-bold leading-tight uppercase text-muted-foreground cursor-pointer">
                          Je certifie avoir pris connaissance du règlement officiel et m'engage à respecter les valeurs de fair-play de la OneCup.
                        </label>
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full h-20 uppercase font-black text-xl bg-primary glow-blue rounded-[2rem] transition-all hover:scale-[1.03] active:scale-95 shadow-xl"
                      >
                        {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : user ? "Valider mon inscription" : "Se connecter pour s'inscrire"}
                      </Button>
                      
                      {!user && (
                        <p className="text-[10px] text-center text-muted-foreground uppercase font-black tracking-widest opacity-60">
                          Connexion sécurisée via Google
                        </p>
                      )}
                    </form>
                  )}
                  
                  <div className="pt-6 border-t border-white/10 flex gap-3">
                     <Button variant="outline" className="flex-1 h-12 rounded-2xl uppercase font-black text-[10px] tracking-widest border-white/10" asChild>
                       <Link href="/rules">Voir Règlement</Link>
                     </Button>
                     <Button variant="outline" onClick={handleShare} className="flex-1 h-12 rounded-2xl uppercase font-black text-[10px] tracking-widest border-white/10 gap-2 hover:bg-primary/10 hover:text-primary transition-all">
                       <Share2 className="w-4 h-4" /> Partager
                     </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-card/30 p-8 rounded-[3rem] border border-white/5 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><ShieldCheck className="w-5 h-5" /></div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Plateforme 100% Sécurisée</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Clock className="w-5 h-5" /></div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Confirmation sous 24 heures</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden bg-black border-none ring-0 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <div className="aspect-video w-full">
            {tournament.teaserVideoUrl && (
              <iframe
                src={getYoutubeEmbedUrl(tournament.teaserVideoUrl) + "?autoplay=1&modestbranding=1&rel=0"}
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

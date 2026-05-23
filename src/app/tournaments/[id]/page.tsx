
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
  const status = tournament?.teamsRegistered >= tournament?.maxTeams ? "Fermé" : "Ouvert";

  const handleLoginAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || isFull || isSubmitting) return;

    if (!user) {
      if (!auth) return;
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
        toast({ title: "Connexion réussie", description: "Veuillez finaliser votre inscription maintenant." });
      } catch (e) {
        toast({ variant: "destructive", title: "Erreur de connexion" });
      }
      return;
    }

    if (!formData.teamName.trim()) {
      toast({ variant: "destructive", title: "Nom d'équipe requis", description: "Veuillez donner un nom à votre équipe." });
      return;
    }

    if (!formData.contactPhone || formData.contactPhone.length < 8) {
      toast({ variant: "destructive", title: "Téléphone requis", description: "Un numéro WhatsApp est nécessaire pour vous contacter." });
      return;
    }

    if (!agreedToRules) {
      toast({ variant: "destructive", title: "Règlement", description: "Vous devez accepter le règlement pour participer." });
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
        toast({ title: "C'EST PARTI !", description: "Votre équipe est inscrite. Nous vous contacterons sur WhatsApp." });
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
    const shareData = {
      title: `ONECUP 2026 - ${tournament?.name}`,
      text: `Rejoignez-moi pour le tournoi ${tournament?.name} ! Inscriptions ouvertes sur la plateforme officielle OneCup.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      navigator.share(shareData).catch((err) => console.log('Erreur de partage:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Lien copié !", description: "Vous pouvez maintenant le partager manuellement." });
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
      <section className="relative h-[50vh] min-h-[400px] flex items-end">
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
        
        <div className="container mx-auto px-4 relative z-10 pb-12 space-y-6 text-center md:text-left">
          <Link href="/tournaments">
            <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-md border-white/20 text-foreground font-bold uppercase text-[10px]">
              <ArrowLeft className="w-4 h-4" /> Retour aux tournois
            </Button>
          </Link>
          
          <div className="space-y-2">
            <Badge className={cn(
              "uppercase font-black px-4 py-1.5 text-xs mb-4",
              status === "Ouvert" ? "bg-green-500" : "bg-destructive"
            )}>
              {status === "Ouvert" ? "Inscriptions Ouvertes" : "Complet"}
            </Badge>
            <h1 className="text-4xl md:text-7xl font-headline font-bold text-foreground uppercase tracking-tighter leading-none">
              {tournament.name}
            </h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <section className="space-y-4">
              <h2 className="text-3xl font-headline font-bold uppercase flex items-center gap-3">
                <Info className="text-primary w-8 h-8" /> À propos du tournoi
              </h2>
              <div className="text-muted-foreground text-lg leading-relaxed bg-card p-8 rounded-[2rem] border border-white/5 shadow-sm">
                <div className="whitespace-pre-line">{tournament.description || "Un tournoi d'exception pour révéler les nouveaux talents."}</div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="rounded-3xl border-white/5 bg-primary/5">
                 <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Récompenses</CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                      <div><p className="font-bold uppercase text-xs">🥇 1ère Place</p><p className="text-[10px] text-muted-foreground">Trophée + Médailles + Prime Élite</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Medal className="w-8 h-8 text-slate-400" />
                      <div><p className="font-bold uppercase text-xs">🥈 2ème Place</p><p className="text-[10px] text-muted-foreground">Médailles d'argent</p></div>
                    </div>
                 </CardContent>
               </Card>
               
               <Card className="rounded-3xl border-white/5">
                 <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest">Informations & Lieu</CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase block">{tournament.locationStade || "OneCup Arena"}</span>
                        <span className="text-[10px] text-muted-foreground uppercase block">{tournament.locationCommune} {tournament.locationCommune && "•"} {tournament.locationAdresse}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-xs font-bold uppercase">{tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "Juillet 2026"}</span>
                    </div>
                 </CardContent>
               </Card>
            </div>

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
                      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center glow-blue">
                        <Play className="w-8 h-8 text-white fill-current" />
                      </div>
                      <p className="font-bold uppercase tracking-widest text-white text-sm">Lancer le Teaser</p>
                    </div>
                 </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="sticky top-24 rounded-[2.5rem] border-primary/20 shadow-2xl overflow-hidden bg-card/80 backdrop-blur-xl">
              <CardHeader className="bg-primary p-6">
                <CardTitle className="text-white uppercase font-bold text-center tracking-tighter text-xl">REJOINDRE LA COMPÉTITION</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {isFull ? (
                  <div className="text-center py-8 space-y-4">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                    <p className="font-bold uppercase text-destructive text-lg">Plus de places disponibles</p>
                    <p className="text-xs text-muted-foreground uppercase">Toutes les équipes sont confirmées pour ce tournoi.</p>
                  </div>
                ) : (
                  <form onSubmit={handleLoginAndSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">NOM DE VOTRE ÉQUIPE (OU ÉCOLE)</Label>
                      <Input required placeholder="Ex: AS Elite Kinshasa" className="h-12 rounded-xl bg-background border-primary/20" value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">NOM DU CAPITAINE</Label>
                      <Input required placeholder="Votre nom complet" className="h-12 rounded-xl bg-background" value={formData.captainName} onChange={e => setFormData({...formData, captainName: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">NUMÉRO WHATSAPP</Label>
                      <Input required type="tel" placeholder="+243 ..." className="h-12 rounded-xl bg-background" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                    </div>

                    <div className="flex items-start space-x-3 pt-2">
                      <Checkbox 
                        id="rules" 
                        checked={agreedToRules} 
                        onCheckedChange={(checked) => setAgreedToRules(!!checked)} 
                        className="mt-1 border-primary"
                      />
                      <label htmlFor="rules" className="text-[10px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 uppercase text-muted-foreground cursor-pointer">
                        J'ai lu le règlement et je m'engage à respecter les valeurs de fair-play de la OneCup.
                      </label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="w-full h-16 uppercase font-black text-lg bg-primary glow-blue rounded-2xl transition-all hover:scale-[1.02]"
                    >
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : user ? "S'INSCRIRE MAINTENANT" : "SE CONNECTER ET S'INSCRIRE"}
                    </Button>
                    
                    {!user && (
                      <p className="text-[9px] text-center text-muted-foreground uppercase font-bold tracking-tight">
                        Connexion Google requise pour sécuriser votre inscription
                      </p>
                    )}
                  </form>
                )}
                
                <div className="pt-4 border-t border-white/5 flex gap-2">
                   <Button variant="outline" className="flex-1 h-10 rounded-xl uppercase font-bold text-[9px]" asChild>
                     <Link href="/rules">Règlement</Link>
                   </Button>
                   <Button variant="outline" onClick={handleShare} className="flex-1 h-10 rounded-xl uppercase font-bold text-[9px] gap-2">
                     <Share2 className="w-3 h-3" /> Partager
                   </Button>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/20 p-6 rounded-[2rem] border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <p className="text-[10px] font-bold uppercase">Sécurité et Fair-play garantis</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <p className="text-[10px] font-bold uppercase">Validation rapide sous 24h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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

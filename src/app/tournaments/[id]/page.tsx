"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Trophy, Calendar, MapPin, ArrowLeft, Loader2, 
  AlertCircle, Share2, Play, MapPinned
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
        toast({ title: "INSCRIPTION RÉUSSIE !", description: "Nous vous contacterons bientôt." });
        router.push("/tournaments");
      })
      .catch((err) => {
        console.error(err);
        setIsSubmitting(false);
      });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tournament?.name,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : "";
  };

  if (loadingTournament) return <div className="py-24 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" /></div>;
  if (!tournament) return <div className="py-24 text-center">Tournoi introuvable.</div>;

  return (
    <div className="bg-background min-h-screen">
      <section className="relative h-[40vh] min-h-[300px] flex items-end">
        <div className="absolute inset-0 z-0">
          <Image 
            src={tournament.imageUrl || "https://picsum.photos/seed/onecup/1920/1080"} 
            alt={tournament.name} 
            fill 
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 pb-12">
          <div className="space-y-4">
            <Link href="/tournaments">
              <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/10 rounded-full font-bold uppercase text-[9px] tracking-widest border border-white/20 h-8">
                <ArrowLeft className="w-3 h-3" /> Retour
              </Button>
            </Link>
            <div className="space-y-2">
              <Badge className={cn("uppercase font-black px-3 py-0.5 text-[9px] rounded-full", status === "Ouvert" ? "bg-green-500" : "bg-destructive")}>
                {status === "Ouvert" ? "Inscriptions Ouvertes" : "Complet"}
              </Badge>
              <h1 className="text-3xl md:text-7xl font-headline font-black text-white uppercase tracking-tighter leading-[0.85]">
                {tournament.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-7 space-y-10 md:space-y-16">
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-1 bg-primary w-10 rounded-full" />
                <h2 className="text-xl md:text-3xl font-headline font-black uppercase tracking-tight">Présentation</h2>
              </div>
              <p className="text-muted-foreground text-sm md:text-xl leading-relaxed font-medium">
                {tournament.description || "Un tournoi d'exception pour révéler les nouveaux talents."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
              <Card className="border-none bg-muted/20 p-6 md:p-10 rounded-[2rem] space-y-6 shadow-sm">
                <div className="flex items-center gap-3 text-primary">
                  <Trophy className="w-5 h-5 md:w-8 md:h-8" />
                  <h3 className="font-black uppercase tracking-tight text-sm md:text-xl">Récompenses</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black bg-primary text-white w-6 h-6 flex items-center justify-center rounded-lg">1</span>
                    <p className="text-xs md:text-sm font-bold uppercase">Champion : Trophée + Prime</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black bg-muted w-6 h-6 flex items-center justify-center rounded-lg">2</span>
                    <p className="text-xs md:text-sm font-bold uppercase">Finaliste : Médaille + Prime</p>
                  </div>
                </div>
              </Card>

              <Card className="border-none bg-muted/20 p-6 md:p-10 rounded-[2rem] space-y-6 shadow-sm">
                <div className="flex items-center gap-3 text-primary">
                  <MapPinned className="w-5 h-5 md:w-8 md:h-8" />
                  <h3 className="font-black uppercase tracking-tight text-sm md:text-xl">Informations</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs md:text-sm font-bold uppercase">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{tournament.locationStade}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs md:text-sm font-bold uppercase">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : "À venir"}</span>
                  </div>
                </div>
              </Card>
            </div>

            {tournament.teaserVideoUrl && (
              <div className="space-y-6">
                 <h2 className="text-xl md:text-3xl font-headline font-black uppercase tracking-tight">Médias</h2>
                 <div 
                  className="aspect-video bg-muted rounded-[2rem] flex items-center justify-center border group cursor-pointer overflow-hidden relative shadow-lg"
                  onClick={() => setIsVideoOpen(true)}
                 >
                    <Image src={tournament.imageUrl || "https://picsum.photos/seed/teaser/1200/600"} fill alt="Teaser" className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white">Voir le teaser</span>
                    </div>
                 </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <Card className="sticky top-24 border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <div className="bg-primary p-6 md:p-8 text-center">
                <h3 className="text-white uppercase font-black tracking-tight text-xl md:text-2xl">Rejoindre l'élite</h3>
                <p className="text-white/70 text-[10px] uppercase font-bold tracking-widest mt-1">Inscription Équipe</p>
              </div>
              <CardContent className="p-8 md:p-10 space-y-8">
                {isFull ? (
                  <div className="text-center py-10 space-y-4">
                    <AlertCircle className="w-16 h-16 text-destructive mx-auto opacity-50" />
                    <p className="font-black uppercase text-destructive tracking-widest">Le tournoi est complet</p>
                  </div>
                ) : (
                  <form onSubmit={handleLoginAndSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[9px] uppercase font-black text-muted-foreground tracking-widest ml-1">Nom de l'équipe</Label>
                      <Input required placeholder="Ex: AS KINSHASA" className="h-12 md:h-14 rounded-2xl bg-muted/50 border-none text-sm font-bold uppercase" value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] uppercase font-black text-muted-foreground tracking-widest ml-1">Capitaine de l'équipe</Label>
                      <Input required placeholder="Votre nom complet" className="h-12 md:h-14 rounded-2xl bg-muted/50 border-none text-sm font-bold uppercase" value={formData.captainName} onChange={e => setFormData({...formData, captainName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] uppercase font-black text-muted-foreground tracking-widest ml-1">Numéro WhatsApp</Label>
                      <Input required type="tel" placeholder="+243 ..." className="h-12 md:h-14 rounded-2xl bg-muted/50 border-none text-sm font-bold" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                    </div>
                    <div className="flex items-start space-x-3 p-4 rounded-2xl border bg-muted/10">
                      <Checkbox id="rules" checked={agreedToRules} onCheckedChange={(checked) => setAgreedToRules(!!checked)} className="mt-0.5 rounded-md" />
                      <label htmlFor="rules" className="text-[9px] font-bold leading-tight uppercase text-muted-foreground cursor-pointer select-none">
                        J'accepte le règlement officiel du tournoi et la charte de fair-play.
                      </label>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full h-14 md:h-16 uppercase font-black text-sm md:text-lg bg-primary rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : user ? "Finaliser l'inscription" : "Connexion & Inscription"}
                    </Button>
                  </form>
                )}
                <Button variant="ghost" onClick={handleShare} className="w-full h-12 rounded-2xl uppercase font-black text-[10px] tracking-[0.2em] gap-2 hover:bg-muted text-muted-foreground transition-colors">
                  <Share2 className="w-4 h-4" /> Partager l'événement
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none rounded-[2rem]">
          <DialogHeader className="sr-only">
            <DialogTitle>Teaser Officiel</DialogTitle>
            <DialogDescription>Vidéo de présentation du tournoi.</DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full">
            {tournament.teaserVideoUrl && (
              <iframe src={getYoutubeEmbedUrl(tournament.teaserVideoUrl) + "?autoplay=1&modestbranding=1"} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


"use client";

import { useMemo, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const isFull = tournament && tournament.teamsRegistered >= (tournament.maxTeams || 16);
  const status = tournament?.teamsRegistered >= tournament?.maxTeams ? "Fermé" : "Ouvert";

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Connecté !" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur de connexion" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !tournament || isFull) return;

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
          await updateDoc(tournamentRef, { teamsRegistered: increment(1) });
        }
        toast({ title: "Inscription réussie !" });
        router.push("/tournaments");
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/registrations',
          operation: 'create',
          requestResourceData: registrationData
        }));
      })
      .finally(() => setIsSubmitting(false));
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
      {/* 1. Informations principales (Hero) */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end">
        <div className="absolute inset-0 z-0">
          <Image 
            src={tournament.imageUrl || "https://picsum.photos/seed/onecup/1920/1080"} 
            alt={tournament.name} 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 pb-12 space-y-6">
          <Link href="/tournaments">
            <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-md border-white/20 text-foreground font-bold uppercase text-[10px]">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
          </Link>
          
          <div className="space-y-2">
            <Badge className={cn(
              "uppercase font-black px-4 py-1.5 text-xs mb-4",
              status === "Ouvert" ? "bg-green-500" : "bg-destructive"
            )}>
              {status === "Ouvert" ? "Inscriptions Ouvertes" : "Inscriptions Fermées"}
            </Badge>
            <h1 className="text-5xl md:text-8xl font-headline font-bold text-foreground uppercase tracking-tighter leading-none">
              {tournament.name}
            </h1>
            <p className="text-xl md:text-2xl font-medium text-muted-foreground uppercase tracking-wider">
              « Le tournoi des vacances qui rassemble les écoles »
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
          
          {/* Colonne Gauche (Contenu) */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* 2. Description */}
            <section className="space-y-4">
              <h2 className="text-3xl font-headline font-bold uppercase flex items-center gap-3">
                <Info className="text-primary w-8 h-8" /> Présentation
              </h2>
              <div className="text-muted-foreground text-lg leading-relaxed bg-card p-8 rounded-[2rem] border border-white/5 shadow-sm">
                <p className="italic mb-4 text-foreground font-medium">"ONE CUP est un tournoi interscolaire organisé pendant les vacances, réunissant différentes écoles autour du football, de la compétition et du divertissement."</p>
                <div className="whitespace-pre-line">{tournament.description}</div>
              </div>
            </section>

            {/* Why Participate Special Block */}
            <section className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-10 space-y-6">
              <h3 className="text-2xl font-headline font-bold uppercase text-primary">Pourquoi participer ?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: Trophy, text: "Représenter son école" },
                  { icon: DollarSign, text: "Gagner des récompenses" },
                  { icon: Star, text: "Être visible" },
                  { icon: Users, text: "Rencontrer d'autres écoles" },
                  { icon: Zap, text: "Vivre l'ambiance de l'After Cup" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-white/5">
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="font-bold uppercase text-xs">{item.text}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Détails & 4. Conditions */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="rounded-[2rem] border-white/5 overflow-hidden">
                <CardHeader className="bg-muted/30"><CardTitle className="text-sm uppercase font-bold tracking-widest">Détails</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-muted-foreground uppercase">Type</span>
                    <span className="text-xs font-bold uppercase">{tournament.gameType || "Football"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-muted-foreground uppercase">Catégorie</span>
                    <span className="text-xs font-bold uppercase">Interscolaire</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-muted-foreground uppercase">Adresse</span>
                    <span className="text-[10px] font-bold uppercase text-right">{tournament.locationAdresse || "OneCup Arena"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground uppercase">Format</span>
                    <span className="text-xs font-bold uppercase">Élimination directe</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-white/5 overflow-hidden">
                <CardHeader className="bg-primary/5"><CardTitle className="text-sm uppercase font-bold tracking-widest text-primary">Inscriptions</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-muted-foreground uppercase">Frais</span>
                    <span className="text-xs font-bold text-primary">{(tournament.entryFee || 0).toLocaleString()} FC</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-muted-foreground uppercase">Places Max</span>
                    <span className="text-xs font-bold uppercase">{tournament.maxTeams} Équipes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground uppercase">Places Restantes</span>
                    <span className="text-xs font-bold text-green-500">{(tournament.maxTeams - tournament.teamsRegistered) || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 5. Récompenses */}
            <section className="space-y-6">
              <h2 className="text-3xl font-headline font-bold uppercase flex items-center gap-3">
                <Medal className="text-primary w-8 h-8" /> Récompenses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl text-center space-y-3">
                  <Trophy className="w-10 h-10 text-yellow-500 mx-auto" />
                  <h4 className="font-bold uppercase text-yellow-500">🥇 Champion</h4>
                  <ul className="text-[10px] text-muted-foreground uppercase font-bold space-y-1">
                    <li>Trophée</li>
                    <li>Médailles d'or</li>
                    <li>Récompense</li>
                  </ul>
                </div>
                <div className="p-6 bg-slate-400/10 border border-slate-400/20 rounded-3xl text-center space-y-3">
                  <Medal className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="font-bold uppercase text-slate-400">🥈 Vice-champion</h4>
                  <ul className="text-[10px] text-muted-foreground uppercase font-bold space-y-1">
                    <li>Médailles d'argent</li>
                  </ul>
                </div>
                <div className="p-6 bg-orange-700/10 border border-orange-700/20 rounded-3xl text-center space-y-3">
                  <Medal className="w-10 h-10 text-orange-700 mx-auto" />
                  <h4 className="font-bold uppercase text-orange-700">🥉 3ème Place</h4>
                  <ul className="text-[10px] text-muted-foreground uppercase font-bold space-y-1">
                    <li>Récompense</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 7. Équipes participantes */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-headline font-bold uppercase">Équipes Inscrites</h2>
                <Badge variant="outline" className="font-bold">{registrations?.length || 0} / {tournament.maxTeams}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {registrations?.map((reg: any, i) => (
                  <div key={i} className="bg-card p-6 rounded-3xl border border-white/5 text-center group hover:border-primary transition-all">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-bold uppercase text-xs truncate">{reg.teamName}</p>
                    <Badge variant="secondary" className="text-[8px] mt-2 uppercase">{reg.status}</Badge>
                  </div>
                ))}
                {registrations?.length === 0 && (
                  <p className="col-span-full text-center py-12 text-muted-foreground italic">En attente des premières inscriptions.</p>
                )}
              </div>
            </section>

            {/* 8. Galerie média (Fallback) */}
            <section className="space-y-6">
               <h2 className="text-3xl font-headline font-bold uppercase">Teaser & Galerie</h2>
               <div 
                className="aspect-video bg-muted rounded-[2.5rem] flex items-center justify-center border border-white/10 group cursor-pointer overflow-hidden relative"
                onClick={() => tournament.teaserVideoUrl && setIsVideoOpen(true)}
               >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                  <Image src="https://picsum.photos/seed/teaser/1200/600" fill alt="Teaser" className="object-cover" />
                  <div className="relative z-20 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center glow-blue group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                    <p className="font-bold uppercase tracking-widest text-white text-sm">Visionner le Teaser Officiel</p>
                  </div>
               </div>
            </section>

          </div>

          {/* Colonne Droite (Sticky Side) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* 12. Bouton d'action (Inscriptions) */}
            <Card className="sticky top-24 rounded-[2.5rem] border-primary/20 shadow-2xl overflow-hidden bg-card/80 backdrop-blur-xl">
              <CardHeader className="bg-primary p-8">
                <CardTitle className="text-white uppercase font-bold text-center tracking-tighter text-2xl">S'INSCRIRE MAINTENANT</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {isFull ? (
                  <div className="text-center py-8 space-y-4">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                    <p className="font-bold uppercase text-destructive text-lg">Tournoi Complet</p>
                  </div>
                ) : !user ? (
                  <div className="space-y-6">
                    <p className="text-sm text-center text-muted-foreground leading-relaxed">Connectez-vous pour accéder au formulaire officiel.</p>
                    <Button onClick={handleLogin} className="w-full h-16 uppercase font-bold text-lg bg-primary glow-blue rounded-2xl gap-3">
                      <LogIn className="w-6 h-6" /> Se connecter
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nom de l'école / équipe</Label>
                      <Input required placeholder="Ex: Collège Elite" className="h-12 rounded-xl" value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Responsable</Label>
                      <Input required placeholder="Ex: M. Jean" className="h-12 rounded-xl" value={formData.captainName} onChange={e => setFormData({...formData, captainName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Contact WhatsApp</Label>
                      <Input required type="tel" placeholder="+243 ..." className="h-12 rounded-xl" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full h-16 uppercase font-black text-lg bg-primary glow-blue rounded-2xl transition-all hover:scale-105">
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Valider l'inscription"}
                    </Button>
                  </form>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                   <Button variant="outline" className="h-12 rounded-xl uppercase font-bold text-[10px]" asChild>
                     <Link href="/rules">Règlement</Link>
                   </Button>
                   <Button variant="outline" onClick={handleShare} className="h-12 rounded-xl uppercase font-bold text-[10px]">
                     Partager
                   </Button>
                </div>
              </CardContent>
            </Card>

            {/* 9. Informations pratiques */}
            <Card className="rounded-[2.5rem] border-white/5 bg-muted/20">
              <CardHeader><CardTitle className="text-sm uppercase font-bold">Infos Pratiques</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Car className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase">Parking Sécurisé</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase">Sécurité 24/7</span>
                </div>
                <div className="flex items-center gap-3">
                  <Utensils className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase">Restauration sur place</span>
                </div>
              </CardContent>
            </Card>

            {/* 11. Contact */}
            <Card className="rounded-[2.5rem] border-white/5">
              <CardHeader><CardTitle className="text-sm uppercase font-bold">Contact Officiel</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 hover:bg-muted" asChild>
                   <a href="tel:+243000000000"><Phone className="w-5 h-5 text-primary" /> <span className="text-xs font-bold">+243 000 000 000</span></a>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 hover:bg-muted" asChild>
                   <a href="https://wa.me/243000000000"><MessageCircle className="w-5 h-5 text-green-500" /> <span className="text-xs font-bold">WhatsApp ONECUP</span></a>
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Video Dialog */}
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

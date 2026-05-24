"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trophy, Calendar, MapPin, ArrowLeft, Loader2, AlertCircle, Share2, Play, MapPinned } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [formData, setFormData] = useState({ teamName: "", captainName: "", contactPhone: "" });

  useEffect(() => {
    if (user && !formData.captainName) setFormData(prev => ({ ...prev, captainName: user.displayName || "" }));
  }, [user]);

  const isFull = tournament && tournament.teamsRegistered >= (tournament.maxTeams || 16);
  const status = isFull ? "Complet" : "Ouvert";

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || isFull || isSubmitting) return;

    if (!user) {
      if (!auth) return;
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
        toast({ title: "Connecté !", description: "Veuillez finaliser l'inscription." });
      } catch (e) { toast({ variant: "destructive", title: "Erreur de connexion" }); }
      return;
    }

    if (!formData.teamName.trim() || !formData.contactPhone || !agreedToRules) {
      toast({ variant: "destructive", title: "Champs requis", description: "Veuillez accepter le règlement." });
      return;
    }

    setIsSubmitting(true);
    addDoc(collection(db, "registrations"), {
      ...formData, tournamentId: id, tournamentName: tournament.name, userId: user.uid, status: "En attente", registrationDate: serverTimestamp(), createdAt: serverTimestamp()
    }).then(() => {
      if (tournamentRef) updateDoc(tournamentRef, { teamsRegistered: increment(1) });
      toast({ title: "INSCRIPTION RÉUSSIE !", description: "Nous vous contacterons très vite." });
      router.push("/tournaments");
    }).catch(() => setIsSubmitting(false));
  };

  if (loadingTournament) return <div className="py-24 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>;
  if (!tournament) return <div className="py-24 text-center">Tournoi introuvable.</div>;

  return (
    <div className="bg-background min-h-screen pb-20">
      <section className="relative h-[40vh] min-h-[350px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={tournament.imageUrl || "https://picsum.photos/seed/onecup/1920/1080"} alt={tournament.name} fill className="object-cover opacity-50" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10 pb-10">
          <Link href="/tournaments">
            <Button variant="ghost" className="mb-4 text-white hover:bg-white/10 rounded-full font-black uppercase text-[10px] tracking-widest border border-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
          </Link>
          <div className="space-y-3">
            <Badge className={cn("uppercase font-black px-4 py-1 text-[10px] rounded-full", status === "Ouvert" ? "bg-green-500" : "bg-destructive")}>{status}</Badge>
            <h1 className="text-4xl md:text-7xl font-headline font-black text-white uppercase tracking-tighter leading-none">{tournament.name}</h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4"><div className="h-1 bg-primary w-12 rounded-full" /><h2 className="text-2xl font-headline font-black uppercase tracking-tight">Présentation</h2></div>
              <p className="text-muted-foreground text-lg md:text-2xl leading-relaxed font-medium">{tournament.description || "Un tournoi d'exception pour révéler les nouveaux talents de la scène Elite."}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="border-none bg-muted/20 p-8 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-3 text-primary"><Trophy className="w-8 h-8" /><h3 className="font-black uppercase tracking-tight text-lg">Récompenses</h3></div>
                <div className="space-y-3">
                  <p className="text-sm font-bold uppercase flex items-center gap-2"><span className="w-5 h-5 bg-primary text-white rounded flex items-center justify-center text-[10px]">1</span> Champion : Trophée + Prime</p>
                  <p className="text-sm font-bold uppercase flex items-center gap-2"><span className="w-5 h-5 bg-muted rounded flex items-center justify-center text-[10px]">2</span> Finaliste : Prime Élite</p>
                </div>
              </Card>
              <Card className="border-none bg-muted/20 p-8 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-3 text-primary"><MapPinned className="w-8 h-8" /><h3 className="font-black uppercase tracking-tight text-lg">Détails</h3></div>
                <div className="space-y-3">
                  <p className="text-sm font-bold uppercase flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> {tournament.locationStade}</p>
                  <p className="text-sm font-bold uppercase flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : "À venir"}</p>
                </div>
              </Card>
            </div>
          </div>
          <div className="lg:col-span-5">
            <Card className="sticky top-24 border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <div className="bg-primary p-8 text-center"><h3 className="text-white uppercase font-black tracking-tight text-xl">REJOINDRE L'ÉLITE</h3><p className="text-white/70 text-[10px] uppercase font-bold tracking-widest mt-1">Inscription Équipe</p></div>
              <CardContent className="p-8 space-y-6">
                {isFull ? <div className="text-center py-6"><AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2 opacity-30" /><p className="font-black uppercase text-destructive text-sm">Le tournoi est complet</p></div> : (
                  <form onSubmit={handleRegistration} className="space-y-5">
                    <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Équipe</Label><Input required placeholder="Ex: AS KINSHASA" className="h-12 rounded-xl bg-muted/50 border-none font-bold uppercase" value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Capitaine</Label><Input required placeholder="Nom complet" className="h-12 rounded-xl bg-muted/50 border-none font-bold uppercase" value={formData.captainName} onChange={e => setFormData({...formData, captainName: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">WhatsApp</Label><Input required type="tel" placeholder="+243 ..." className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} /></div>
                    <div className="flex items-start space-x-3 p-4 rounded-2xl border bg-muted/5">
                      <Checkbox id="rules" checked={agreedToRules} onCheckedChange={(c) => setAgreedToRules(!!c)} className="rounded" />
                      <label htmlFor="rules" className="text-[9px] font-bold leading-tight uppercase text-muted-foreground cursor-pointer">J'accepte le règlement et la charte de fair-play ONECUP.</label>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full h-14 uppercase font-black text-lg bg-primary rounded-2xl shadow-xl transition-all hover:scale-[1.02]">
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : user ? "Confirmer l'inscription" : "Connexion & Inscription"}
                    </Button>
                  </form>
                )}
                <Button variant="ghost" onClick={() => navigator.share?.({ title: tournament.name, url: window.location.href })} className="w-full h-12 rounded-xl uppercase font-black text-[10px] tracking-widest gap-2 hover:bg-muted text-muted-foreground transition-colors"><Share2 className="w-4 h-4" /> Partager l'événement</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

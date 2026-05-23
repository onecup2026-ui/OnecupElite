
"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trophy, Calendar, MapPin, Users, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDoc, useFirestore, useUser, useAuth } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

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
  const [formData, setFormData] = useState({
    teamName: "",
    captainName: "",
    contactEmail: "",
    contactPhone: ""
  });

  const isFull = tournament && tournament.teamsRegistered >= (tournament.teamsMax || 16);

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Connecté !", description: "Vous pouvez maintenant inscrire votre équipe." });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur de connexion" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !tournament || isFull) return;

    setIsSubmitting(true);
    const registrationData = {
      ...formData,
      tournamentId: id,
      tournamentName: tournament.name,
      userId: user.uid,
      createdAt: serverTimestamp()
    };

    try {
      // 1. Ajouter l'inscription
      await addDoc(collection(db, "registrations"), registrationData);
      
      // 2. Incrémenter le compteur du tournoi
      if (tournamentRef) {
        await updateDoc(tournamentRef, {
          teamsRegistered: increment(1)
        });
      }

      toast({
        title: "Inscription réussie !",
        description: `L'équipe ${formData.teamName} est officiellement inscrite.`,
      });
      router.push("/tournaments");
    } catch (err) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: '/registrations',
        operation: 'create',
        requestResourceData: registrationData
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingTournament) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest">Chargement du tournoi...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Tournoi non trouvé</h1>
        <Link href="/tournaments">
          <Button variant="link">Retourner aux tournois</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <Link href="/tournaments">
        <Button variant="ghost" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Infos Tournoi */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <img src={tournament.imageUrl} alt={tournament.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 space-y-2">
              <Badge className="bg-primary glow-blue uppercase">{tournament.sport}</Badge>
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-white uppercase tracking-tighter">
                {tournament.name}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-white/5 p-4 text-center space-y-1">
              <Calendar className="w-5 h-5 mx-auto text-primary" />
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Date</p>
              <p className="font-bold text-sm">{tournament.date}</p>
            </Card>
            <Card className="bg-card border-white/5 p-4 text-center space-y-1">
              <MapPin className="w-5 h-5 mx-auto text-primary" />
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Lieu</p>
              <p className="font-bold text-sm">{tournament.location}</p>
            </Card>
            <Card className="bg-card border-white/5 p-4 text-center space-y-1">
              <Trophy className="w-5 h-5 mx-auto text-primary" />
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Cashprize</p>
              <p className="font-bold text-sm">{tournament.prize}</p>
            </Card>
            <Card className="bg-card border-white/5 p-4 text-center space-y-1">
              <Users className="w-5 h-5 mx-auto text-primary" />
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Places</p>
              <p className="font-bold text-sm">{tournament.teamsRegistered || 0} / {tournament.teamsMax || 16}</p>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-headline font-bold uppercase tracking-tight">À propos de cet événement</h2>
            <p className="text-muted-foreground leading-relaxed">
              {tournament.description || "Rejoignez l'élite du sport pour une compétition acharnée. Un tournoi organisé par OneCup pour mettre en lumière les meilleurs talents de la région."}
            </p>
          </div>
        </div>

        {/* Formulaire Inscription */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-primary/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-lg uppercase font-headline">Inscription de l'équipe</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isFull ? (
                <div className="text-center space-y-4 py-8">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                  <p className="font-bold uppercase text-destructive">Tournoi Complet</p>
                  <p className="text-xs text-muted-foreground">Toutes les places ont été réservées. Restez connectés pour les prochaines éditions.</p>
                </div>
              ) : !user ? (
                <div className="text-center space-y-4 py-8">
                  <p className="text-sm text-muted-foreground">Vous devez être connecté pour inscrire votre équipe.</p>
                  <Button onClick={handleLogin} className="w-full bg-primary glow-blue uppercase font-bold">
                    Se connecter avec Google
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold">Nom de l'équipe</Label>
                    <Input 
                      required 
                      placeholder="ex: Kinshasa Warriors" 
                      value={formData.teamName}
                      onChange={e => setFormData({...formData, teamName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold">Nom du Capitaine</Label>
                    <Input 
                      required 
                      placeholder="Nom complet" 
                      value={formData.captainName}
                      onChange={e => setFormData({...formData, captainName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold">Email de contact</Label>
                    <Input 
                      required 
                      type="email" 
                      placeholder="capitaine@exemple.com" 
                      value={formData.contactEmail}
                      onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold">Téléphone</Label>
                    <Input 
                      required 
                      placeholder="+243 ..." 
                      value={formData.contactPhone}
                      onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-primary glow-blue h-12 uppercase font-bold mt-4"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer l'inscription"}
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground mt-2">
                    En cliquant, vous acceptez le règlement du tournoi OneCup Elite.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-none p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase text-primary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Pourquoi s'inscrire ?
            </h4>
            <ul className="text-xs space-y-2 text-muted-foreground">
              <li>• Visibilité internationale pour vos joueurs</li>
              <li>• Encadrement professionnel par OneCup</li>
              <li>• Accès aux statistiques live des matchs</li>
              <li>• Chance de remporter une partie de la cagnotte</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

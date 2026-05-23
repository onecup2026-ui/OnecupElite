
"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trophy, Calendar, MapPin, Users, ArrowLeft, Loader2, CheckCircle2, AlertCircle, LogIn, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDoc, useFirestore, useUser, useAuth } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
      toast({ title: "Connecté !" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur de connexion" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !tournament || isFull) return;

    setIsSubmitting(true);
    const registrationData = {
      teamName: formData.teamName,
      captainName: formData.captainName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      tournamentId: id,
      tournamentName: tournament.name,
      userId: user.uid,
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

  if (loadingTournament) return <div className="py-24 text-center">Chargement...</div>;
  if (!tournament) return <div className="py-24 text-center">Tournoi introuvable</div>;

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <Link href="/tournaments">
        <Button variant="ghost" className="gap-2 mb-4 font-bold uppercase text-xs">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <img src={tournament.imageUrl} alt={tournament.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 space-y-2">
              <Badge className="bg-primary uppercase font-bold">{tournament.sport}</Badge>
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-white uppercase tracking-tighter">
                {tournament.name}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Calendar className="w-5 h-5 mx-auto text-primary" />
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Date</p>
              <p className="font-bold text-sm">{tournament.date}</p>
            </Card>
            <Card className="p-4 text-center">
              <Clock className="w-5 h-5 mx-auto text-primary" />
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Clôture</p>
              <p className="font-bold text-sm">{tournament.registrationDeadline || "N/A"}</p>
            </Card>
            <Card className="p-4 text-center">
              <DollarSign className="w-5 h-5 mx-auto text-primary" />
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Frais</p>
              <p className="font-bold text-sm">{tournament.entryFee?.toLocaleString() || 0} FC</p>
            </Card>
            <Card className="p-4 text-center">
              <Trophy className="w-5 h-5 mx-auto text-primary" />
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Cashprize</p>
              <p className="font-bold text-sm">{tournament.prize}</p>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-headline font-bold uppercase">Règlement & Détails</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {tournament.description}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className={cn("sticky top-24 border-primary/20 shadow-xl", isFull && "opacity-80")}>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-lg uppercase">Inscription Équipe</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isFull ? (
                <div className="text-center py-8 space-y-2">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                  <p className="font-bold uppercase text-destructive">Complet</p>
                </div>
              ) : !user ? (
                <Button onClick={handleLogin} className="w-full h-12 uppercase font-bold gap-2">
                  <LogIn className="w-4 h-4" /> Se connecter
                </Button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Nom de l'équipe</Label>
                    <Input required value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Capitaine</Label>
                    <Input required value={formData.captainName} onChange={e => setFormData({...formData, captainName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Email</Label>
                    <Input required type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 uppercase font-bold mt-4">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "S'inscrire"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

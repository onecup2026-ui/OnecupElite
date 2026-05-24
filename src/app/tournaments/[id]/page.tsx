
"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trophy, Calendar, MapPin, ArrowLeft, Loader2, AlertCircle, Share2, ShieldCheck, Star, Users, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useDoc, useFirestore, useUser, useAuth, useCollection } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp, updateDoc, increment, query, where, orderBy } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function TournamentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();

  const tournamentRef = useMemo(() => (db && id ? doc(db, "tournaments", id as string) : null), [db, id]);
  const { data: tournament, loading: loadingTournament } = useDoc(tournamentRef);

  const matchesQuery = useMemo(() => {
    if (!db || !id) return null;
    return query(collection(db, "matches"), where("tournamentId", "==", id), orderBy("matchNumber", "asc"));
  }, [db, id]);
  const { data: matches } = useCollection(matchesQuery);

  const [isSubmitting, setIsSubmitting] = useState(false);
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
      toast({ title: "INSCRIPTION RÉUSSIE !", description: "En attente de validation par l'administrateur." });
      router.push("/tournaments");
    }).catch(() => setIsSubmitting(false));
  };

  if (loadingTournament) return <div className="py-24 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>;
  if (!tournament) return <div className="py-24 text-center">Tournoi introuvable.</div>;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <section className="relative h-[45vh] md:h-[55vh] flex items-end overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <Image src={tournament.imageUrl || "https://picsum.photos/seed/onecup-detail/1920/1080"} alt={tournament.name} fill className="object-cover opacity-60" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10 pb-12 md:pb-20">
          <div className="max-w-5xl space-y-6">
            <Link href="/tournaments">
              <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full font-black uppercase text-[10px] tracking-widest border border-white/20 px-6 h-10">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
              </Button>
            </Link>
            <div className="space-y-4">
              <Badge className={cn("uppercase font-black px-6 py-2 text-[10px] tracking-widest rounded-full", status === "Ouvert" ? "bg-green-500 text-white" : "bg-destructive text-white")}>
                INSCRIPTIONS {status}
              </Badge>
              <h1 className="text-5xl md:text-8xl font-headline font-black text-white uppercase tracking-tighter leading-none">{tournament.name}</h1>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-10 md:-mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-7 space-y-12">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white">
              <CardContent className="p-8 md:p-12 space-y-10">
                <div className="space-y-6">
                  <h2 className="text-3xl font-headline font-black uppercase tracking-tight text-slate-900">Aperçu</h2>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">{tournament.description}</p>
                </div>

                {matches && matches.length > 0 && (
                  <div className="space-y-8 pt-8 border-t">
                    <div className="flex items-center gap-3">
                      <Swords className="w-6 h-6 text-primary" />
                      <h3 className="text-2xl font-headline font-black uppercase">Tableau des Matchs</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {matches.map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border">
                          <div className="flex-1 text-center font-black uppercase text-sm truncate">{m.team1Id}</div>
                          <div className="flex flex-col items-center gap-1 px-8">
                            <div className="text-2xl font-black text-primary">{m.scoreTeam1} : {m.scoreTeam2}</div>
                            <Badge variant="outline" className="text-[8px] uppercase">{m.status}</Badge>
                          </div>
                          <div className="flex-1 text-center font-black uppercase text-sm truncate">{m.team2Id}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card className="sticky top-24 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
              <div className="bg-primary p-10 text-center space-y-2">
                <Trophy className="w-12 h-12 text-white mx-auto mb-2 opacity-80" />
                <h3 className="text-white uppercase font-headline font-black tracking-tight text-2xl">REJOINDRE L'ÉLITE</h3>
              </div>
              <CardContent className="p-8 md:p-12">
                <form onSubmit={handleRegistration} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Nom de l'Équipe</Label>
                    <Input required placeholder="EX: ELITE FC" className="h-14 rounded-xl" value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Capitaine</Label>
                    <Input required placeholder="NOM COMPLET" className="h-14 rounded-xl" value={formData.captainName} onChange={e => setFormData({...formData, captainName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">WhatsApp</Label>
                    <Input required type="tel" placeholder="+243 ..." className="h-14 rounded-xl" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                  </div>
                  <div className="flex items-start space-x-4 p-5 rounded-2xl border bg-slate-50/50">
                    <Checkbox id="rules" checked={agreedToRules} onCheckedChange={(c) => setAgreedToRules(!!c)} />
                    <label htmlFor="rules" className="text-[9px] font-bold uppercase text-slate-500 leading-tight">J'accepte le règlement officiel et la charte d'éthique.</label>
                  </div>
                  <Button type="submit" disabled={isSubmitting || isFull} className="w-full h-16 uppercase font-black bg-primary rounded-2xl shadow-xl">
                    {user ? "Confirmer l'inscription" : "Connexion & Inscription"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

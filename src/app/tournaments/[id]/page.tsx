
"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trophy, Calendar, MapPin, ArrowLeft, Loader2, AlertCircle, Share2, ShieldCheck, Star, Users } from "lucide-react";
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
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      {/* FIFA-style Immersive Header */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-end overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <Image 
            src={tournament.imageUrl || "https://picsum.photos/seed/onecup-detail/1920/1080"} 
            alt={tournament.name} 
            fill 
            className="object-cover opacity-60" 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10 pb-12 md:pb-20">
          <div className="max-w-5xl space-y-6">
            <Link href="/tournaments">
              <Button variant="ghost" className="mb-6 text-white hover:bg-white/10 rounded-full font-black uppercase text-[10px] tracking-widest border border-white/20 px-6 h-10">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux tournois
              </Button>
            </Link>
            <div className="space-y-4">
              <Badge className={cn("uppercase font-black px-6 py-2 text-[10px] tracking-widest rounded-full shadow-lg", status === "Ouvert" ? "bg-green-500 text-white" : "bg-destructive text-white")}>
                INSCRIPTIONS {status}
              </Badge>
              <h1 className="text-5xl md:text-8xl font-headline font-black text-white uppercase tracking-tighter leading-[0.85]">
                {tournament.name}
              </h1>
              <div className="flex flex-wrap gap-8 pt-4">
                <div className="flex items-center gap-3 text-white font-bold uppercase text-xs tracking-widest">
                  <Calendar className="w-5 h-5 text-primary" />
                  {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "À venir"}
                </div>
                <div className="flex items-center gap-3 text-white font-bold uppercase text-xs tracking-widest">
                  <MapPin className="w-5 h-5 text-primary" />
                  {tournament.locationStade}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-10 md:-mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-12">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-8 md:p-12 space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-10 bg-primary rounded-full" />
                    <h2 className="text-3xl font-headline font-black uppercase tracking-tight text-slate-900">Aperçu</h2>
                  </div>
                  <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium">
                    {tournament.description || "Une compétition d'élite conçue pour révéler les futurs talents. Rejoignez l'arène OneCup et marquez l'histoire du sport."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: Trophy, label: "Trophée", val: "Elite Cup" },
                    { icon: Users, label: "Capacité", val: `${tournament.maxTeams || 16} Équipes` },
                    { icon: Star, label: "Prestige", val: "Edition 2026" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center text-center space-y-2 border border-slate-100">
                      <stat.icon className="w-8 h-8 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                      <span className="font-bold uppercase text-sm text-slate-900">{stat.val}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-slate-900">Informations Clés</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-4">
                  <h4 className="font-black uppercase text-xs tracking-[0.2em] text-primary">Règlement</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Le fair-play est au cœur de OneCup. Le non-respect des horaires et des officiels entraîne une disqualification directe.</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border space-y-4">
                  <h4 className="font-black uppercase text-xs tracking-[0.2em] text-primary">Récompenses</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Les vainqueurs reçoivent le trophée Elite, des médailles officielles et une prime de performance exclusive.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Sidebar */}
          <div className="lg:col-span-5">
            <Card className="sticky top-24 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
              <div className="bg-primary p-10 text-center space-y-2">
                <Trophy className="w-12 h-12 text-white mx-auto mb-2 opacity-80" />
                <h3 className="text-white uppercase font-headline font-black tracking-tight text-2xl">REJOINDRE L'ÉLITE</h3>
                <p className="text-white/70 text-[10px] uppercase font-bold tracking-[0.3em]">Formulaire Officiel</p>
              </div>
              <CardContent className="p-8 md:p-12 space-y-8">
                {isFull ? (
                  <div className="text-center py-10 space-y-4">
                    <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-2 opacity-20" />
                    <p className="font-black uppercase text-destructive text-sm tracking-widest">Compétition Complète</p>
                    <p className="text-slate-400 text-xs font-medium">Restez attentif aux prochaines éditions.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRegistration} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Nom de l'Équipe</Label>
                      <Input required placeholder="EX: ELITE FC" className="h-14 rounded-xl bg-slate-50 border-none font-black uppercase text-sm px-6 focus-visible:ring-primary/20" value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Nom du Capitaine</Label>
                      <Input required placeholder="NOM COMPLET" className="h-14 rounded-xl bg-slate-50 border-none font-black uppercase text-sm px-6 focus-visible:ring-primary/20" value={formData.captainName} onChange={e => setFormData({...formData, captainName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Numéro WhatsApp</Label>
                      <Input required type="tel" placeholder="+243 ..." className="h-14 rounded-xl bg-slate-50 border-none font-black text-sm px-6 focus-visible:ring-primary/20" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                    </div>
                    
                    <div className="flex items-start space-x-4 p-5 rounded-2xl border bg-slate-50/50">
                      <Checkbox id="rules" checked={agreedToRules} onCheckedChange={(c) => setAgreedToRules(!!c)} className="mt-1 rounded-md" />
                      <label htmlFor="rules" className="text-[9px] font-bold leading-relaxed uppercase text-slate-500 cursor-pointer">
                        Je confirme avoir lu et accepté le règlement officiel ainsi que la charte d'éthique ONECUP 2026.
                      </label>
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full h-16 uppercase font-black text-base bg-primary hover:bg-primary/90 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 gap-3">
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : user ? "Confirmer l'inscription" : "Connexion & Inscription"}
                    </Button>
                  </form>
                )}
                
                <div className="pt-4 flex flex-col items-center gap-6">
                   <div className="flex items-center gap-2 text-slate-300">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Paiement sécurisé via Mobile Money</span>
                   </div>
                   <Button variant="ghost" onClick={() => navigator.share?.({ title: tournament.name, url: window.location.href })} className="w-full h-12 rounded-xl uppercase font-black text-[10px] tracking-widest gap-2 hover:bg-slate-50 text-slate-400">
                    <Share2 className="w-4 h-4" /> Partager l'événement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

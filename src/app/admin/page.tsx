
"use client";

import { useState, useMemo, useRef } from "react";
import { Trophy, Plus, Trash2, ShieldCheck, Loader2, Upload, X, Settings, Save, Edit2, Check, Video, MessageCircle, DollarSign, Users, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCollection, useFirestore, useUser, useDoc } from "@/firebase";
import { doc, addDoc, deleteDoc, collection, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const ADMIN_EMAIL = "onecup2026@gmail.com";

export default function AdminDashboard() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const afterCupInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const matchesRef = useMemo(() => (db ? collection(db, "matches") : null), [db]);
  const registrationsRef = useMemo(() => (db ? collection(db, "registrations") : null), [db]);
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);

  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: matches } = useCollection(matchesRef);
  const { data: registrations } = useCollection(registrationsRef);
  const { data: siteConfig } = useDoc(configRef);

  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  const initialTournamentState = {
    name: "", 
    gameType: "Football", 
    startDate: "", 
    endDate: "", 
    registrationDeadline: "", 
    entryFee: 0, 
    maxTeams: 16, 
    description: "", 
    imageUrl: "",
    locationStade: "",
    locationCommune: "",
    locationAdresse: "",
    teaserVideoUrl: ""
  };

  const [tournamentForm, setTournamentForm] = useState(initialTournamentState);

  const initialMatchState = {
    tournamentId: "", 
    team1Id: "", 
    team2Id: "", 
    matchNumber: 1, 
    scheduledTime: "", 
    status: "À Venir", 
    scoreTeam1: 0, 
    scoreTeam2: 0,
    winnerId: ""
  };

  const [matchForm, setMatchForm] = useState(initialMatchState);

  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configForm, setConfigForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    currentPrizePool: 0,
    targetPrizePool: 0,
    statSchools: "",
    statMatches: "",
    statTalents: ""
  });

  // Sync config form when siteConfig loads
  useMemo(() => {
    if (siteConfig) {
      setConfigForm({
        heroTitle: siteConfig.heroTitle || "DEVENEZ UNE LÉGENDE.\nLA GLOIRE VOUS APPELLE.",
        heroSubtitle: siteConfig.heroSubtitle || "ONECUP 2026 : L'événement unique où le talent rencontre l'excellence.",
        currentPrizePool: siteConfig.currentPrizePool || 0,
        targetPrizePool: siteConfig.targetPrizePool || 5000000,
        statSchools: siteConfig.statSchools || "32+",
        statMatches: siteConfig.statMatches || "15+",
        statTalents: siteConfig.statTalents || "257+"
      });
    }
  }, [siteConfig]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'tournament' | 'background' | 'aftercup') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Fichier trop volumineux" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'tournament') {
          setTournamentForm(prev => ({ ...prev, imageUrl: base64 }));
        } else if (type === 'background') {
          updateSiteConfig({ heroImageUrl: base64 });
        } else if (type === 'aftercup') {
          updateSiteConfig({ afterCupImageUrl: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSiteConfig = (data: any) => {
    if (!db || !isAdmin) return;
    setIsSavingConfig(true);
    setDoc(doc(db, "settings", "config"), data, { merge: true })
      .then(() => toast({ title: "Configuration mise à jour !" }))
      .catch(e => console.error(e))
      .finally(() => setIsSavingConfig(false));
  };

  const handleSaveTournament = () => {
    if (!db || !isAdmin || !user) return;
    if (editingTournamentId) {
      updateDoc(doc(db, "tournaments", editingTournamentId), {
        ...tournamentForm,
        updatedAt: serverTimestamp()
      }).then(() => {
        toast({ title: "Tournoi mis à jour !" });
        setEditingTournamentId(null);
        setTournamentForm(initialTournamentState);
      });
    } else {
      const data = { ...tournamentForm, organizerId: user.uid, teamsRegistered: 0, createdAt: serverTimestamp() };
      addDoc(collection(db, "tournaments"), data).then(() => {
        toast({ title: "Tournoi publié !" });
        setTournamentForm(initialTournamentState);
      });
    }
  };

  const handleSaveMatch = () => {
    if (!db || !isAdmin || !matchForm.tournamentId) return;
    const tournamentName = tournaments?.find(t => t.id === matchForm.tournamentId)?.name || "Tournoi";
    if (editingMatchId) {
      updateDoc(doc(db, "matches", editingMatchId), { ...matchForm, tournamentName, updatedAt: serverTimestamp() })
        .then(() => {
          toast({ title: "Match mis à jour !" });
          setEditingMatchId(null);
          setMatchForm(initialMatchState);
        });
    } else {
      addDoc(collection(db, "matches"), { ...matchForm, tournamentName }).then(() => {
        toast({ title: "Match programmé !" });
        setMatchForm(initialMatchState);
      });
    }
  };

  const startEditTournament = (t: any) => {
    setEditingTournamentId(t.id);
    setTournamentForm({ ...t });
  };

  const startEditMatch = (m: any) => {
    setEditingMatchId(m.id);
    setMatchForm({ ...m });
  };

  const handleDelete = (coll: string, id: string) => {
    if (!db || !isAdmin) return;
    deleteDoc(doc(db, coll, id)).then(() => toast({ title: "Supprimé" }));
  };

  const openWhatsApp = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!isAdmin) return <div className="p-20 text-center flex flex-col items-center gap-4"><ShieldCheck className="w-12 h-12 text-destructive" /><h2 className="text-2xl font-bold uppercase">Accès Restreint</h2></div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold uppercase tracking-tighter">Administration ONECUP</h1>
        <Badge className="bg-primary px-4 py-1">Admin: {user?.displayName}</Badge>
      </div>

      <Tabs defaultValue="tournaments" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl mb-6 flex flex-wrap h-auto">
          <TabsTrigger value="tournaments" className="uppercase font-bold text-xs">Tournois</TabsTrigger>
          <TabsTrigger value="matches" className="uppercase font-bold text-xs">Scores & Matchs</TabsTrigger>
          <TabsTrigger value="registrations" className="uppercase font-bold text-xs">Inscriptions</TabsTrigger>
          <TabsTrigger value="config" className="uppercase font-bold text-xs gap-2"><Settings className="w-3 h-3" /> Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="tournaments" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader><CardTitle className="text-lg uppercase">{editingTournamentId ? "Modifier" : "Nouveau"} Tournoi</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Nom</Label><Input value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} /></div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">Type</Label>
                  <Select value={tournamentForm.gameType} onValueChange={(val) => setTournamentForm({...tournamentForm, gameType: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Football">Football</SelectItem><SelectItem value="Esport">PlayStation</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Date de début</Label><Input type="date" value={tournamentForm.startDate} onChange={e => setTournamentForm({...tournamentForm, startDate: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Lieu (Stade)</Label><Input value={tournamentForm.locationStade} onChange={e => setTournamentForm({...tournamentForm, locationStade: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Commune</Label><Input value={tournamentForm.locationCommune} onChange={e => setTournamentForm({...tournamentForm, locationCommune: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Places Max</Label><Input type="number" value={tournamentForm.maxTeams} onChange={e => setTournamentForm({...tournamentForm, maxTeams: Number(e.target.value)})} /></div>
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase">Affiche</Label>
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'tournament')} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 text-xs uppercase"><Upload className="w-4 h-4" /> Sélectionner Image</Button>
                {tournamentForm.imageUrl && <img src={tournamentForm.imageUrl} alt="Aperçu" className="w-48 rounded-lg border" />}
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Description</Label><Textarea value={tournamentForm.description} onChange={e => setTournamentForm({...tournamentForm, description: e.target.value})} /></div>
              </div>
              <Button onClick={handleSaveTournament} className="w-full uppercase font-bold bg-primary">{editingTournamentId ? "Enregistrer" : "Publier"}</Button>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournaments?.map((t: any) => (
              <Card key={t.id} className="p-4 flex items-center justify-between border-white/5 bg-card/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center"><Trophy className="w-5 h-5 text-primary" /></div>
                  <div><p className="font-bold text-xs uppercase">{t.name}</p><p className="text-[10px] text-muted-foreground">{t.gameType} • {t.locationStade}</p></div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => startEditTournament(t)}><Edit2 className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete('tournaments', t.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader><CardTitle className="text-lg uppercase">Programmation des Matchs</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">Tournoi</Label>
                  <Select value={matchForm.tournamentId} onValueChange={(val) => setMatchForm({...matchForm, tournamentId: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{tournaments?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Équipe 1</Label><Input value={matchForm.team1Id} onChange={e => setMatchForm({...matchForm, team1Id: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Équipe 2</Label><Input value={matchForm.team2Id} onChange={e => setMatchForm({...matchForm, team2Id: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Status</Label><Select value={matchForm.status} onValueChange={(val) => setMatchForm({...matchForm, status: val})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="À Venir">À Venir</SelectItem><SelectItem value="En Cours">En Cours</SelectItem><SelectItem value="Terminé">Terminé</SelectItem></SelectContent></Select></div>
              </div>
              <Button onClick={handleSaveMatch} className="w-full bg-primary uppercase font-bold">Valider le Match</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <div className="space-y-4">
            {registrations?.map((r: any) => (
              <Card key={r.id} className="p-4 border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold uppercase text-sm">{r.teamName}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{r.captainName} • {r.contactPhone}</p>
                    <p className="text-[10px] text-primary font-bold uppercase">{r.tournamentName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => openWhatsApp(r.contactPhone)} className="gap-2 text-green-500 border-green-500/30 hover:bg-green-500/10">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete('registrations', r.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader><CardTitle className="text-lg uppercase">Pilotage de la Plateforme</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Titre Hero</Label><Input value={configForm.heroTitle} onChange={e => setConfigForm({...configForm, heroTitle: e.target.value})} /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Sous-titre Hero</Label><Textarea value={configForm.heroSubtitle} onChange={e => setConfigForm({...configForm, heroSubtitle: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Cagnotte Actuelle (FC)</Label><Input type="number" value={configForm.currentPrizePool} onChange={e => setConfigForm({...configForm, currentPrizePool: Number(e.target.value)})} /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Objectif Cagnotte (FC)</Label><Input type="number" value={configForm.targetPrizePool} onChange={e => setConfigForm({...configForm, targetPrizePool: Number(e.target.value)})} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Stat: Écoles</Label><Input value={configForm.statSchools} onChange={e => setConfigForm({...configForm, statSchools: e.target.value})} /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Stat: Matchs</Label><Input value={configForm.statMatches} onChange={e => setConfigForm({...configForm, statMatches: e.target.value})} /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Stat: Talents</Label><Input value={configForm.statTalents} onChange={e => setConfigForm({...configForm, statTalents: e.target.value})} /></div>
                </div>
              </div>
              <Button onClick={() => updateSiteConfig(configForm)} className="w-full bg-primary uppercase font-bold" disabled={isSavingConfig}>
                {isSavingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Sauvegarder la Configuration</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader><CardTitle className="text-lg uppercase">Visuels du Site</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="uppercase font-bold text-xs">Fond d'accueil</Label>
                <input type="file" ref={bgInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'background')} />
                <Button variant="outline" onClick={() => bgInputRef.current?.click()} className="w-full uppercase text-xs">Changer l'image Hero</Button>
              </div>
              <div className="space-y-4">
                <Label className="uppercase font-bold text-xs">Fond After Cup</Label>
                <input type="file" ref={afterCupInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'aftercup')} />
                <Button variant="outline" onClick={() => afterCupInputRef.current?.click()} className="w-full uppercase text-xs">Changer l'image After Cup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

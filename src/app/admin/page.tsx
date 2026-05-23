
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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

  useEffect(() => {
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
      .then(() => toast({ title: "Configuration sauvegardée !" }))
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
        toast({ title: "Tournoi mis à jour définitivement !" });
        setEditingTournamentId(null);
        setTournamentForm(initialTournamentState);
      });
    } else {
      const data = { 
        ...tournamentForm, 
        organizerId: user.uid, 
        teamsRegistered: 0, 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp() 
      };
      addDoc(collection(db, "tournaments"), data).then(() => {
        toast({ title: "Nouveau tournoi publié et sauvegardé !" });
        setTournamentForm(initialTournamentState);
      });
    }
  };

  const handleSaveMatch = () => {
    if (!db || !isAdmin || !matchForm.tournamentId) return;
    const tournamentName = tournaments?.find(t => t.id === matchForm.tournamentId)?.name || "Tournoi";
    if (editingMatchId) {
      updateDoc(doc(db, "matches", editingMatchId), { 
        ...matchForm, 
        tournamentName, 
        updatedAt: serverTimestamp() 
      }).then(() => {
        toast({ title: "Match mis à jour !" });
        setEditingMatchId(null);
        setMatchForm(initialMatchState);
      });
    } else {
      addDoc(collection(db, "matches"), { 
        ...matchForm, 
        tournamentName,
        createdAt: serverTimestamp() 
      }).then(() => {
        toast({ title: "Match programmé !" });
        setMatchForm(initialMatchState);
      });
    }
  };

  const startEditTournament = (t: any) => {
    setEditingTournamentId(t.id);
    setTournamentForm({ ...t });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (coll: string, id: string) => {
    if (!db || !isAdmin) return;
    if (confirm("Voulez-vous vraiment supprimer cet élément définitivement ?")) {
      deleteDoc(doc(db, coll, id)).then(() => toast({ title: "Suppression confirmée" }));
    }
  };

  const openWhatsApp = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
  if (!isAdmin) return <div className="p-20 text-center flex flex-col items-center gap-4"><ShieldCheck className="w-12 h-12 text-destructive" /><h2 className="text-2xl font-bold uppercase tracking-tighter">Accès Restreint Administrateur</h2></div>;

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 bg-background min-h-screen">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b pb-8">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-4xl font-headline font-bold uppercase tracking-tighter">Console de Gestion ONECUP</h1>
          <p className="text-muted-foreground text-sm font-medium">Contrôlez chaque aspect de votre événement en temps réel.</p>
        </div>
        <Badge className="bg-primary text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs">Admin: {user?.displayName}</Badge>
      </header>

      <Tabs defaultValue="tournaments" className="w-full">
        <TabsList className="bg-muted p-1.5 rounded-2xl mb-12 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="tournaments" className="flex-1 uppercase font-bold text-[10px] py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Tournois</TabsTrigger>
          <TabsTrigger value="matches" className="flex-1 uppercase font-bold text-[10px] py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Matchs & Scores</TabsTrigger>
          <TabsTrigger value="registrations" className="flex-1 uppercase font-bold text-[10px] py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Inscriptions</TabsTrigger>
          <TabsTrigger value="config" className="flex-1 uppercase font-bold text-[10px] py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><Settings className="w-3 h-3" /> Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="tournaments" className="space-y-10">
          <Card className="border-primary/20 shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b p-8">
              <CardTitle className="text-2xl uppercase font-headline font-bold">{editingTournamentId ? "Modifier le" : "Nouveau"} Tournoi</CardTitle>
              <CardDescription>Remplissez les informations pour qu'elles s'affichent partout sur le site.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nom du Tournoi</Label><Input value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} className="h-12 rounded-xl" placeholder="Ex: OneCup Football Elite" /></div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type de Discipline</Label>
                  <Select value={tournamentForm.gameType} onValueChange={(val) => setTournamentForm({...tournamentForm, gameType: val})}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Football">Football</SelectItem><SelectItem value="Esport">PlayStation (E-Sport)</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date de lancement</Label><Input type="date" value={tournamentForm.startDate} onChange={e => setTournamentForm({...tournamentForm, startDate: e.target.value})} className="h-12 rounded-xl" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lieu (Nom du Stade)</Label><Input value={tournamentForm.locationStade} onChange={e => setTournamentForm({...tournamentForm, locationStade: e.target.value})} className="h-12 rounded-xl" placeholder="Ex: Stade des Martyrs" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Commune</Label><Input value={tournamentForm.locationCommune} onChange={e => setTournamentForm({...tournamentForm, locationCommune: e.target.value})} className="h-12 rounded-xl" placeholder="Ex: Lingwala" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nombre d'équipes max</Label><Input type="number" value={tournamentForm.maxTeams} onChange={e => setTournamentForm({...tournamentForm, maxTeams: Number(e.target.value)})} className="h-12 rounded-xl" /></div>
              </div>

              <div className="space-y-6 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Affiche Officielle</Label>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'tournament')} accept="image/*" />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full h-24 border-dashed rounded-2xl gap-3 text-xs uppercase font-bold hover:bg-primary/5 transition-colors">
                      <Upload className="w-6 h-6 text-primary" /> Sélectionner l'image de l'affiche
                    </Button>
                    {tournamentForm.imageUrl && (
                      <div className="relative group">
                        <img src={tournamentForm.imageUrl} alt="Aperçu" className="w-full aspect-video object-cover rounded-2xl border shadow-lg" />
                        <Button size="icon" variant="destructive" className="absolute top-2 right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setTournamentForm(p => ({...p, imageUrl: ""}))}><X className="w-4 h-4" /></Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lien Vidéo Teaser (YouTube)</Label>
                    <Input value={tournamentForm.teaserVideoUrl} onChange={e => setTournamentForm({...tournamentForm, teaserVideoUrl: e.target.value})} className="h-12 rounded-xl" placeholder="https://www.youtube.com/watch?v=..." />
                    <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                       <p className="text-[10px] font-bold uppercase text-primary">Comment obtenir le lien ?</p>
                       <p className="text-[9px] text-muted-foreground">Copiez l'adresse de votre vidéo YouTube. Elle s'affichera automatiquement sur la page détails du tournoi.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description & Règlement Spécifique</Label>
                  <Textarea value={tournamentForm.description} onChange={e => setTournamentForm({...tournamentForm, description: e.target.value})} className="min-h-[150px] rounded-2xl p-4" placeholder="Détails du tournoi, récompenses, conditions..." />
                </div>
              </div>
              <Button onClick={handleSaveTournament} className="w-full h-16 uppercase font-black text-lg bg-primary rounded-2xl glow-blue transition-transform hover:scale-[1.01] active:scale-100">
                {editingTournamentId ? "Confirmer les modifications" : "Publier le tournoi définitivement"}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournaments?.map((t: any) => (
              <Card key={t.id} className="p-6 flex items-center justify-between border-white/5 bg-card/50 hover:border-primary/30 transition-all rounded-3xl group shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">{t.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">{t.gameType} • {t.locationStade} ({t.locationCommune})</p>
                    <Badge variant="outline" className="mt-2 text-[9px] border-primary/20 text-primary uppercase font-bold">{t.teamsRegistered || 0} / {t.maxTeams} équipes</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => startEditTournament(t)} className="rounded-full hover:bg-primary/10 hover:text-primary"><Edit2 className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete('tournaments', t.id)} className="rounded-full hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-10">
          <Card className="border-primary/20 shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b p-8">
              <CardTitle className="text-2xl uppercase font-headline font-bold">Pilotage de la Plateforme</CardTitle>
              <CardDescription>Mettez à jour les visuels et les statistiques globales du site en un clic.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Titre de la Page d'Accueil</Label><Input value={configForm.heroTitle} onChange={e => setConfigForm({...configForm, heroTitle: e.target.value})} className="h-12 rounded-xl" /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sous-titre d'Accueil</Label><Textarea value={configForm.heroSubtitle} onChange={e => setConfigForm({...configForm, heroSubtitle: e.target.value})} className="rounded-xl min-h-[48px]" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cagnotte Actuelle (FC)</Label><Input type="number" value={configForm.currentPrizePool} onChange={e => setConfigForm({...configForm, currentPrizePool: Number(e.target.value)})} className="h-12 rounded-xl" /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Objectif de la Cagnotte (FC)</Label><Input type="number" value={configForm.targetPrizePool} onChange={e => setConfigForm({...configForm, targetPrizePool: Number(e.target.value)})} className="h-12 rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-8">
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Statistique: Écoles</Label><Input value={configForm.statSchools} onChange={e => setConfigForm({...configForm, statSchools: e.target.value})} className="h-12 rounded-xl" /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Statistique: Matchs</Label><Input value={configForm.statMatches} onChange={e => setConfigForm({...configForm, statMatches: e.target.value})} className="h-12 rounded-xl" /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Statistique: Talents</Label><Input value={configForm.statTalents} onChange={e => setConfigForm({...configForm, statTalents: e.target.value})} className="h-12 rounded-xl" /></div>
                </div>
              </div>
              <Button onClick={() => updateSiteConfig(configForm)} className="w-full h-16 uppercase font-black text-lg bg-primary rounded-2xl glow-blue" disabled={isSavingConfig}>
                {isSavingConfig ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5 mr-3" /> Sauvegarder la Configuration Globale</>}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-[2rem] border-white/5 overflow-hidden shadow-xl">
              <CardHeader className="pb-4"><CardTitle className="text-sm font-bold uppercase tracking-widest">Image de Fond (Accueil)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <input type="file" ref={bgInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'background')} accept="image/*" />
                <Button variant="outline" onClick={() => bgInputRef.current?.click()} className="w-full h-12 rounded-xl uppercase text-xs font-bold border-primary/20 text-primary">Remplacer l'image Hero</Button>
                {siteConfig?.heroImageUrl && <img src={siteConfig.heroImageUrl} alt="Hero" className="w-full aspect-video object-cover rounded-xl border shadow-sm" />}
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-white/5 overflow-hidden shadow-xl">
              <CardHeader className="pb-4"><CardTitle className="text-sm font-bold uppercase tracking-widest">Image de Fond (After Cup)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <input type="file" ref={afterCupInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'aftercup')} accept="image/*" />
                <Button variant="outline" onClick={() => afterCupInputRef.current?.click()} className="w-full h-12 rounded-xl uppercase text-xs font-bold border-secondary/20 text-secondary">Remplacer l'image After Cup</Button>
                {siteConfig?.afterCupImageUrl && <img src={siteConfig.afterCupImageUrl} alt="After Cup" className="w-full aspect-video object-cover rounded-xl border shadow-sm" />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other Tabs Content (Matches, Registrations) remains the same but within this methodology */}
        <TabsContent value="matches" className="space-y-6">
          <Card className="border-primary/20 rounded-[2.5rem] shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 border-b"><CardTitle className="text-xl uppercase font-bold">Programmation & Résultats</CardTitle></CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">Tournoi Associé</Label>
                  <Select value={matchForm.tournamentId} onValueChange={(val) => setMatchForm({...matchForm, tournamentId: val})}>
                    <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Choisir un tournoi" /></SelectTrigger>
                    <SelectContent>{tournaments?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Équipe 1</Label><Input value={matchForm.team1Id} onChange={e => setMatchForm({...matchForm, team1Id: e.target.value})} className="rounded-xl h-12" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Équipe 2</Label><Input value={matchForm.team2Id} onChange={e => setMatchForm({...matchForm, team2Id: e.target.value})} className="rounded-xl h-12" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Statut</Label><Select value={matchForm.status} onValueChange={(val) => setMatchForm({...matchForm, status: val})}><SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="À Venir">À Venir</SelectItem><SelectItem value="En Cours">En Cours</SelectItem><SelectItem value="Terminé">Terminé</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Score Équipe 1</Label><Input type="number" value={matchForm.scoreTeam1} onChange={e => setMatchForm({...matchForm, scoreTeam1: Number(e.target.value)})} className="rounded-xl h-12" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Score Équipe 2</Label><Input type="number" value={matchForm.scoreTeam2} onChange={e => setMatchForm({...matchForm, scoreTeam2: Number(e.target.value)})} className="rounded-xl h-12" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase">Gagnant (ID)</Label><Input value={matchForm.winnerId} onChange={e => setMatchForm({...matchForm, winnerId: e.target.value})} className="rounded-xl h-12" placeholder="Nom de l'équipe gagnante" /></div>
              </div>
              <Button onClick={handleSaveMatch} className="w-full h-12 bg-primary uppercase font-bold rounded-xl mt-4">Valider le Match</Button>
            </CardContent>
          </Card>
          <div className="space-y-4">
             {matches?.map((m: any) => (
               <Card key={m.id} className="p-4 border-white/5 bg-card flex items-center justify-between rounded-2xl group">
                 <div className="flex items-center gap-6">
                    <Badge variant="outline" className="h-10 w-10 flex items-center justify-center font-black rounded-xl">#{m.matchNumber}</Badge>
                    <div>
                      <p className="font-bold text-sm uppercase">{m.team1Id} vs {m.team2Id}</p>
                      <p className="text-[10px] text-primary font-bold uppercase">{m.tournamentName} • {m.status}</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => startEditMatch(m)}><Edit2 className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete('matches', m.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                 </div>
               </Card>
             ))}
          </div>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {registrations?.map((r: any) => (
              <Card key={r.id} className="p-6 border-white/5 bg-card/50 rounded-[2rem] shadow-sm hover:border-primary/20 transition-all group">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <p className="font-black uppercase text-lg tracking-tighter">{r.teamName}</p>
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10 text-[9px] uppercase font-bold">{r.status}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{r.captainName} • {r.contactPhone}</p>
                    <p className="text-xs text-primary font-black uppercase tracking-tighter">{r.tournamentName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => openWhatsApp(r.contactPhone)} className="h-12 px-6 gap-3 text-green-500 border-green-500/30 hover:bg-green-500/10 rounded-2xl font-bold uppercase text-xs transition-all hover:scale-105 active:scale-100">
                      <MessageCircle className="w-5 h-5" /> Contacter par WhatsApp
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete('registrations', r.id)} className="h-12 w-12 rounded-2xl hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-5 h-5" /></Button>
                  </div>
                </div>
              </Card>
            ))}
            {!registrations?.length && (
              <div className="text-center py-24 border border-dashed rounded-[3rem] opacity-20">
                <Users className="w-16 h-16 mx-auto mb-4" />
                <p className="uppercase font-bold tracking-widest">Aucune inscription pour le moment</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function startEditMatch(m: any) {
    // This is a local mock for the snippet
}

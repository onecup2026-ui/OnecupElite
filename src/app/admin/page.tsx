
"use client";

import { useState, useMemo, useRef } from "react";
import { Trophy, Plus, Trash2, ShieldCheck, Loader2, Upload, X, Settings, Save, Edit2, Check, Video } from "lucide-react";
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'tournament' | 'background' | 'aftercup') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Fichier trop volumineux",
          description: "L'image doit faire moins de 5 Mo."
        });
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
      const data = { 
        ...tournamentForm, 
        organizerId: user.uid,
        teamsRegistered: 0,
        createdAt: serverTimestamp() 
      };
      
      addDoc(collection(db, "tournaments"), data)
        .then(() => {
          toast({ title: "Tournoi publié !" });
          setTournamentForm(initialTournamentState);
        })
        .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: '/tournaments', 
          operation: 'create', 
          requestResourceData: data 
        })));
    }
  };

  const handleSaveMatch = () => {
    if (!db || !isAdmin || !matchForm.tournamentId) return;
    const tournamentName = tournaments?.find(t => t.id === matchForm.tournamentId)?.name || "Discipline";
    
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
      const data = { ...matchForm, tournamentName };
      addDoc(collection(db, "matches"), data)
        .then(() => {
          toast({ title: "Match programmé !" });
          setMatchForm(initialMatchState);
        })
        .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: '/matches', 
          operation: 'create', 
          requestResourceData: data 
        })));
    }
  };

  const startEditTournament = (t: any) => {
    setEditingTournamentId(t.id);
    setTournamentForm({
      name: t.name || "",
      gameType: t.gameType || "Football",
      startDate: t.startDate || "",
      endDate: t.endDate || "",
      registrationDeadline: t.registrationDeadline || "",
      entryFee: t.entryFee || 0,
      maxTeams: t.maxTeams || 16,
      description: t.description || "",
      imageUrl: t.imageUrl || "",
      locationStade: t.locationStade || "",
      locationCommune: t.locationCommune || "",
      locationAdresse: t.locationAdresse || "",
      teaserVideoUrl: t.teaserVideoUrl || ""
    });
  };

  const startEditMatch = (m: any) => {
    setEditingMatchId(m.id);
    setMatchForm({
      tournamentId: m.tournamentId || "",
      team1Id: m.team1Id || "",
      team2Id: m.team2Id || "",
      matchNumber: m.matchNumber || 1,
      scheduledTime: m.scheduledTime || "",
      status: m.status || "À Venir",
      scoreTeam1: m.scoreTeam1 || 0,
      scoreTeam2: m.scoreTeam2 || 0,
      winnerId: m.winnerId || ""
    });
  };

  const handleDelete = (coll: string, id: string) => {
    if (!db || !isAdmin) return;
    deleteDoc(doc(db, coll, id)).then(() => toast({ title: "Supprimé" }));
  };

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  
  if (!isAdmin) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <ShieldCheck className="w-12 h-12 text-destructive" />
      <h2 className="text-2xl font-bold uppercase tracking-tighter">Accès Restreint</h2>
      <p className="text-muted-foreground">Seul l'administrateur ({ADMIN_EMAIL}) peut accéder à cette interface.</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold uppercase tracking-tighter">Administration ONECUP</h1>
        <div className="flex items-center gap-2">
           <Badge className="bg-primary px-4 py-1">Mode: {user?.displayName}</Badge>
        </div>
      </div>

      <Tabs defaultValue="tournaments" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl mb-6 flex flex-wrap h-auto">
          <TabsTrigger value="tournaments" className="uppercase font-bold text-xs">Disciplines</TabsTrigger>
          <TabsTrigger value="matches" className="uppercase font-bold text-xs">Scores & Progression</TabsTrigger>
          <TabsTrigger value="registrations" className="uppercase font-bold text-xs">Inscriptions</TabsTrigger>
          <TabsTrigger value="config" className="uppercase font-bold text-xs gap-2"><Settings className="w-3 h-3" /> Config Plateforme</TabsTrigger>
        </TabsList>

        <TabsContent value="tournaments" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg uppercase flex items-center justify-between">
                {editingTournamentId ? "Modifier la Discipline" : "Nouvelle Discipline"}
                {editingTournamentId && <Button variant="ghost" size="sm" onClick={() => {setEditingTournamentId(null); setTournamentForm(initialTournamentState);}}><X className="w-4 h-4 mr-2" /> Annuler</Button>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold">Nom officiel</Label>
                  <Input placeholder="Ex: Ligue Football Élite" value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold">Catégorie</Label>
                  <Select value={tournamentForm.gameType} onValueChange={(val) => setTournamentForm({...tournamentForm, gameType: val})}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Football">Football</SelectItem>
                      <SelectItem value="Esport">PlayStation (E-Sport)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold">Date de début</Label>
                  <Input type="date" value={tournamentForm.startDate} onChange={e => setTournamentForm({...tournamentForm, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold">Lieu (Stade)</Label>
                  <Input placeholder="Stade..." value={tournamentForm.locationStade} onChange={e => setTournamentForm({...tournamentForm, locationStade: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold">Commune</Label>
                  <Input placeholder="Commune..." value={tournamentForm.locationCommune} onChange={e => setTournamentForm({...tournamentForm, locationCommune: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold">Équipes Max</Label>
                  <Input type="number" value={tournamentForm.maxTeams} onChange={e => setTournamentForm({...tournamentForm, maxTeams: Number(e.target.value)})} />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <Label className="text-[10px] uppercase font-bold">Affiche Officielle</Label>
                  <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'tournament')} />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 uppercase font-bold text-xs">
                      <Upload className="w-4 h-4" /> Sélectionner Image
                    </Button>
                  </div>
                  {tournamentForm.imageUrl && (
                    <div className="relative aspect-video w-full max-w-sm rounded-xl overflow-hidden border-2 border-primary/20">
                      <img src={tournamentForm.imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                      <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-8 w-8" onClick={() => setTournamentForm(p => ({...p, imageUrl: ""}))}><X className="w-4 h-4" /></Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold">URL Vidéo Teaser (YouTube)</Label>
                  <Input placeholder="https://youtube.com/watch?v=..." value={tournamentForm.teaserVideoUrl} onChange={e => setTournamentForm({...tournamentForm, teaserVideoUrl: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold">Description & Règlement</Label>
                  <Textarea value={tournamentForm.description} onChange={e => setTournamentForm({...tournamentForm, description: e.target.value})} className="min-h-[120px]" />
                </div>
              </div>
              <Button onClick={handleSaveTournament} className="w-full h-12 uppercase font-bold bg-primary glow-blue">
                {editingTournamentId ? "Enregistrer les modifications" : "Publier la Discipline"}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournaments?.map((t: any) => (
              <Card key={t.id} className="p-4 flex items-center justify-between border-white/5 bg-card/50">
                <div className="flex items-center gap-4">
                  {t.imageUrl ? <img src={t.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" /> : <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"><Trophy className="w-6 h-6 text-primary" /></div>}
                  <div>
                    <p className="font-bold text-xs uppercase">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{t.gameType} • {t.locationStade}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => startEditTournament(t)} className="hover:text-primary"><Edit2 className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete('tournaments', t.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matches">
          <div className="space-y-6">
             <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg uppercase flex items-center justify-between">
                  {editingMatchId ? "Modifier le Match" : "Programmer une Rencontre"}
                  {editingMatchId && <Button variant="ghost" size="sm" onClick={() => {setEditingMatchId(null); setMatchForm(initialMatchState);}}><X className="w-4 h-4 mr-2" /> Annuler</Button>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Discipline</Label>
                    <Select value={matchForm.tournamentId} onValueChange={(val) => setMatchForm({...matchForm, tournamentId: val})}>
                      <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                      <SelectContent>
                        {tournaments?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">N° Match (Ordre)</Label>
                    <Input type="number" value={matchForm.matchNumber} onChange={e => setMatchForm({...matchForm, matchNumber: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Équipe 1</Label>
                    <Input value={matchForm.team1Id} onChange={e => setMatchForm({...matchForm, team1Id: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Équipe 2</Label>
                    <Input value={matchForm.team2Id} onChange={e => setMatchForm({...matchForm, team2Id: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Score E1</Label>
                    <Input type="number" value={matchForm.scoreTeam1} onChange={e => setMatchForm({...matchForm, scoreTeam1: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Score E2</Label>
                    <Input type="number" value={matchForm.scoreTeam2} onChange={e => setMatchForm({...matchForm, scoreTeam2: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Date & Heure</Label>
                    <Input type="datetime-local" value={matchForm.scheduledTime} onChange={e => setMatchForm({...matchForm, scheduledTime: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Statut</Label>
                    <Select value={matchForm.status} onValueChange={(val) => setMatchForm({...matchForm, status: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="À Venir">À Venir</SelectItem>
                        <SelectItem value="En Cours">En Cours</SelectItem>
                        <SelectItem value="Terminé">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveMatch} className="w-full uppercase font-bold bg-primary glow-blue">
                  {editingMatchId ? "Mettre à jour le score" : "Valider le Match"}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h3 className="uppercase font-bold text-sm tracking-widest text-muted-foreground">Progression des Matchs</h3>
              {matches?.sort((a,b) => (a.matchNumber || 0) - (b.matchNumber || 0)).map((m: any) => (
                <Card key={m.id} className="p-4 flex items-center justify-between border-white/5 bg-card/50">
                  <div className="flex items-center gap-6">
                    <Badge variant="outline" className="h-8 w-8 rounded-full p-0 flex items-center justify-center font-bold">#{m.matchNumber}</Badge>
                    <div>
                      <p className="font-bold text-sm">{m.team1Id} vs {m.team2Id}</p>
                      <p className="text-[10px] text-primary uppercase font-bold">{m.scoreTeam1} - {m.scoreTeam2} • {m.status}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => startEditMatch(m)}><Edit2 className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete('matches', m.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="registrations">
           <div className="space-y-4">
             {registrations?.map((r: any) => (
              <Card key={r.id} className="p-4 border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold uppercase text-sm">{r.teamName}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Contact: {r.captainName} • {r.contactPhone}</p>
                    <p className="text-[10px] text-primary uppercase font-bold">Discipline: {r.tournamentName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="uppercase text-[10px]">{r.status || "En attente"}</Badge>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete('registrations', r.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </Card>
            ))}
           </div>
        </TabsContent>

        <TabsContent value="config">
           <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg uppercase">Design & Images Plateforme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <Label className="uppercase font-bold text-xs">Image de Fond (Accueil)</Label>
                <input type="file" ref={bgInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'background')} />
                <Button variant="outline" onClick={() => bgInputRef.current?.click()} className="w-full">Remplacer Fond Accueil</Button>
                {siteConfig?.heroImageUrl && <img src={siteConfig.heroImageUrl} className="w-48 rounded-lg border mt-2" />}
              </div>

              <div className="space-y-4">
                <Label className="uppercase font-bold text-xs">Image Page After Cup</Label>
                <input type="file" ref={afterCupInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'aftercup')} />
                <Button variant="outline" onClick={() => afterCupInputRef.current?.click()} className="w-full">Remplacer Fond After Cup</Button>
                {siteConfig?.afterCupImageUrl && <img src={siteConfig.afterCupImageUrl} className="w-48 rounded-lg border mt-2" />}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

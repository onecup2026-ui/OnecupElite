
"use client";

import { useState, useMemo, useRef } from "react";
import { Trophy, Plus, Trash2, ShieldCheck, Loader2, Upload, X, Settings, Image as ImageIcon, Save } from "lucide-react";
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

  const isAdmin = user?.email === ADMIN_EMAIL;

  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const matchesRef = useMemo(() => (db ? collection(db, "matches") : null), [db]);
  const registrationsRef = useMemo(() => (db ? collection(db, "registrations") : null), [db]);
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);

  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: matches } = useCollection(matchesRef);
  const { data: registrations } = useCollection(registrationsRef);
  const { data: siteConfig } = useDoc(configRef);

  const [newTournament, setNewTournament] = useState({
    name: "", 
    gameType: "Football", 
    startDate: "", 
    endDate: "", 
    registrationDeadline: "", 
    entryFee: 0, 
    maxTeams: 16, 
    description: "", 
    imageUrl: ""
  });

  const [newMatch, setNewMatch] = useState({
    tournamentId: "", 
    team1Id: "", 
    team2Id: "", 
    matchNumber: 1, 
    scheduledTime: "", 
    status: "À Venir", 
    scoreTeam1: 0, 
    scoreTeam2: 0
  });

  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'tournament' | 'background') => {
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
          setNewTournament(prev => ({ ...prev, imageUrl: base64 }));
        } else {
          updateBackground(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBackground = (url: string) => {
    if (!db || !isAdmin) return;
    setIsSavingConfig(true);
    setDoc(doc(db, "settings", "config"), { heroImageUrl: url }, { merge: true })
      .then(() => toast({ title: "Fond d'écran mis à jour !" }))
      .catch(e => console.error(e))
      .finally(() => setIsSavingConfig(false));
  };

  const handleAddTournament = () => {
    if (!db || !isAdmin || !user) return;
    const data = { 
      ...newTournament, 
      organizerId: user.uid,
      teamsRegistered: 0,
      createdAt: serverTimestamp() 
    };
    
    addDoc(collection(db, "tournaments"), data)
      .then(() => {
        toast({ title: "Tournoi publié !" });
        setNewTournament({
          name: "", gameType: "Football", startDate: "", endDate: "", registrationDeadline: "", entryFee: 0, maxTeams: 16, description: "", imageUrl: ""
        });
      })
      .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: '/tournaments', 
        operation: 'create', 
        requestResourceData: data 
      })));
  };

  const handleAddMatch = () => {
    if (!db || !isAdmin || !newMatch.tournamentId) return;
    const tournamentName = tournaments?.find(t => t.id === newMatch.tournamentId)?.name || "Tournoi";
    const data = { ...newMatch, tournamentName };
    
    addDoc(collection(db, "matches"), data)
      .then(() => toast({ title: "Match programmé !" }))
      .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: '/matches', 
        operation: 'create', 
        requestResourceData: data 
      })));
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
        <h1 className="text-3xl font-headline font-bold uppercase tracking-tighter">Administration Elite</h1>
        <div className="flex items-center gap-2">
           <Badge className="bg-primary px-4 py-1">Connecté : {user?.displayName}</Badge>
        </div>
      </div>

      <Tabs defaultValue="tournaments" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl mb-6 flex flex-wrap h-auto">
          <TabsTrigger value="tournaments" className="uppercase font-bold text-xs">Tournois</TabsTrigger>
          <TabsTrigger value="matches" className="uppercase font-bold text-xs">Matchs</TabsTrigger>
          <TabsTrigger value="registrations" className="uppercase font-bold text-xs">Inscriptions</TabsTrigger>
          <TabsTrigger value="config" className="uppercase font-bold text-xs gap-2"><Settings className="w-3 h-3" /> Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="tournaments" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-primary/20">
            <CardHeader><CardTitle className="text-lg uppercase">Nouveau Tournoi</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input placeholder="Nom du tournoi" value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} />
                <Select onValueChange={(val) => setNewTournament({...newTournament, gameType: val})}>
                  <SelectTrigger><SelectValue placeholder="Sport/Jeu" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Football">Football</SelectItem>
                    <SelectItem value="Esport">Esport</SelectItem>
                    <SelectItem value="Basketball">Basketball</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Date de début" type="date" value={newTournament.startDate} onChange={e => setNewTournament({...newTournament, startDate: e.target.value})} />
                <Input placeholder="Date de fin" type="date" value={newTournament.endDate} onChange={e => setNewTournament({...newTournament, endDate: e.target.value})} />
                <Input placeholder="Clôture Inscriptions" type="date" value={newTournament.registrationDeadline} onChange={e => setNewTournament({...newTournament, registrationDeadline: e.target.value})} />
                <Input type="number" placeholder="Équipes Max" value={newTournament.maxTeams} onChange={e => setNewTournament({...newTournament, maxTeams: Number(e.target.value)})} />
                <Input type="number" placeholder="Frais d'entrée (FC)" value={newTournament.entryFee} onChange={e => setNewTournament({...newTournament, entryFee: Number(e.target.value)})} />
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'tournament')} />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 border-primary/30 text-primary hover:bg-primary/5 uppercase font-bold text-xs">
                      <Upload className="w-4 h-4" /> Image du tournoi (Max 5Mo)
                    </Button>
                  </div>
                  {newTournament.imageUrl && (
                    <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden border-2 border-primary/20">
                      <img src={newTournament.imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                      <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-8 w-8" onClick={() => setNewTournament(p => ({...p, imageUrl: ""}))}><X className="w-4 h-4" /></Button>
                    </div>
                  )}
                </div>
                <Textarea placeholder="Règlement complet..." value={newTournament.description} onChange={e => setNewTournament({...newTournament, description: e.target.value})} className="min-h-[120px]" />
              </div>
              <Button onClick={handleAddTournament} className="w-full h-12 uppercase font-bold bg-primary glow-blue">Publier le Tournoi</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournaments?.map((t: any) => (
              <Card key={t.id} className="p-4 flex items-center justify-between border-white/5 bg-card/50">
                <div className="flex items-center gap-4">
                  {t.imageUrl ? <img src={t.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" /> : <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"><Trophy className="w-6 h-6 text-primary" /></div>}
                  <div>
                    <p className="font-bold text-xs uppercase">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{t.gameType} • {t.maxTeams} équipes</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleDelete('tournaments', t.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg uppercase flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary" /> Design du site</CardTitle>
              <CardDescription>Modifiez le fond d'écran principal de la plateforme OneCup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <Label className="uppercase font-bold text-xs tracking-widest text-muted-foreground">Image de Fond (Hero Section)</Label>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" ref={bgInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'background')} />
                    <Button variant="outline" onClick={() => bgInputRef.current?.click()} disabled={isSavingConfig} className="gap-2 h-12 border-primary/30 text-primary uppercase font-bold text-xs px-8">
                      {isSavingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Changer l'image de fond (Max 5Mo)
                    </Button>
                  </div>
                  
                  {siteConfig?.heroImageUrl && (
                    <div className="space-y-4">
                      <p className="text-xs text-muted-foreground">Aperçu du fond actuel :</p>
                      <div className="relative aspect-video w-full max-w-2xl rounded-2xl overflow-hidden border-4 border-primary/10 shadow-2xl">
                        <img src={siteConfig.heroImageUrl} alt="Fond actuel" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <Badge className="bg-primary uppercase font-bold">Image Active</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                <h3 className="font-bold uppercase text-sm">Paramètres Avancés</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Cagnotte Actuelle (FC)</Label>
                    <Input type="number" defaultValue={siteConfig?.currentPrizePool || 1350000} onBlur={(e) => updateDoc(configRef!, { currentPrizePool: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Objectif Cagnotte (FC)</Label>
                    <Input type="number" defaultValue={siteConfig?.targetPrizePool || 5000000} onBlur={(e) => updateDoc(configRef!, { targetPrizePool: Number(e.target.value) })} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Card className="border-primary/20">
              <CardHeader><CardTitle className="text-lg uppercase">Programmation</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select onValueChange={(val) => setNewMatch({...newMatch, tournamentId: val})}>
                    <SelectTrigger><SelectValue placeholder="Choisir le tournoi" /></SelectTrigger>
                    <SelectContent>
                      {tournaments?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Date et Heure" type="datetime-local" value={newMatch.scheduledTime} onChange={e => setNewMatch({...newMatch, scheduledTime: e.target.value})} />
                  <Input placeholder="Équipe 1" value={newMatch.team1Id} onChange={e => setNewMatch({...newMatch, team1Id: e.target.value})} />
                  <Input placeholder="Équipe 2" value={newMatch.team2Id} onChange={e => setNewMatch({...newMatch, team2Id: e.target.value})} />
                </div>
                <Button onClick={handleAddMatch} className="w-full uppercase font-bold bg-primary glow-blue">Valider le Match</Button>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 gap-4">
              {matches?.map((m: any) => (
                <Card key={m.id} className="p-4 flex items-center justify-between border-white/5 bg-card/50 hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="font-bold uppercase text-sm">{m.team1Id} vs {m.team2Id}</div>
                    <div className="text-primary font-headline font-bold text-lg">{m.scoreTeam1} : {m.scoreTeam2}</div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete('matches', m.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="registrations">
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             {registrations?.map((r: any) => (
              <Card key={r.id} className="p-4 border border-white/5 hover:border-primary/20 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold uppercase text-sm">{r.teamName}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Capitaine: {r.captainName}</p>
                      <p className="text-[10px] text-primary font-bold">TÉL: {r.contactPhone}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Tournoi: {r.tournamentName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">{r.status || "En attente"}</Badge>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete('registrations', r.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </Card>
            ))}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

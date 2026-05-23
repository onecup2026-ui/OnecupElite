
"use client";

import { useState, useMemo } from "react";
import { Trophy, Plus, Trash2, ShieldCheck, Loader2, Image as ImageIcon, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { doc, addDoc, deleteDoc, collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { generateTournamentImage } from "@/ai/flows/ai-image-generator";

const ADMIN_EMAIL = "onecup2026@gmail.com";

export default function AdminDashboard() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

  const isAdmin = user?.email === ADMIN_EMAIL;

  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const matchesRef = useMemo(() => (db ? collection(db, "matches") : null), [db]);
  const registrationsRef = useMemo(() => (db ? collection(db, "registrations") : null), [db]);

  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: matches } = useCollection(matchesRef);
  const { data: registrations } = useCollection(registrationsRef);

  const [newTournament, setNewTournament] = useState({
    name: "", gameType: "Football", startDate: "", endDate: "", registrationDeadline: "", entryFee: 0, maxTeams: 16, description: "", imageUrl: ""
  });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [newMatch, setNewMatch] = useState({
    tournamentId: "", team1Id: "", team2Id: "", matchNumber: 1, scheduledTime: "", status: "À Venir", scoreTeam1: 0, scoreTeam2: 0
  });

  const handleGenerateImage = async () => {
    if (!newTournament.name) {
      toast({ variant: "destructive", title: "Nom requis", description: "Donnez un nom au tournoi pour générer l'image." });
      return;
    }
    setIsGeneratingImage(true);
    try {
      const url = await generateTournamentImage({ 
        prompt: newTournament.name, 
        context: newTournament.gameType 
      });
      if (url) {
        setNewTournament(prev => ({ ...prev, imageUrl: url }));
        toast({ title: "Image générée avec succès !" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur IA", description: "Impossible de générer l'image." });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAddTournament = () => {
    if (!db || !isAdmin || !user) return;
    const data = { 
      ...newTournament, 
      organizerId: user.uid,
      createdAt: serverTimestamp() 
    };
    addDoc(collection(db, "tournaments"), data)
      .then(() => {
        toast({ title: "Tournoi publié" });
        setNewTournament({
          name: "", gameType: "Football", startDate: "", endDate: "", registrationDeadline: "", entryFee: 0, maxTeams: 16, description: "", imageUrl: ""
        });
      })
      .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/tournaments', operation: 'create', requestResourceData: data })));
  };

  const handleAddMatch = () => {
    if (!db || !isAdmin || !newMatch.tournamentId) return;
    addDoc(collection(db, "matches"), newMatch)
      .then(() => toast({ title: "Match ajouté" }))
      .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/matches', operation: 'create', requestResourceData: newMatch })));
  };

  const handleDelete = (coll: string, id: string) => {
    if (!db || !isAdmin) return;
    deleteDoc(doc(db, coll, id)).then(() => toast({ title: "Élément supprimé" }));
  };

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!isAdmin) return <div className="p-20 text-center flex flex-col items-center gap-4">
    <ShieldCheck className="w-12 h-12 text-destructive" />
    <h2 className="text-2xl font-bold uppercase">Accès Restreint</h2>
    <p className="text-muted-foreground">Seul l'administrateur ({ADMIN_EMAIL}) peut accéder à cette interface.</p>
  </div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold uppercase tracking-tighter">Administration</h1>
        <Badge className="bg-primary px-4 py-1">Mode Elite</Badge>
      </div>

      <Tabs defaultValue="tournaments" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl mb-6">
          <TabsTrigger value="tournaments" className="uppercase font-bold text-xs">Tournois</TabsTrigger>
          <TabsTrigger value="matches" className="uppercase font-bold text-xs">Matchs</TabsTrigger>
          <TabsTrigger value="registrations" className="uppercase font-bold text-xs">Inscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="tournaments" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader><CardTitle className="text-lg uppercase">Configuration Tournoi</CardTitle></CardHeader>
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
                <Input placeholder="Début" type="date" value={newTournament.startDate} onChange={e => setNewTournament({...newTournament, startDate: e.target.value})} />
                <Input placeholder="Fin" type="date" value={newTournament.endDate} onChange={e => setNewTournament({...newTournament, endDate: e.target.value})} />
                <Input placeholder="Clôture Inscriptions" type="date" value={newTournament.registrationDeadline} onChange={e => setNewTournament({...newTournament, registrationDeadline: e.target.value})} />
                <Input type="number" placeholder="Équipes Max" value={newTournament.maxTeams} onChange={e => setNewTournament({...newTournament, maxTeams: Number(e.target.value)})} />
                <Input type="number" placeholder="Frais (FC)" value={newTournament.entryFee} onChange={e => setNewTournament({...newTournament, entryFee: Number(e.target.value)})} />
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <Input placeholder="URL de l'image" value={newTournament.imageUrl} onChange={e => setNewTournament({...newTournament, imageUrl: e.target.value})} className="flex-1" />
                  <Button 
                    variant="outline" 
                    onClick={handleGenerateImage} 
                    disabled={isGeneratingImage}
                    className="gap-2 shrink-0 border-primary/30 text-primary hover:bg-primary/5 uppercase font-bold text-xs"
                  >
                    {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Générer avec l'IA
                  </Button>
                </div>
                {newTournament.imageUrl && (
                  <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden border">
                    <img src={newTournament.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <Textarea 
                  placeholder="Description et règlement du tournoi..." 
                  value={newTournament.description} 
                  onChange={e => setNewTournament({...newTournament, description: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={handleAddTournament} className="w-full h-12 uppercase font-bold bg-primary glow-blue">Publier le Tournoi</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournaments?.map((t: any) => (
              <Card key={t.id} className="p-4 flex items-center justify-between border-white/5">
                <div className="flex items-center gap-4">
                  {t.imageUrl ? (
                    <img src={t.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-xs uppercase">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{t.gameType} • {t.maxTeams} équipes</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleDelete('tournaments', t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader><CardTitle className="text-lg uppercase">Nouveau Match</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select onValueChange={(val) => setNewMatch({...newMatch, tournamentId: val})}>
                  <SelectTrigger><SelectValue placeholder="Choisir le tournoi" /></SelectTrigger>
                  <SelectContent>
                    {tournaments?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Date et Heure" type="datetime-local" value={newMatch.scheduledTime} onChange={e => setNewMatch({...newMatch, scheduledTime: e.target.value})} />
                <Input placeholder="Équipe 1 (Nom)" value={newMatch.team1Id} onChange={e => setNewMatch({...newMatch, team1Id: e.target.value})} />
                <Input placeholder="Équipe 2 (Nom)" value={newMatch.team2Id} onChange={e => setNewMatch({...newMatch, team2Id: e.target.value})} />
              </div>
              <Button onClick={handleAddMatch} className="w-full uppercase font-bold bg-primary glow-blue">Programmer</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {matches?.map((m: any) => (
              <Card key={m.id} className="p-4 flex items-center justify-between border-white/5">
                <div className="flex items-center gap-6">
                   <div className="font-bold uppercase text-sm">{m.team1Id} vs {m.team2Id}</div>
                   <div className="text-primary font-headline font-bold">{m.scoreTeam1} : {m.scoreTeam2}</div>
                   <Badge variant="outline" className="text-[10px] uppercase">{m.status}</Badge>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleDelete('matches', m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="registrations">
           <Card className="border-primary/20">
            <CardHeader><CardTitle className="text-lg uppercase">Inscriptions Récentes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {registrations?.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                    <div>
                      <p className="font-bold uppercase text-sm">{r.teamName}</p>
                      <p className="text-[10px] text-muted-foreground">Par: {r.captainName} • Tél: {r.contactPhone} • Tournoi: {r.tournamentName}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase">{r.status || "En attente"}</Badge>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete('registrations', r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

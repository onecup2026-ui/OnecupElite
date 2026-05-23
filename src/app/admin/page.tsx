"use client";

import { useState, useMemo } from "react";
import { Trophy, Newspaper, Plus, Trash2, ShieldCheck, Loader2, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase";
import { doc, addDoc, deleteDoc, collection, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const ADMIN_EMAIL = "onecup2026@gmail.com";

export default function AdminDashboard() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

  const isAdmin = user?.email === ADMIN_EMAIL;

  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const matchesRef = useMemo(() => (db ? collection(db, "matches") : null), [db]);
  const registrationsRef = useMemo(() => (db ? query(collection(db, "registrations"), orderBy("createdAt", "desc")) : null), [db]);

  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: matches } = useCollection(matchesRef);
  const { data: registrations } = useCollection(registrationsRef);

  const [newTournament, setNewTournament] = useState({
    name: "", gameType: "Football", startDate: "", endDate: "", registrationDeadline: "", entryFee: 0, maxTeams: 16, imageUrl: "", status: "Inscriptions Ouvertes", description: ""
  });

  const [newMatch, setNewMatch] = useState({
    tournamentId: "", team1Id: "", team2Id: "", matchNumber: 1, scheduledTime: "", status: "À Venir", scoreTeam1: 0, scoreTeam2: 0
  });

  const handleAddTournament = () => {
    if (!db || !isAdmin) return;
    const data = { ...newTournament, createdAt: serverTimestamp() };
    addDoc(collection(db, "tournaments"), data)
      .then(() => {
        toast({ title: "Tournoi publié avec succès" });
        setNewTournament({
          name: "", gameType: "Football", startDate: "", endDate: "", registrationDeadline: "", entryFee: 0, maxTeams: 16, imageUrl: "", status: "Inscriptions Ouvertes", description: ""
        });
      })
      .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/tournaments', operation: 'create' })));
  };

  const handleAddMatch = () => {
    if (!db || !isAdmin || !newMatch.tournamentId) return;
    addDoc(collection(db, "matches"), newMatch)
      .then(() => toast({ title: "Match ajouté au calendrier" }))
      .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/matches', operation: 'create' })));
  };

  const handleDelete = (coll: string, id: string) => {
    if (!db || !isAdmin) return;
    deleteDoc(doc(db, coll, id)).then(() => toast({ title: "Élément supprimé" }));
  };

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!isAdmin) return <div className="p-20 text-center flex flex-col items-center gap-4">
    <ShieldCheck className="w-12 h-12 text-destructive" />
    <h2 className="text-2xl font-bold">Accès Restreint</h2>
    <p>Seul l'administrateur ({ADMIN_EMAIL}) peut accéder à cette page.</p>
  </div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold uppercase tracking-tighter">Administration OneCup</h1>
        <Badge className="bg-primary px-4 py-1">Mode Admin Actif</Badge>
      </div>

      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl mb-6">
          <TabsTrigger value="matches" className="uppercase font-bold text-xs">Matchs</TabsTrigger>
          <TabsTrigger value="tournaments" className="uppercase font-bold text-xs">Tournois</TabsTrigger>
          <TabsTrigger value="registrations" className="uppercase font-bold text-xs">Inscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-6">
          <Card>
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
                <Input placeholder="ID Équipe 1" value={newMatch.team1Id} onChange={e => setNewMatch({...newMatch, team1Id: e.target.value})} />
                <Input placeholder="ID Équipe 2" value={newMatch.team2Id} onChange={e => setNewMatch({...newMatch, team2Id: e.target.value})} />
              </div>
              <Button onClick={handleAddMatch} className="w-full uppercase font-bold">Programmer le match</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {matches?.map((m: any) => (
              <Card key={m.id} className="p-4 flex items-center justify-between border-white/5">
                <div className="flex items-center gap-4">
                   <div className="font-bold">{m.team1Id} vs {m.team2Id}</div>
                   <div className="text-primary font-headline">{m.scoreTeam1} : {m.scoreTeam2}</div>
                   <Badge variant="outline" className="text-[10px]">{m.status}</Badge>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleDelete('matches', m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg uppercase">Configuration Tournoi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input placeholder="Nom du tournoi" value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} />
                <Select onValueChange={(val) => setNewTournament({...newTournament, gameType: val})}>
                  <SelectTrigger><SelectValue placeholder="Type de sport" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Football">Football</SelectItem>
                    <SelectItem value="Esport">Esport</SelectItem>
                    <SelectItem value="Basketball">Basketball</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Date début" type="date" value={newTournament.startDate} onChange={e => setNewTournament({...newTournament, startDate: e.target.value})} />
                <Input placeholder="Date fin" type="date" value={newTournament.endDate} onChange={e => setNewTournament({...newTournament, endDate: e.target.value})} />
                <Input placeholder="Deadline Inscription" type="date" value={newTournament.registrationDeadline} onChange={e => setNewTournament({...newTournament, registrationDeadline: e.target.value})} />
                <Input type="number" placeholder="Max Équipes" value={newTournament.maxTeams} onChange={e => setNewTournament({...newTournament, maxTeams: Number(e.target.value)})} />
                <Input type="number" placeholder="Frais d'entrée (FC)" value={newTournament.entryFee} onChange={e => setNewTournament({...newTournament, entryFee: Number(e.target.value)})} />
                <Input placeholder="URL Image" value={newTournament.imageUrl} onChange={e => setNewTournament({...newTournament, imageUrl: e.target.value})} />
              </div>
              <Button onClick={handleAddTournament} className="w-full h-12 uppercase font-bold">Publier le tournoi</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournaments?.map((t: any) => (
              <Card key={t.id} className="p-4 flex items-center justify-between border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.gameType} • {t.maxTeams} équipes</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleDelete('tournaments', t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="registrations">
           <Card>
            <CardHeader><CardTitle className="text-lg uppercase">Inscriptions Récentes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {registrations?.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div>
                      <p className="font-bold">{r.teamName}</p>
                      <p className="text-xs text-muted-foreground">Tournoi ID: {r.tournamentId}</p>
                    </div>
                    <Badge variant="secondary">{r.status}</Badge>
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
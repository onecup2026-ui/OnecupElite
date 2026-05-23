
"use client";

import { useState, useMemo } from "react";
import { Trophy, Newspaper, Settings, Plus, Save, Trash2, Image as ImageIcon, ListPlus, Ticket as TicketIcon, Upload, Sparkles, Loader2, DollarSign, Heart, Video, Users, Lock, Zap, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDoc, useCollection, useFirestore, useUser, useAuth } from "@/firebase";
import { doc, setDoc, addDoc, deleteDoc, collection, query, orderBy, updateDoc, increment } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { generateTournamentImage } from "@/ai/flows/ai-image-generator";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const ADMIN_EMAIL = "onecup2026@gmail.com";

export default function AdminDashboard() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

  const isAdmin = user?.email === ADMIN_EMAIL;

  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const matchesRef = useMemo(() => (db ? collection(db, "matches") : null), [db]);
  const articlesRef = useMemo(() => (db ? collection(db, "articles") : null), [db]);
  const registrationsRef = useMemo(() => (db ? query(collection(db, "registrations"), orderBy("createdAt", "desc")) : null), [db]);

  const { data: siteConfig } = useDoc(configRef);
  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: matches } = useCollection(matchesRef);
  const { data: articles } = useCollection(articlesRef);
  const { data: registrations } = useCollection(registrationsRef);

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const [newTournament, setNewTournament] = useState({
    name: "", sport: "Football", date: "", startDate: "", endDate: "", registrationDeadline: "", location: "", prize: "", entryFee: 0, imageUrl: "", status: "Inscriptions Ouvertes", teamsMax: 16, teamsRegistered: 0, description: "", rules: ""
  });

  const [newMatch, setNewMatch] = useState({
    tournamentId: "", tournamentName: "", team1: "", team2: "", scheduledTime: "", status: "À Venir", scoreTeam1: 0, scoreTeam2: 0, winner: ""
  });

  const handleAiGeneration = async (prompt: string, context: string, setter: (url: string) => void, id: string) => {
    setIsGenerating(id);
    try {
      const url = await generateTournamentImage({ prompt, context });
      if (url) setter(url);
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur IA" });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleAddTournament = () => {
    if (!db || !isAdmin) return;
    addDoc(collection(db, "tournaments"), newTournament)
      .then(() => toast({ title: "Tournoi ajouté" }))
      .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/tournaments', operation: 'create' })));
  };

  const handleAddMatch = () => {
    if (!db || !isAdmin || !newMatch.tournamentId) return;
    const tourn = tournaments?.find(t => t.id === newMatch.tournamentId);
    const data = { ...newMatch, tournamentName: tourn?.name || "" };
    addDoc(collection(db, "matches"), data)
      .then(() => toast({ title: "Match programmé" }))
      .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/matches', operation: 'create' })));
  };

  const handleDelete = (coll: string, id: string) => {
    if (!db || !isAdmin) return;
    deleteDoc(doc(db, coll, id)).then(() => toast({ title: "Supprimé" }));
  };

  if (!isAdmin) return <div className="p-20 text-center">Accès Restreint</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-headline font-bold uppercase tracking-tighter">ADMINISTRATION ONECUP</h1>

      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl mb-6">
          <TabsTrigger value="matches">Matchs</TabsTrigger>
          <TabsTrigger value="tournaments">Tournois</TabsTrigger>
          <TabsTrigger value="registrations">Inscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg uppercase">Programmer un Match</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select onValueChange={(val) => setNewMatch({...newMatch, tournamentId: val})}>
                  <SelectTrigger><SelectValue placeholder="Choisir le tournoi" /></SelectTrigger>
                  <SelectContent>
                    {tournaments?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Date et Heure" value={newMatch.scheduledTime} onChange={e => setNewMatch({...newMatch, scheduledTime: e.target.value})} />
                <Input placeholder="Équipe 1" value={newMatch.team1} onChange={e => setNewMatch({...newMatch, team1: e.target.value})} />
                <Input placeholder="Équipe 2" value={newMatch.team2} onChange={e => setNewMatch({...newMatch, team2: e.target.value})} />
              </div>
              <Button onClick={handleAddMatch} className="w-full uppercase font-bold">Ajouter le Match</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {matches?.map((m: any) => (
              <Card key={m.id} className="p-4 flex items-center justify-between border-white/5">
                <div className="flex items-center gap-6">
                   <Badge variant="outline">{m.tournamentName}</Badge>
                   <div className="font-bold">{m.team1} vs {m.team2}</div>
                   <div className="text-primary font-headline">{m.scoreTeam1} : {m.scoreTeam2}</div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleDelete('matches', m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg uppercase">Nouveau Tournoi Elite</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="Nom" value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} />
                <Input placeholder="Date de début" value={newTournament.startDate} onChange={e => setNewTournament({...newTournament, startDate: e.target.value})} />
                <Input placeholder="Date de fin" value={newTournament.endDate} onChange={e => setNewTournament({...newTournament, endDate: e.target.value})} />
                <Input placeholder="Deadline Inscription" value={newTournament.registrationDeadline} onChange={e => setNewTournament({...newTournament, registrationDeadline: e.target.value})} />
                <Input type="number" placeholder="Frais d'entrée (FC)" onChange={e => setNewTournament({...newTournament, entryFee: Number(e.target.value)})} />
                <Input placeholder="Cashprize" value={newTournament.prize} onChange={e => setNewTournament({...newTournament, prize: e.target.value})} />
              </div>
              <Button onClick={handleAddTournament} className="w-full h-12 uppercase font-bold">Publier le Tournoi</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Trophy, Plus, Trash2, ShieldCheck, Loader2, Upload, 
  Settings, Save, Edit2, ImageIcon, Palette, 
  Layout, Users, Image as ImageLucide, Clock, RotateCcw,
  CheckCircle2, AlertCircle, Check, X, Swords, ListChecks
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCollection, useFirestore, useUser, useDoc, useStorage, useAuth } from "@/firebase";
import { 
  doc, addDoc, deleteDoc, collection, serverTimestamp, 
  setDoc, updateDoc, query, where, orderBy, getDocs, writeBatch
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "firebase/auth";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const ADMIN_EMAIL = "onecup2026@gmail.com";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AdminDashboard() {
  const db = useFirestore();
  const storage = useStorage();
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  
  const logoUploadRef = useRef<HTMLInputElement>(null);
  const carouselUploadRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const afterCupUploadRef = useRef<HTMLInputElement>(null);
  const tournamentUploadRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const registrationsRef = useMemo(() => (db ? collection(db, "registrations") : null), [db]);
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);

  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: registrations } = useCollection(registrationsRef);
  const { data: siteConfig } = useDoc(configRef);

  const [isUploading, setIsUploading] = useState(false);
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);

  const [configForm, setConfigForm] = useState({
    logoUrl: "", primaryColor: "211 100% 32%", secondaryColor: "224 71% 4%",
    accentColor: "211 100% 45%", borderRadius: "0.5", heroTitle: "", 
    carouselImages: ["", "", "", ""], afterCupImageUrl: "", 
    afterCupDescription: "Célébrez la victoire, assistez au sacre des champions.",
    targetDate: "2026-07-15T00:00:00"
  });

  const [tournamentForm, setTournamentForm] = useState({
    name: "", gameType: "Football", startDate: "", locationStade: "", 
    maxTeams: 16, entryFee: 0, description: "", imageUrl: "", teamsRegistered: 0
  });

  useEffect(() => {
    if (siteConfig) {
      setConfigForm({ 
        ...configForm,
        ...siteConfig,
        carouselImages: Array.isArray(siteConfig.carouselImages) ? siteConfig.carouselImages : ["", "", "", ""]
      });
    }
  }, [siteConfig]);

  const handleStorageUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;
    if (file.size > MAX_FILE_SIZE) {
      toast({ variant: "destructive", title: "Fichier trop volumineux" });
      return;
    }
    setIsUploading(true);
    try {
      const fileName = `${path}_${Date.now()}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `${path}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      callback(url);
      toast({ title: "Fichier sauvegardé" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur de téléversement" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateRegistration = async (regId: string, status: string) => {
    if (!db) return;
    await updateDoc(doc(db, "registrations", regId), { status });
    toast({ title: `Inscription ${status.toLowerCase()}` });
  };

  const generateBracket = async (tournamentId: string) => {
    if (!db) return;
    const tRef = doc(db, "tournaments", tournamentId);
    
    // 1. Récupérer les inscriptions validées
    const q = query(collection(db, "registrations"), where("tournamentId", "==", tournamentId), where("status", "==", "Validé"));
    const snap = await getDocs(q);
    const teams = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (teams.length < 2) {
      toast({ variant: "destructive", title: "Pas assez d'équipes validées" });
      return;
    }

    const batch = writeBatch(db);
    
    // 2. Créer les matchs du Round 1 (Huitièmes pour 16, Quarts pour 8, etc.)
    // Pour simplifier, on génère un arbre à partir du nombre d'équipes actuel
    const numTeams = teams.length;
    const numMatches = Math.floor(numTeams / 2);
    
    for (let i = 0; i < numMatches; i++) {
      const matchRef = doc(collection(db, "matches"));
      batch.set(matchRef, {
        tournamentId,
        matchNumber: i + 1,
        round: 1, // Round 1
        team1Id: (teams[i*2] as any).teamName,
        team2Id: (teams[i*2 + 1] as any).teamName,
        scoreTeam1: 0,
        scoreTeam2: 0,
        status: "Programmé",
        createdAt: serverTimestamp()
      });
    }

    await batch.commit();
    toast({ title: "Tableau de tournoi généré !" });
  };

  const updateMatchScore = async (matchId: string, s1: number, s2: number, status: string) => {
    if (!db) return;
    const matchRef = doc(db, "matches", matchId);
    const winnerId = s1 > s2 ? (await (await getDocs(query(collection(db, "matches"), where("__name__", "==", matchId)))).docs[0].data()).team1Id : s2 > s1 ? (await (await getDocs(query(collection(db, "matches"), where("__name__", "==", matchId)))).docs[0].data()).team2Id : null;

    await updateDoc(matchRef, { 
      scoreTeam1: s1, 
      scoreTeam2: s2, 
      status,
      winnerId: status === "Terminé" ? winnerId : null
    });

    toast({ title: "Score mis à jour" });
  };

  const matchesQuery = useMemo(() => {
    if (!db || !activeTournamentId) return null;
    return query(collection(db, "matches"), where("tournamentId", "==", activeTournamentId), orderBy("matchNumber", "asc"));
  }, [db, activeTournamentId]);
  const { data: matches } = useCollection(matchesQuery);

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
  if (!isAdmin) return <div className="p-20 text-center font-black py-40">ACCÈS RÉSERVÉ À L'ADMINISTRATEUR</div>;

  return (
    <div className="bg-[#f3f3f3] min-h-screen pb-20">
      <header className="bg-primary text-white py-16 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter">Console Elite</h1>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Gestion dynamique en temps réel</p>
          </div>
          <Button variant="outline" onClick={() => auth && signOut(auth)} className="text-white border-white/20 uppercase font-black text-[10px] h-12 px-8">Déconnexion</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 -mt-10">
        <Tabs defaultValue="theme">
          <TabsList className="bg-white p-2 rounded-2xl mb-12 shadow-xl border overflow-x-auto h-auto flex flex-nowrap w-fit">
            <TabsTrigger value="theme" className="px-6 py-3 font-black uppercase text-[10px] gap-2"><Palette className="w-3 h-3" /> Thème</TabsTrigger>
            <TabsTrigger value="design" className="px-6 py-3 font-black uppercase text-[10px] gap-2"><Layout className="w-3 h-3" /> Design</TabsTrigger>
            <TabsTrigger value="tournaments" className="px-6 py-3 font-black uppercase text-[10px] gap-2"><Trophy className="w-3 h-3" /> Tournois</TabsTrigger>
            <TabsTrigger value="registrations" className="px-6 py-3 font-black uppercase text-[10px] gap-2"><ListChecks className="w-3 h-3" /> Inscriptions</TabsTrigger>
            <TabsTrigger value="matches" className="px-6 py-3 font-black uppercase text-[10px] gap-2"><Swords className="w-3 h-3" /> Matchs & Scores</TabsTrigger>
          </TabsList>

          <TabsContent value="theme">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <h3 className="text-xl font-headline font-black uppercase tracking-tight">Identité Visuelle</h3>
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Logo Principal</Label>
                    <div className="relative h-32 w-full rounded-2xl border-2 border-dashed flex items-center justify-center bg-slate-50 cursor-pointer" onClick={() => logoUploadRef.current?.click()}>
                      {configForm.logoUrl ? <img src={configForm.logoUrl} className="max-h-20" /> : <Upload className="text-slate-200" />}
                    </div>
                    <input type="file" ref={logoUploadRef} className="hidden" onChange={(e) => handleStorageUpload(e, 'branding', (url) => setConfigForm({...configForm, logoUrl: url}))} />
                  </div>
                </div>
                <div className="space-y-8">
                  <h3 className="text-xl font-headline font-black uppercase tracking-tight">Couleurs (HSL)</h3>
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-black tracking-widest">Couleur Primaire</Label>
                    <Input value={configForm.primaryColor} onChange={e => setConfigForm({...configForm, primaryColor: e.target.value})} className="rounded-xl" />
                  </div>
                </div>
              </div>
              <Button onClick={() => db && setDoc(doc(db, "settings", "config"), configForm, { merge: true }).then(() => toast({ title: "Thème sauvegardé" }))} className="w-full h-16 rounded-2xl font-black uppercase bg-primary">Enregistrer les réglages</Button>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-8">
              <h3 className="text-xl font-headline font-black uppercase tracking-tight">Ajouter un Tournoi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="font-black uppercase text-[10px]">Affiche du tournoi</Label>
                  <div className="relative aspect-video rounded-3xl border-2 border-dashed flex items-center justify-center bg-slate-50 cursor-pointer" onClick={() => tournamentUploadRef.current?.click()}>
                    {tournamentForm.imageUrl ? <img src={tournamentForm.imageUrl} className="w-full h-full object-cover rounded-3xl" /> : <ImageIcon className="text-slate-200" />}
                  </div>
                  <input type="file" ref={tournamentUploadRef} className="hidden" onChange={(e) => handleStorageUpload(e, 'tournaments', (url) => setTournamentForm({...tournamentForm, imageUrl: url}))} />
                </div>
                <div className="space-y-4">
                  <Input placeholder="Nom du tournoi" value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} className="rounded-xl" />
                  <Input placeholder="Lieu" value={tournamentForm.locationStade} onChange={e => setTournamentForm({...tournamentForm, locationStade: e.target.value})} className="rounded-xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="date" value={tournamentForm.startDate} onChange={e => setTournamentForm({...tournamentForm, startDate: e.target.value})} className="rounded-xl" />
                    <Input type="number" placeholder="Max Equipes" value={tournamentForm.maxTeams} onChange={e => setTournamentForm({...tournamentForm, maxTeams: parseInt(e.target.value)})} className="rounded-xl" />
                  </div>
                </div>
              </div>
              <Button onClick={() => db && addDoc(collection(db, "tournaments"), {...tournamentForm, createdAt: serverTimestamp()}).then(() => toast({ title: "Tournoi ajouté" }))} className="w-full h-16 rounded-2xl font-black uppercase bg-primary">Publier le tournoi</Button>
            </Card>
          </TabsContent>

          <TabsContent value="registrations">
            <div className="space-y-6">
              {registrations?.map((reg: any) => (
                <Card key={reg.id} className="rounded-3xl p-6 bg-white shadow-sm border-none flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-1">
                    <Badge variant="outline" className="uppercase font-black text-[8px] tracking-widest">{reg.status}</Badge>
                    <h4 className="font-black uppercase text-lg">{reg.teamName}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tournoi: {reg.tournamentName} | Cap: {reg.captainName}</p>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => handleUpdateRegistration(reg.id, "Validé")} className="bg-green-500 hover:bg-green-600 rounded-xl h-12 px-6"><Check className="w-4 h-4 mr-2" /> Valider</Button>
                    <Button onClick={() => handleUpdateRegistration(reg.id, "Refusé")} variant="outline" className="text-red-500 border-red-500 hover:bg-red-50 rounded-xl h-12 px-6"><X className="w-4 h-4 mr-2" /> Refuser</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matches">
            <div className="space-y-8">
              <div className="flex gap-4 overflow-x-auto pb-4">
                {tournaments?.map((t: any) => (
                  <Button 
                    key={t.id} 
                    variant={activeTournamentId === t.id ? "default" : "outline"}
                    onClick={() => setActiveTournamentId(t.id)}
                    className="rounded-xl uppercase font-black text-[10px] shrink-0"
                  >
                    {t.name}
                  </Button>
                ))}
              </div>

              {activeTournamentId && (
                <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-headline font-black uppercase tracking-tight">Gestion des Matchs</h3>
                    <Button onClick={() => generateBracket(activeTournamentId)} className="bg-secondary rounded-xl uppercase font-black text-[10px]">Générer le Bracket</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {matches?.map((m: any) => (
                      <div key={m.id} className="p-6 border rounded-[2rem] space-y-4 bg-slate-50/50">
                        <div className="flex justify-between items-center">
                          <Badge className="uppercase text-[8px]">Match #{m.matchNumber}</Badge>
                          <select 
                            className="text-[10px] font-black uppercase bg-transparent outline-none"
                            value={m.status}
                            onChange={(e) => updateMatchScore(m.id, m.scoreTeam1, m.scoreTeam2, e.target.value)}
                          >
                            <option value="Programmé">Programmé</option>
                            <option value="En Cours">En Cours</option>
                            <option value="Terminé">Terminé</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 text-center space-y-2">
                            <p className="font-black uppercase text-xs truncate">{m.team1Id}</p>
                            <Input 
                              type="number" 
                              className="w-16 h-12 mx-auto text-center font-black text-xl rounded-xl" 
                              value={m.scoreTeam1}
                              onChange={(e) => updateMatchScore(m.id, parseInt(e.target.value), m.scoreTeam2, m.status)}
                            />
                          </div>
                          <span className="font-black text-slate-300">VS</span>
                          <div className="flex-1 text-center space-y-2">
                            <p className="font-black uppercase text-xs truncate">{m.team2Id}</p>
                            <Input 
                              type="number" 
                              className="w-16 h-12 mx-auto text-center font-black text-xl rounded-xl" 
                              value={m.scoreTeam2}
                              onChange={(e) => updateMatchScore(m.id, m.scoreTeam1, parseInt(e.target.value), m.status)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

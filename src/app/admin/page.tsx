
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Trophy, Plus, Trash2, ShieldCheck, Loader2, Upload, 
  Settings, Save, Edit2, ImageIcon, Palette, 
  Layout, Users, Image as ImageLucide, Clock, RotateCcw,
  CheckCircle2, AlertCircle, Check, X, Swords, ListChecks, Calendar
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
    const q = query(collection(db, "registrations"), where("tournamentId", "==", tournamentId), where("status", "==", "Validé"));
    const snap = await getDocs(q);
    const teams = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (teams.length < 2) {
      toast({ variant: "destructive", title: "Pas assez d'équipes validées" });
      return;
    }

    const batch = writeBatch(db);
    const numTeams = teams.length;
    const numMatches = Math.floor(numTeams / 2);
    
    for (let i = 0; i < numMatches; i++) {
      const matchRef = doc(collection(db, "matches"));
      batch.set(matchRef, {
        tournamentId,
        matchNumber: i + 1,
        round: 1,
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
    const matchSnap = await getDocs(query(collection(db, "matches"), where("__name__", "==", matchId)));
    const matchData = matchSnap.docs[0].data();
    
    const winnerId = s1 > s2 ? matchData.team1Id : s2 > s1 ? matchData.team2Id : null;

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

  const saveConfig = async () => {
    if (!db) return;
    await setDoc(doc(db, "settings", "config"), configForm, { merge: true });
    toast({ title: "Configuration sauvegardée avec succès" });
  };

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
  if (!isAdmin) return <div className="p-20 text-center font-black py-40 uppercase tracking-widest">Accès Réservé à l'Administrateur</div>;

  return (
    <div className="bg-[#f8f8f8] min-h-screen pb-20">
      <header className="bg-primary text-white py-12 md:py-20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">Console <span className="text-white/40">Elite.</span></h1>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Tableau de Bord de Gestion Intégrale</p>
          </div>
          <Button variant="outline" onClick={() => auth && signOut(auth)} className="text-white border-white/20 uppercase font-black text-[10px] h-12 px-10 rounded-full hover:bg-white/10">Déconnexion</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 -mt-8 md:-mt-12">
        <Tabs defaultValue="theme" className="w-full">
          {/* TabsList Scrollable */}
          <div className="bg-white p-2 rounded-full shadow-2xl border mb-12 overflow-x-auto scrollbar-hide flex">
            <TabsList className="bg-transparent h-auto flex gap-2 shrink-0 w-max">
              <TabsTrigger value="theme" className="px-8 py-4 font-black uppercase text-[10px] gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"><Palette className="w-3 h-3" /> Thème</TabsTrigger>
              <TabsTrigger value="design" className="px-8 py-4 font-black uppercase text-[10px] gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"><Layout className="w-3 h-3" /> Design & Chrono</TabsTrigger>
              <TabsTrigger value="tournaments" className="px-8 py-4 font-black uppercase text-[10px] gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"><Trophy className="w-3 h-3" /> Tournois</TabsTrigger>
              <TabsTrigger value="registrations" className="px-8 py-4 font-black uppercase text-[10px] gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"><ListChecks className="w-3 h-3" /> Inscriptions</TabsTrigger>
              <TabsTrigger value="matches" className="px-8 py-4 font-black uppercase text-[10px] gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"><Swords className="w-3 h-3" /> Matchs & Scores</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="theme" className="animate-in fade-in zoom-in-95 duration-500">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-8">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Identité Visuelle</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Logo et Image de Marque</p>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Logo Principal (PNG/SVG)</Label>
                    <div className="relative h-40 w-full rounded-[2rem] border-2 border-dashed flex items-center justify-center bg-slate-50 cursor-pointer overflow-hidden group" onClick={() => logoUploadRef.current?.click()}>
                      {configForm.logoUrl ? (
                        <img src={configForm.logoUrl} className="max-h-24 transition-transform group-hover:scale-110" />
                      ) : (
                        <Upload className="text-slate-200 w-10 h-10" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] font-black uppercase text-slate-500">Changer le logo</span>
                      </div>
                    </div>
                    <input type="file" ref={logoUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'branding', (url) => setConfigForm({...configForm, logoUrl: url}))} />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Couleurs & Rayon</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Personnalisation du thème HSL</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label className="text-[10px] uppercase font-black tracking-widest">Primaire (HSL)</Label>
                      <Input value={configForm.primaryColor} onChange={e => setConfigForm({...configForm, primaryColor: e.target.value})} className="rounded-xl h-12" placeholder="Ex: 211 100% 32%" />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] uppercase font-black tracking-widest">Secondaire (HSL)</Label>
                      <Input value={configForm.secondaryColor} onChange={e => setConfigForm({...configForm, secondaryColor: e.target.value})} className="rounded-xl h-12" placeholder="Ex: 224 71% 4%" />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] uppercase font-black tracking-widest">Bordure (REM)</Label>
                      <Input type="number" step="0.1" value={configForm.borderRadius} onChange={e => setConfigForm({...configForm, borderRadius: e.target.value})} className="rounded-xl h-12" />
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={saveConfig} className="w-full h-16 rounded-2xl font-black uppercase bg-primary glow-blue">Mettre à jour le thème</Button>
            </Card>
          </TabsContent>

          <TabsContent value="design" className="animate-in fade-in zoom-in-95 duration-500">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Carrousel Accueil</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">4 Images de Statut (Stories)</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {configForm.carouselImages.map((img, idx) => (
                      <div key={idx} className="space-y-2">
                        <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Slide {idx + 1}</Label>
                        <div 
                          className="relative aspect-[3/4] rounded-2xl border-2 border-dashed bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden group"
                          onClick={() => carouselUploadRefs[idx].current?.click()}
                        >
                          {img ? (
                            <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          ) : (
                            <Upload className="text-slate-200 w-6 h-6" />
                          )}
                        </div>
                        <input 
                          type="file" 
                          ref={carouselUploadRefs[idx]} 
                          className="hidden" 
                          onChange={(e) => handleStorageUpload(e, 'carousel', (url) => {
                            const newImages = [...configForm.carouselImages];
                            newImages[idx] = url;
                            setConfigForm({...configForm, carouselImages: newImages});
                          })} 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Chrono Event</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Date de lancement OneCup</p>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3" /> Date Cible</Label>
                      <Input 
                        type="datetime-local" 
                        value={configForm.targetDate} 
                        onChange={e => setConfigForm({...configForm, targetDate: e.target.value})} 
                        className="rounded-xl h-12 bg-white"
                      />
                    </div>
                    <div className="p-4 bg-primary/10 rounded-xl">
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-relaxed">
                        Le chrono s'affichera sur la page d'accueil et le ticker.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-headline font-black uppercase tracking-tight">After Cup & News</h3>
                  <div className="space-y-4">
                     <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Image After Cup (Festival)</Label>
                     <div className="relative aspect-video rounded-3xl border-2 border-dashed bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden group" onClick={() => afterCupUploadRef.current?.click()}>
                        {configForm.afterCupImageUrl ? <img src={configForm.afterCupImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <Upload className="text-slate-200 w-8 h-8" />}
                     </div>
                     <input type="file" ref={afterCupUploadRef} className="hidden" onChange={(e) => handleStorageUpload(e, 'aftercup', (url) => setConfigForm({...configForm, afterCupImageUrl: url}))} />
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-headline font-black uppercase tracking-tight">Textes Hero</h3>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Titre Hero Principal</Label>
                    <Input value={configForm.heroTitle} onChange={e => setConfigForm({...configForm, heroTitle: e.target.value})} className="rounded-xl h-12" placeholder="La Plus Grande Coupe du Monde..." />
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description After Cup</Label>
                    <Textarea value={configForm.afterCupDescription} onChange={e => setConfigForm({...configForm, afterCupDescription: e.target.value})} className="rounded-xl min-h-[100px]" />
                  </div>
                </div>
              </div>
              <Button onClick={saveConfig} className="w-full h-16 rounded-2xl font-black uppercase bg-primary glow-blue">Enregistrer le Design</Button>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments" className="animate-in fade-in zoom-in-95 duration-500">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Publier un Tournoi</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Ajoutez une nouvelle compétition à la plateforme</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <Label className="font-black uppercase text-[10px] text-slate-400 tracking-widest">Affiche Promotionnelle</Label>
                  <div className="relative aspect-[4/3] rounded-[2.5rem] border-2 border-dashed flex items-center justify-center bg-slate-50 cursor-pointer overflow-hidden group" onClick={() => tournamentUploadRef.current?.click()}>
                    {tournamentForm.imageUrl ? <img src={tournamentForm.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" /> : <Upload className="text-slate-200 w-12 h-12" />}
                  </div>
                  <input type="file" ref={tournamentUploadRef} className="hidden" onChange={(e) => handleStorageUpload(e, 'tournaments', (url) => setTournamentForm({...tournamentForm, imageUrl: url}))} />
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Input placeholder="Nom du tournoi" value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} className="rounded-xl h-14 font-bold" />
                    <div className="grid grid-cols-2 gap-4">
                      <select className="rounded-xl h-14 bg-white border px-4 font-bold outline-none" value={tournamentForm.gameType} onChange={e => setTournamentForm({...tournamentForm, gameType: e.target.value})}>
                        <option value="Football">Football</option>
                        <option value="PlayStation">PlayStation / e-Sport</option>
                      </select>
                      <Input placeholder="Stade / Arena" value={tournamentForm.locationStade} onChange={e => setTournamentForm({...tournamentForm, locationStade: e.target.value})} className="rounded-xl h-14" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="date" value={tournamentForm.startDate} onChange={e => setTournamentForm({...tournamentForm, startDate: e.target.value})} className="rounded-xl h-14" />
                      <Input type="number" placeholder="Équipes Max" value={tournamentForm.maxTeams} onChange={e => setTournamentForm({...tournamentForm, maxTeams: parseInt(e.target.value)})} className="rounded-xl h-14" />
                    </div>
                    <Textarea placeholder="Description Elite..." value={tournamentForm.description} onChange={e => setTournamentForm({...tournamentForm, description: e.target.value})} className="rounded-2xl min-h-[120px]" />
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => db && addDoc(collection(db, "tournaments"), {...tournamentForm, createdAt: serverTimestamp()}).then(() => {
                  toast({ title: "Tournoi ajouté avec succès !" });
                  setTournamentForm({ name: "", gameType: "Football", startDate: "", locationStade: "", maxTeams: 16, entryFee: 0, description: "", imageUrl: "", teamsRegistered: 0 });
                })} 
                className="w-full h-16 rounded-2xl font-black uppercase bg-primary glow-blue"
              >
                Lancer la compétition
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="registrations" className="animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations?.map((reg: any) => (
                <Card key={reg.id} className="rounded-3xl p-8 bg-white shadow-xl border-none flex flex-col justify-between gap-8 group">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className={cn("uppercase font-black text-[7px] tracking-widest px-3 py-1", 
                        reg.status === "Validé" ? "bg-green-50 text-green-500 border-green-200" : 
                        reg.status === "Refusé" ? "bg-red-50 text-red-500 border-red-200" : 
                        "bg-slate-50 text-slate-500 border-slate-200"
                      )}>{reg.status}</Badge>
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Reg ID: {reg.id.slice(-4)}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black uppercase text-xl text-slate-900 group-hover:text-primary transition-colors">{reg.teamName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reg.tournamentName}</p>
                    </div>
                    <Separator className="bg-slate-50" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-300 uppercase">Capitaine</p>
                        <p className="text-[10px] font-bold truncate">{reg.captainName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-300 uppercase">WhatsApp</p>
                        <p className="text-[10px] font-bold truncate">{reg.contactPhone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdateRegistration(reg.id, "Validé")} className="flex-1 bg-green-500 hover:bg-green-600 rounded-xl h-12 font-black uppercase text-[9px]"><Check className="w-3 h-3 mr-1" /> Valider</Button>
                    <Button onClick={() => handleUpdateRegistration(reg.id, "Refusé")} variant="outline" className="flex-1 text-red-500 border-red-500 hover:bg-red-50 rounded-xl h-12 font-black uppercase text-[9px]"><X className="w-3 h-3 mr-1" /> Refuser</Button>
                  </div>
                </Card>
              ))}
              {registrations?.length === 0 && (
                <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed space-y-4">
                  <ListChecks className="w-16 h-16 text-slate-100 mx-auto" />
                  <p className="text-slate-300 font-black uppercase tracking-widest text-xs">Aucune inscription à traiter</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="matches" className="animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-8">
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {tournaments?.map((t: any) => (
                  <Button 
                    key={t.id} 
                    variant={activeTournamentId === t.id ? "default" : "outline"}
                    onClick={() => setActiveTournamentId(t.id)}
                    className="rounded-full uppercase font-black text-[10px] shrink-0 h-12 px-8"
                  >
                    {t.name}
                  </Button>
                ))}
              </div>

              {activeTournamentId && (
                <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-12">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Tableau & Scores</h3>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Pilotage en temps réel des rencontres</p>
                    </div>
                    <Button onClick={() => generateBracket(activeTournamentId)} className="bg-secondary rounded-2xl uppercase font-black text-[10px] h-14 px-10 shadow-lg group">
                      <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" /> Générer / Reset Bracket
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {matches?.map((m: any) => (
                      <div key={m.id} className="p-8 border rounded-[2.5rem] space-y-6 bg-slate-50/50 hover:bg-white transition-colors hover:shadow-lg">
                        <div className="flex justify-between items-center">
                          <Badge className="bg-primary/10 text-primary border-none uppercase text-[8px] font-black tracking-widest px-4 py-1.5 rounded-lg">Match #{m.matchNumber}</Badge>
                          <select 
                            className="text-[9px] font-black uppercase bg-transparent outline-none cursor-pointer border-b border-primary/20 pb-1"
                            value={m.status}
                            onChange={(e) => updateMatchScore(m.id, m.scoreTeam1, m.scoreTeam2, e.target.value)}
                          >
                            <option value="Programmé">Programmé</option>
                            <option value="En Cours">En Cours</option>
                            <option value="Terminé">Terminé</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between gap-8">
                          <div className="flex-1 text-center space-y-4">
                            <p className="font-black uppercase text-[10px] tracking-tight text-slate-600 truncate">{m.team1Id}</p>
                            <Input 
                              type="number" 
                              className="w-20 h-16 mx-auto text-center font-black text-3xl rounded-2xl bg-white shadow-inner border-none" 
                              value={m.scoreTeam1}
                              onChange={(e) => updateMatchScore(m.id, parseInt(e.target.value), m.scoreTeam2, m.status)}
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="font-black text-slate-200 text-2xl">VS</span>
                          </div>
                          <div className="flex-1 text-center space-y-4">
                            <p className="font-black uppercase text-[10px] tracking-tight text-slate-600 truncate">{m.team2Id}</p>
                            <Input 
                              type="number" 
                              className="w-20 h-16 mx-auto text-center font-black text-3xl rounded-2xl bg-white shadow-inner border-none" 
                              value={m.scoreTeam2}
                              onChange={(e) => updateMatchScore(m.id, m.scoreTeam1, parseInt(e.target.value), m.status)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {matches?.length === 0 && (
                      <div className="col-span-full py-20 text-center space-y-4">
                        <Swords className="w-12 h-12 text-slate-100 mx-auto" />
                        <p className="text-slate-300 font-black uppercase tracking-widest text-[10px]">Aucun match programmé pour ce tournoi</p>
                      </div>
                    )}
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

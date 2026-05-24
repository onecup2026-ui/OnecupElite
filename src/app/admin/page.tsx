
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
import { cn } from "@/lib/utils";

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
    updateDoc(doc(db, "registrations", regId), { status });
    toast({ title: `Inscription ${status.toLowerCase()}` });
  };

  const generateBracket = async (tournamentId: string) => {
    if (!db) return;
    const q = query(collection(db, "registrations"), where("tournamentId", "==", tournamentId), where("status", "==", "Validé"));
    const snap = await getDocs(q);
    const teams = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (teams.length < 2) {
      toast({ variant: "destructive", title: "Pas assez d'équipes validées (min 2)" });
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
    
    // Pour propager le gagnant, on récupère les données actuelles
    getDocs(query(collection(db, "matches"), where("__name__", "==", matchId))).then(snap => {
      const matchData = snap.docs[0].data();
      const winnerId = s1 > s2 ? matchData.team1Id : s2 > s1 ? matchData.team2Id : null;
      
      updateDoc(matchRef, { 
        scoreTeam1: s1, 
        scoreTeam2: s2, 
        status,
        winnerId: status === "Terminé" ? winnerId : null
      });
      toast({ title: "Match mis à jour" });
    });
  };

  const matchesQuery = useMemo(() => {
    if (!db || !activeTournamentId) return null;
    return query(collection(db, "matches"), where("tournamentId", "==", activeTournamentId), orderBy("matchNumber", "asc"));
  }, [db, activeTournamentId]);
  const { data: matches } = useCollection(matchesQuery);

  const saveConfig = async () => {
    if (!db) return;
    await setDoc(doc(db, "settings", "config"), configForm, { merge: true });
    toast({ title: "Configuration enregistrée" });
  };

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
  if (!isAdmin) return <div className="p-20 text-center font-black py-40 uppercase tracking-widest bg-slate-50 min-h-screen">Accès Réservé à l'Admin</div>;

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-20">
      <header className="bg-primary text-white py-16 md:py-24 px-4 overflow-hidden relative">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="space-y-3 text-center md:text-left">
             <Badge className="bg-white/10 text-white border-white/20 uppercase tracking-[0.4em] text-[8px] font-black">Elite Management Console</Badge>
             <h1 className="text-4xl md:text-7xl font-headline font-black uppercase tracking-tighter leading-none">Console <span className="text-white/30">ELITE.</span></h1>
          </div>
          <Button variant="outline" onClick={() => auth && signOut(auth)} className="text-white border-white/20 h-12 px-10 rounded-full font-black uppercase text-[10px] hover:bg-white/10">Quitter la session</Button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
      </header>

      <div className="container mx-auto px-4 -mt-10 md:-mt-14 relative z-20">
        <Tabs defaultValue="theme" className="w-full">
          <div className="bg-white p-2 rounded-full shadow-2xl border mb-12 overflow-x-auto scrollbar-hide">
            <TabsList className="bg-transparent h-auto flex gap-1.5 min-w-max p-1">
              {[
                { val: "theme", label: "Identité", icon: Palette },
                { val: "design", label: "Interface", icon: Layout },
                { val: "tournaments", label: "Tournois", icon: Trophy },
                { val: "registrations", label: "Inscriptions", icon: ListChecks },
                { val: "matches", label: "Live Score", icon: Swords },
              ].map(tab => (
                <TabsTrigger key={tab.val} value={tab.val} className="px-8 py-3.5 font-black uppercase text-[9px] gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="theme" className="animate-in fade-in zoom-in-95 duration-500">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-8">
                     <h3 className="text-2xl font-headline font-black uppercase">Logo Principal</h3>
                     <div className="relative aspect-video rounded-[2.5rem] border-2 border-dashed flex items-center justify-center bg-slate-50 cursor-pointer overflow-hidden group" onClick={() => logoUploadRef.current?.click()}>
                        {configForm.logoUrl ? <img src={configForm.logoUrl} className="max-h-20 object-contain" /> : <Upload className="text-slate-200 w-12 h-12" />}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center transition-all">
                           <span className="opacity-0 group-hover:opacity-100 text-[9px] font-black uppercase text-slate-400">Modifier</span>
                        </div>
                     </div>
                     <input type="file" ref={logoUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'branding', (url) => setConfigForm({...configForm, logoUrl: url}))} />
                  </div>
                  <div className="space-y-8">
                     <h3 className="text-2xl font-headline font-black uppercase">Thème HSL</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Primaire</Label>
                           <Input value={configForm.primaryColor} onChange={e => setConfigForm({...configForm, primaryColor: e.target.value})} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Secondaire</Label>
                           <Input value={configForm.secondaryColor} onChange={e => setConfigForm({...configForm, secondaryColor: e.target.value})} className="h-12 rounded-xl" />
                        </div>
                     </div>
                  </div>
               </div>
               <Button onClick={saveConfig} className="w-full h-16 rounded-2xl font-black uppercase bg-primary glow-blue">Synchroniser l'Identité</Button>
            </Card>
          </TabsContent>

          <TabsContent value="design" className="animate-in fade-in zoom-in-95 duration-500">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-8">
                     <h3 className="text-2xl font-headline font-black uppercase">Stories Accueil (Carousel)</h3>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {configForm.carouselImages.map((img, idx) => (
                           <div key={idx} className="space-y-2">
                              <div className="relative aspect-[3/4] rounded-2xl border-2 border-dashed bg-slate-50 overflow-hidden cursor-pointer group" onClick={() => carouselUploadRefs[idx].current?.click()}>
                                 {img ? <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <Upload className="w-6 h-6 text-slate-200 mx-auto mt-16" />}
                              </div>
                              <input type="file" ref={carouselUploadRefs[idx]} className="hidden" onChange={(e) => handleStorageUpload(e, 'carousel', (url) => {
                                 const newImg = [...configForm.carouselImages];
                                 newImg[idx] = url;
                                 setConfigForm({...configForm, carouselImages: newImg});
                              })} />
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-8">
                     <h3 className="text-2xl font-headline font-black uppercase">Échéance ONECUP</h3>
                     <div className="p-8 bg-slate-50 rounded-[2.5rem] border space-y-6">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-primary"><Calendar className="w-4 h-4" /> Date Cible</Label>
                        <Input type="datetime-local" value={configForm.targetDate} onChange={e => setConfigForm({...configForm, targetDate: e.target.value})} className="h-14 rounded-xl bg-white" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">C'est cette date qui alimente le compte à rebours de l'accueil.</p>
                     </div>
                  </div>
               </div>
               <Button onClick={saveConfig} className="w-full h-16 rounded-2xl font-black uppercase bg-primary glow-blue">Mettre à jour l'Interface</Button>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments" className="animate-in fade-in zoom-in-95 duration-500">
             <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-10">
                <h3 className="text-2xl font-headline font-black uppercase">Lancer un Tournoi</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-4">
                      <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Affiche Tournoi</Label>
                      <div className="relative aspect-[4/5] rounded-[2.5rem] border-2 border-dashed bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden group" onClick={() => tournamentUploadRef.current?.click()}>
                         {tournamentForm.imageUrl ? <img src={tournamentForm.imageUrl} className="w-full h-full object-cover" /> : <Upload className="text-slate-200 w-12 h-12" />}
                      </div>
                      <input type="file" ref={tournamentUploadRef} className="hidden" onChange={(e) => handleStorageUpload(e, 'tournaments', (url) => setTournamentForm({...tournamentForm, imageUrl: url}))} />
                   </div>
                   <div className="space-y-6">
                      <Input placeholder="Nom du tournoi" value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} className="h-14 rounded-xl font-bold" />
                      <div className="grid grid-cols-2 gap-4">
                         <select className="h-14 rounded-xl px-4 border font-bold" value={tournamentForm.gameType} onChange={e => setTournamentForm({...tournamentForm, gameType: e.target.value})}>
                            <option value="Football">Football</option>
                            <option value="PlayStation">PlayStation / FIFA</option>
                         </select>
                         <Input placeholder="Stade" value={tournamentForm.locationStade} onChange={e => setTournamentForm({...tournamentForm, locationStade: e.target.value})} className="h-14 rounded-xl" />
                      </div>
                      <Textarea placeholder="Description du tournoi..." value={tournamentForm.description} onChange={e => setTournamentForm({...tournamentForm, description: e.target.value})} className="rounded-2xl min-h-[150px]" />
                   </div>
                </div>
                <Button onClick={() => addDoc(collection(db!, "tournaments"), {...tournamentForm, createdAt: serverTimestamp()}).then(() => toast({ title: "Tournoi publié !" }))} className="w-full h-16 rounded-2xl font-black uppercase bg-primary glow-blue">Publier la compétition</Button>
             </Card>
          </TabsContent>

          <TabsContent value="registrations" className="animate-in fade-in zoom-in-95 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registrations?.map((reg: any) => (
                  <Card key={reg.id} className="rounded-3xl p-8 bg-white shadow-xl border-none space-y-6 flex flex-col justify-between">
                     <div className="space-y-4">
                        <div className="flex justify-between items-start">
                           <Badge variant="outline" className={cn("uppercase font-black text-[8px] px-3 py-1", reg.status === "Validé" ? "bg-green-50 text-green-500 border-green-200" : "bg-slate-50 text-slate-500 border-slate-200")}>{reg.status}</Badge>
                           <span className="text-[8px] font-black text-slate-200 uppercase">#{reg.id.slice(-4)}</span>
                        </div>
                        <h4 className="font-black uppercase text-xl text-slate-900 leading-none">{reg.teamName}</h4>
                        <Separator className="opacity-5" />
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-300 uppercase">Capitaine</p>
                              <p className="text-[10px] font-bold">{reg.captainName}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-300 uppercase">Contact</p>
                              <p className="text-[10px] font-bold">{reg.contactPhone}</p>
                           </div>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <Button onClick={() => handleUpdateRegistration(reg.id, "Validé")} className="flex-1 bg-green-500 hover:bg-green-600 rounded-xl h-11 font-black uppercase text-[9px]">Valider</Button>
                        <Button onClick={() => handleUpdateRegistration(reg.id, "Refusé")} variant="outline" className="flex-1 border-red-500 text-red-500 hover:bg-red-50 rounded-xl h-11 font-black uppercase text-[9px]">Refuser</Button>
                     </div>
                  </Card>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="matches" className="animate-in fade-in zoom-in-95 duration-500">
             <div className="space-y-8">
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                   {tournaments?.map((t: any) => (
                      <Button key={t.id} variant={activeTournamentId === t.id ? "default" : "outline"} onClick={() => setActiveTournamentId(t.id)} className="rounded-full h-11 px-8 uppercase font-black text-[9px] shrink-0">
                         {t.name}
                      </Button>
                   ))}
                </div>
                {activeTournamentId && (
                   <Card className="rounded-[3rem] p-10 bg-white shadow-xl border-none space-y-10">
                      <div className="flex justify-between items-center">
                         <h3 className="text-2xl font-headline font-black uppercase">Pilotage Matchs</h3>
                         <Button onClick={() => generateBracket(activeTournamentId)} className="bg-secondary text-white rounded-2xl h-12 px-8 uppercase font-black text-[9px] gap-2">
                            <RotateCcw className="w-3 h-3" /> Générer Bracket
                         </Button>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {matches?.map((m: any) => (
                            <div key={m.id} className="p-8 border rounded-[2.5rem] space-y-6 bg-slate-50/50">
                               <div className="flex justify-between items-center">
                                  <Badge className="bg-primary text-white text-[8px] font-black uppercase">Match #{m.matchNumber}</Badge>
                                  <select className="text-[9px] font-black uppercase bg-transparent outline-none" value={m.status} onChange={e => updateMatchScore(m.id, m.scoreTeam1, m.scoreTeam2, e.target.value)}>
                                     <option value="Programmé">Programmé</option>
                                     <option value="En Cours">En Cours</option>
                                     <option value="Terminé">Terminé</option>
                                  </select>
                               </div>
                               <div className="flex items-center gap-6">
                                  <div className="flex-1 text-center space-y-4">
                                     <p className="font-black uppercase text-[10px] truncate">{m.team1Id}</p>
                                     <Input type="number" className="h-14 text-center font-black text-2xl rounded-xl border-none shadow-inner" value={m.scoreTeam1} onChange={e => updateMatchScore(m.id, parseInt(e.target.value), m.scoreTeam2, m.status)} />
                                  </div>
                                  <span className="font-black text-slate-200">VS</span>
                                  <div className="flex-1 text-center space-y-4">
                                     <p className="font-black uppercase text-[10px] truncate">{m.team2Id}</p>
                                     <Input type="number" className="h-14 text-center font-black text-2xl rounded-xl border-none shadow-inner" value={m.scoreTeam2} onChange={e => updateMatchScore(m.id, m.scoreTeam1, parseInt(e.target.value), m.status)} />
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

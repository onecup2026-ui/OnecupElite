
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Trophy, Plus, Trash2, ShieldCheck, Loader2, Upload, 
  Settings, Save, Edit2, MessageCircle, ImageIcon, 
  Layout, Newspaper, Users, Info, Ticket as TicketIcon,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { useCollection, useFirestore, useUser, useDoc, useStorage, useAuth } from "@/firebase";
import { 
  doc, addDoc, deleteDoc, collection, serverTimestamp, 
  setDoc, updateDoc, query, orderBy 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { signOut } from "firebase/auth";
import Link from "next/link";

const ADMIN_EMAIL = "onecup2026@gmail.com";

export default function AdminDashboard() {
  const db = useFirestore();
  const storage = useStorage();
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  
  const heroUploadRef = useRef<HTMLInputElement>(null);
  const afterCupUploadRef = useRef<HTMLInputElement>(null);
  const tournamentUploadRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Firestore Refs
  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const registrationsRef = useMemo(() => (db ? collection(db, "registrations") : null), [db]);
  const newsRef = useMemo(() => (db ? collection(db, "articles") : null), [db]);
  const matchesRef = useMemo(() => (db ? collection(db, "matches") : null), [db]);
  const sponsorsRef = useMemo(() => (db ? collection(db, "sponsors") : null), [db]);
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);

  // Data fetching
  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: registrations } = useCollection(registrationsRef);
  const { data: news } = useCollection(newsRef);
  const { data: matches } = useCollection(matchesRef);
  const { data: sponsors } = useCollection(sponsorsRef);
  const { data: siteConfig } = useDoc(configRef);

  const [isUploading, setIsUploading] = useState(false);

  // Forms States
  const [configForm, setConfigForm] = useState({
    heroTitle: "", heroSubtitle: "", heroImageUrl: "", afterCupImageUrl: "", 
    afterCupDescription: "Célébrez la victoire, assistez au sacre des champions.",
    currentPrizePool: 0, targetPrizePool: 5000000, 
    statSchools: "0", statMatches: "0", statTalents: "0"
  });

  const [tournamentForm, setTournamentForm] = useState({
    name: "", gameType: "Football", startDate: "", locationStade: "", 
    maxTeams: 16, entryFee: 0, description: "", imageUrl: "", teamsRegistered: 0
  });

  const [newsForm, setNewsForm] = useState({
    title: "", excerpt: "", category: "Tournoi", author: "Admin OneCup", 
    imageUrl: "", date: new Date().toISOString().split('T')[0]
  });

  const [matchForm, setMatchForm] = useState({
    tournamentName: "", matchNumber: 1, team1Id: "", team2Id: "", 
    scoreTeam1: 0, scoreTeam2: 0, status: "À venir", winnerId: ""
  });

  const [sponsorForm, setSponsorForm] = useState({
    name: "", logoUrl: "", websiteUrl: "", category: "Partenaire"
  });

  useEffect(() => {
    if (siteConfig) setConfigForm({ ...configForm, ...siteConfig });
  }, [siteConfig]);

  const handleStorageUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      callback(url);
      toast({ title: "Image téléversée !" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur de téléversement" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (collName: string, data: any, id?: string) => {
    if (!db || !isAdmin) return;
    try {
      if (id) {
        await updateDoc(doc(db, collName, id), { ...data, updatedAt: serverTimestamp() });
        toast({ title: "Mise à jour réussie" });
      } else {
        await addDoc(collection(db, collName), { ...data, createdAt: serverTimestamp() });
        toast({ title: "Création réussie" });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur lors de l'enregistrement" });
    }
  };

  const handleDelete = async (collName: string, id: string) => {
    if (!db || !isAdmin || !confirm("Confirmer la suppression ?")) return;
    try {
      await deleteDoc(doc(db, collName, id));
      toast({ title: "Suppression réussie" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur lors de la suppression" });
    }
  };

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <Card className="max-w-md w-full p-10 text-center space-y-6 rounded-[3rem] shadow-2xl border-none">
        <ShieldCheck className="w-20 h-20 text-destructive mx-auto" />
        <h2 className="text-3xl font-headline font-black uppercase tracking-tighter">Accès Réservé</h2>
        <p className="text-slate-400">Connectez-vous avec le compte administrateur officiel.</p>
        <Button variant="destructive" onClick={() => auth && signOut(auth)} className="w-full h-14 rounded-2xl font-black uppercase">Changer de compte</Button>
      </Card>
    </div>
  );

  return (
    <div className="bg-[#f3f3f3] min-h-screen pb-20">
      <header className="bg-primary text-white py-12 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">Console de Gestion</h1>
            <p className="text-white/60 font-medium uppercase tracking-[0.4em] text-[10px]">OneCup Elite 2026</p>
          </div>
          <Button variant="outline" onClick={() => auth && signOut(auth)} className="h-12 border-white/20 text-white rounded-xl font-bold uppercase text-[10px] px-8">Quitter</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 -mt-12 relative z-20">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="bg-white p-2 rounded-3xl mb-12 flex flex-wrap h-auto gap-2 shadow-xl border border-slate-100 overflow-x-auto">
            <TabsTrigger value="config" className="flex-1 min-w-[120px] uppercase font-black text-[10px] py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><Layout className="w-4 h-4" /> Design</TabsTrigger>
            <TabsTrigger value="tournaments" className="flex-1 min-w-[120px] uppercase font-black text-[10px] py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><Trophy className="w-4 h-4" /> Tournois</TabsTrigger>
            <TabsTrigger value="news" className="flex-1 min-w-[120px] uppercase font-black text-[10px] py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><Newspaper className="w-4 h-4" /> News</TabsTrigger>
            <TabsTrigger value="matches" className="flex-1 min-w-[120px] uppercase font-black text-[10px] py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><Search className="w-4 h-4" /> Résultats</TabsTrigger>
            <TabsTrigger value="registrations" className="flex-1 min-w-[120px] uppercase font-black text-[10px] py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><Users className="w-4 h-4" /> Inscrits</TabsTrigger>
            <TabsTrigger value="sponsors" className="flex-1 min-w-[120px] uppercase font-black text-[10px] py-4 rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><ImageIcon className="w-4 h-4" /> Sponsors</TabsTrigger>
          </TabsList>

          {/* Config Design Tab */}
          <TabsContent value="config">
            <Card className="rounded-[3rem] overflow-hidden border-none shadow-2xl bg-white p-8 md:p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label className="font-black uppercase text-xs tracking-widest text-primary">Bannière Accueil (Hero)</Label>
                  <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-50" onClick={() => heroUploadRef.current?.click()}>
                    {configForm.heroImageUrl ? <img src={configForm.heroImageUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-10 h-10 text-slate-300" /></div>}
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                      {isUploading ? <Loader2 className="animate-spin text-white w-10 h-10" /> : <Upload className="w-10 h-10 text-white" />}
                    </div>
                  </div>
                  <input type="file" ref={heroUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'design', (url) => setConfigForm(f => ({...f, heroImageUrl: url})))} />
                </div>
                <div className="space-y-4">
                  <Label className="font-black uppercase text-xs tracking-widest text-primary">Bannière After Cup</Label>
                  <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-50" onClick={() => afterCupUploadRef.current?.click()}>
                    {configForm.afterCupImageUrl ? <img src={configForm.afterCupImageUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-10 h-10 text-slate-300" /></div>}
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                      {isUploading ? <Loader2 className="animate-spin text-white w-10 h-10" /> : <Upload className="w-10 h-10 text-white" />}
                    </div>
                  </div>
                  <input type="file" ref={afterCupUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'design', (url) => setConfigForm(f => ({...f, afterCupImageUrl: url})))} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2"><Label className="font-black uppercase text-xs tracking-widest">Titre Accueil</Label><Input value={configForm.heroTitle} onChange={e => setConfigForm({...configForm, heroTitle: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" /></div>
                <div className="space-y-2"><Label className="font-black uppercase text-xs tracking-widest">Description After Cup</Label><Input value={configForm.afterCupDescription} onChange={e => setConfigForm({...configForm, afterCupDescription: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" /></div>
              </div>
              <Button onClick={() => db && setDoc(doc(db, "settings", "config"), configForm, { merge: true }).then(() => toast({ title: "Design mis à jour" }))} className="w-full h-20 font-black uppercase rounded-3xl bg-primary text-xl shadow-xl">Appliquer les modifications</Button>
            </Card>
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-10">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-6">
              <h3 className="text-2xl font-headline font-black uppercase">Nouveau Tournoi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="font-black uppercase text-xs tracking-widest">Image du Tournoi</Label>
                  <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-50" onClick={() => tournamentUploadRef.current?.click()}>
                    {tournamentForm.imageUrl ? <img src={tournamentForm.imageUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center flex-col gap-2"><ImageIcon className="w-8 h-8 text-slate-300" /><span className="text-[10px] text-slate-400 font-bold uppercase">Ajouter Photo</span></div>}
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                      {isUploading ? <Loader2 className="animate-spin text-white w-8 h-8" /> : <Upload className="w-8 h-8 text-white" />}
                    </div>
                  </div>
                  <input type="file" ref={tournamentUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'tournaments', (url) => setTournamentForm(f => ({...f, imageUrl: url})))} />
                </div>
                <div className="space-y-6">
                  <Input placeholder="Nom du tournoi" value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" />
                  <Input placeholder="Stade / Lieu" value={tournamentForm.locationStade} onChange={e => setTournamentForm({...tournamentForm, locationStade: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" />
                  <Input type="date" value={tournamentForm.startDate} onChange={e => setTournamentForm({...tournamentForm, startDate: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" />
                </div>
                <Input placeholder="Capacité (Equipes)" type="number" value={tournamentForm.maxTeams} onChange={e => setTournamentForm({...tournamentForm, maxTeams: parseInt(e.target.value)})} className="h-14 rounded-2xl bg-slate-50 border-none" />
                <Select value={tournamentForm.gameType} onValueChange={v => setTournamentForm({...tournamentForm, gameType: v})}>
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Football">Football</SelectItem><SelectItem value="PlayStation">PlayStation</SelectItem><SelectItem value="Elite">Elite</SelectItem></SelectContent>
                </Select>
                <Textarea placeholder="Description du tournoi" value={tournamentForm.description} onChange={e => setTournamentForm({...tournamentForm, description: e.target.value})} className="md:col-span-2 rounded-2xl bg-slate-50 border-none min-h-[100px]" />
              </div>
              <Button onClick={() => handleSave("tournaments", tournamentForm).then(() => setTournamentForm({name:"", gameType:"Football", startDate:"", locationStade:"", maxTeams:16, entryFee:0, description:"", imageUrl:"", teamsRegistered: 0}))} className="w-full h-16 rounded-2xl font-black uppercase bg-primary">Publier le Tournoi</Button>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tournaments?.map((t: any) => (
                <Card key={t.id} className="p-6 rounded-3xl bg-white border-none shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                      {t.imageUrl && <img src={t.imageUrl} className="w-full h-full object-cover" />}
                    </div>
                    <div><h4 className="font-black uppercase text-lg">{t.name}</h4><p className="text-xs text-slate-400">{t.locationStade}</p></div>
                  </div>
                  <Button size="icon" variant="ghost" className="hover:text-destructive" onClick={() => handleDelete("tournaments", t.id)}><Trash2 className="w-5 h-5" /></Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-10">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-6">
              <h3 className="text-2xl font-headline font-black uppercase">Rédiger un Article</h3>
              <Input placeholder="Titre de l'article" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" />
              <Textarea placeholder="Résumé court" value={newsForm.excerpt} onChange={e => setNewsForm({...newsForm, excerpt: e.target.value})} className="rounded-2xl bg-slate-50 border-none min-h-[100px]" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select value={newsForm.category} onValueChange={v => setNewsForm({...newsForm, category: v})}>
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Tournoi">Tournoi</SelectItem><SelectItem value="Transfert">Transfert</SelectItem><SelectItem value="Elite">Elite</SelectItem></SelectContent>
                </Select>
                <Input type="date" value={newsForm.date} onChange={e => setNewsForm({...newsForm, date: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" />
              </div>
              <Button onClick={() => handleSave("articles", newsForm).then(() => setNewsForm({title:"", excerpt:"", category:"Tournoi", author:"Admin OneCup", imageUrl:"", date: new Date().toISOString().split('T')[0]}))} className="w-full h-16 rounded-2xl font-black uppercase bg-primary">Publier l'Article</Button>
            </Card>
            <div className="grid gap-6">
              {news?.map((n: any) => (
                <Card key={n.id} className="p-6 rounded-3xl bg-white border-none shadow-md flex items-center justify-between">
                  <div><h4 className="font-black uppercase text-lg">{n.title}</h4><p className="text-xs text-slate-400">{n.category} • {n.date}</p></div>
                  <Button size="icon" variant="ghost" className="hover:text-destructive" onClick={() => handleDelete("articles", n.id)}><Trash2 className="w-5 h-5" /></Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Results/Matches Tab */}
          <TabsContent value="matches" className="space-y-10">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-6">
              <h3 className="text-2xl font-headline font-black uppercase">Nouveau Match / Résultat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input placeholder="Nom du tournoi" value={matchForm.tournamentName} onChange={e => setMatchForm({...matchForm, tournamentName: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" />
                <Input placeholder="Equipe 1" value={matchForm.team1Id} onChange={e => setMatchForm({...matchForm, team1Id: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" />
                <Input placeholder="Equipe 2" value={matchForm.team2Id} onChange={e => setMatchForm({...matchForm, team2Id: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" />
                <div className="flex gap-4">
                  <Input type="number" placeholder="Score 1" value={matchForm.scoreTeam1} onChange={e => setMatchForm({...matchForm, scoreTeam1: parseInt(e.target.value)})} className="h-14 rounded-2xl bg-slate-50 border-none" />
                  <Input type="number" placeholder="Score 2" value={matchForm.scoreTeam2} onChange={e => setMatchForm({...matchForm, scoreTeam2: parseInt(e.target.value)})} className="h-14 rounded-2xl bg-slate-50 border-none" />
                </div>
                <Select value={matchForm.status} onValueChange={v => setMatchForm({...matchForm, status: v})}>
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="À venir">À venir</SelectItem><SelectItem value="En Cours">En Cours</SelectItem><SelectItem value="Terminé">Terminé</SelectItem></SelectContent>
                </Select>
              </div>
              <Button onClick={() => handleSave("matches", matchForm).then(() => setMatchForm({tournamentName:"", matchNumber:1, team1Id:"", team2Id:"", scoreTeam1:0, scoreTeam2:0, status:"À venir", winnerId:""}))} className="w-full h-16 rounded-2xl font-black uppercase bg-primary">Enregistrer le Match</Button>
            </Card>
            <div className="grid gap-6">
              {matches?.map((m: any) => (
                <Card key={m.id} className="p-6 rounded-3xl bg-white border-none shadow-md flex items-center justify-between">
                  <div className="font-bold">{m.team1Id} {m.scoreTeam1} : {m.scoreTeam2} {m.team2Id} <Badge className="ml-4">{m.status}</Badge></div>
                  <Button size="icon" variant="ghost" className="hover:text-destructive" onClick={() => handleDelete("matches", m.id)}><Trash2 className="w-5 h-5" /></Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations">
            <div className="grid gap-6">
              {registrations?.map((r: any) => (
                <Card key={r.id} className="p-8 rounded-[3rem] bg-white border-none shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="font-black uppercase text-2xl">{r.teamName}</h4>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{r.captainName} • {r.contactPhone}</p>
                    <Badge variant="outline" className="mt-2 text-primary border-primary">{r.tournamentName}</Badge>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => window.open(`https://wa.me/${r.contactPhone.replace(/\D/g, '')}`, '_blank')} className="rounded-2xl bg-green-500 hover:bg-green-600 font-bold uppercase text-xs gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp</Button>
                    <Button size="icon" variant="ghost" className="hover:text-destructive" onClick={() => handleDelete("registrations", r.id)}><Trash2 className="w-5 h-5" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sponsors Tab */}
          <TabsContent value="sponsors" className="space-y-10">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-6">
              <h3 className="text-2xl font-headline font-black uppercase">Nouveau Sponsor</h3>
              <Input placeholder="Nom du sponsor" value={sponsorForm.name} onChange={e => setSponsorForm({...sponsorForm, name: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" />
              <Input placeholder="Site Web (URL)" value={sponsorForm.websiteUrl} onChange={e => setSponsorForm({...sponsorForm, websiteUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" />
              <Input placeholder="Logo (URL)" value={sponsorForm.logoUrl} onChange={e => setSponsorForm({...sponsorForm, logoUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" />
              <Button onClick={() => handleSave("sponsors", sponsorForm).then(() => setSponsorForm({name:"", logoUrl:"", websiteUrl:"", category:"Partenaire"}))} className="w-full h-16 rounded-2xl font-black uppercase bg-primary">Ajouter Sponsor</Button>
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {sponsors?.map((s: any) => (
                <Card key={s.id} className="p-4 rounded-3xl bg-white border-none shadow-md flex flex-col items-center gap-4">
                  <div className="h-12 w-full flex items-center justify-center">
                    <img src={s.logoUrl} className="max-h-full max-w-full object-contain" />
                  </div>
                  <p className="font-bold text-xs uppercase text-center">{s.name}</p>
                  <Button size="icon" variant="ghost" className="hover:text-destructive" onClick={() => handleDelete("sponsors", s.id)}><Trash2 className="w-4 h-4" /></Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

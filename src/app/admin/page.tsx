"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Trophy, Plus, Trash2, ShieldCheck, Loader2, Upload, Settings, Save, Edit2, MessageCircle, ImageIcon, Layout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCollection, useFirestore, useUser, useDoc, useStorage, useAuth } from "@/firebase";
import { doc, addDoc, deleteDoc, collection, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { signOut } from "firebase/auth";

const ADMIN_EMAIL = "onecup2026@gmail.com";

export default function AdminDashboard() {
  const db = useFirestore();
  const storage = useStorage();
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  
  const heroUploadRef = useRef<HTMLInputElement>(null);
  const afterCupUploadRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const registrationsRef = useMemo(() => (db ? collection(db, "registrations") : null), [db]);
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);

  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: registrations } = useCollection(registrationsRef);
  const { data: siteConfig } = useDoc(configRef);

  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const initialTournamentState = {
    name: "", gameType: "Football", startDate: "", endDate: "", registrationDeadline: "", entryFee: 0, maxTeams: 16, description: "", imageUrl: "", locationStade: "", locationCommune: "", locationAdresse: "", teaserVideoUrl: ""
  };
  const [tournamentForm, setTournamentForm] = useState(initialTournamentState);

  const [configForm, setConfigForm] = useState({
    heroTitle: "", heroSubtitle: "", heroImageUrl: "", afterCupImageUrl: "", currentPrizePool: 0, targetPrizePool: 5000000, statSchools: "", statMatches: "", statTalents: ""
  });

  useEffect(() => {
    if (siteConfig) {
      setConfigForm({
        heroTitle: siteConfig.heroTitle || "",
        heroSubtitle: siteConfig.heroSubtitle || "",
        heroImageUrl: siteConfig.heroImageUrl || "",
        afterCupImageUrl: siteConfig.afterCupImageUrl || "",
        currentPrizePool: siteConfig.currentPrizePool || 0,
        targetPrizePool: siteConfig.targetPrizePool || 5000000,
        statSchools: siteConfig.statSchools || "",
        statMatches: siteConfig.statMatches || "",
        statTalents: siteConfig.statTalents || ""
      });
    }
  }, [siteConfig]);

  const handleStorageUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string, field: "heroImageUrl" | "afterCupImageUrl") => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `design/${path}_${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setConfigForm(prev => ({ ...prev, [field]: url }));
      toast({ title: "Image téléversée avec succès !" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur lors du téléversement" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveTournament = () => {
    if (!db || !isAdmin) return;
    if (editingTournamentId) {
      updateDoc(doc(db, "tournaments", editingTournamentId), { ...tournamentForm, updatedAt: serverTimestamp() })
        .then(() => { toast({ title: "Mise à jour réussie !" }); setEditingTournamentId(null); setTournamentForm(initialTournamentState); });
    } else {
      addDoc(collection(db, "tournaments"), { ...tournamentForm, teamsRegistered: 0, createdAt: serverTimestamp() })
        .then(() => { toast({ title: "Tournoi publié !" }); setTournamentForm(initialTournamentState); });
    }
  };

  const handleDelete = (coll: string, id: string) => {
    if (confirm("Voulez-vous vraiment supprimer cet élément ?")) {
      deleteDoc(doc(db!, coll, id)).then(() => toast({ title: "Élément supprimé" }));
    }
  };

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f3f3f3]">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center space-y-8 max-w-lg w-full">
        <ShieldCheck className="w-24 h-24 text-destructive mx-auto" />
        <div className="space-y-4">
          <h2 className="text-4xl font-headline font-black uppercase tracking-tighter">Accès Admin Requis</h2>
          <p className="text-slate-400 font-medium">Vous devez être connecté avec l'adresse administrateur officielle pour accéder à cet espace.</p>
        </div>
        <div className="flex flex-col gap-4">
          <Button variant="destructive" onClick={() => auth && signOut(auth)} className="h-14 rounded-2xl font-black uppercase tracking-widest">
            Changer de compte
          </Button>
          <Link href="/">
            <Button variant="ghost" className="h-14 font-bold uppercase text-xs">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f3f3f3] min-h-screen pb-20">
      <header className="bg-primary text-white py-10 md:py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">Console Elite</h1>
            <p className="text-white/60 font-medium uppercase tracking-[0.3em] text-[10px]">Gestion du Hub ONECUP 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-white text-primary px-6 py-2 font-black rounded-full shadow-lg">ADMIN</Badge>
            <Button variant="outline" onClick={() => auth && signOut(auth)} className="h-12 border-white/20 text-white hover:bg-white/10 rounded-xl font-bold uppercase text-[10px] tracking-widest px-8">Quitter</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <Tabs defaultValue="tournaments" className="w-full">
          <TabsList className="bg-white p-2 rounded-2xl mb-12 flex flex-wrap h-auto gap-2 shadow-xl border border-slate-100">
            <TabsTrigger value="tournaments" className="flex-1 uppercase font-black text-xs py-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Tournois</TabsTrigger>
            <TabsTrigger value="registrations" className="flex-1 uppercase font-black text-xs py-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Inscriptions</TabsTrigger>
            <TabsTrigger value="config" className="flex-1 uppercase font-black text-xs py-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><Layout className="w-4 h-4" /> Design</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-10">
            <Card className="rounded-[3rem] overflow-hidden border-none shadow-2xl bg-white">
              <CardHeader className="bg-slate-50 p-10 border-b">
                <CardTitle className="font-headline font-black uppercase text-2xl tracking-tight">Identité Visuelle du Site</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="font-black uppercase text-xs tracking-widest text-primary">Bannière Accueil (Hero)</Label>
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-50 border-slate-200" onClick={() => heroUploadRef.current?.click()}>
                      {configForm.heroImageUrl ? <img src={configForm.heroImageUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-10 h-10 text-slate-300" /></div>}
                      <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm"><Upload className="w-10 h-10 text-white" /></div>
                      {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>}
                    </div>
                    <input type="file" ref={heroUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'hero', 'heroImageUrl')} />
                  </div>
                  <div className="space-y-4">
                    <Label className="font-black uppercase text-xs tracking-widest text-primary">Bannière After Cup</Label>
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-50 border-slate-200" onClick={() => afterCupUploadRef.current?.click()}>
                      {configForm.afterCupImageUrl ? <img src={configForm.afterCupImageUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-10 h-10 text-slate-300" /></div>}
                      <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm"><Upload className="w-10 h-10 text-white" /></div>
                    </div>
                    <input type="file" ref={afterCupUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'aftercup', 'afterCupImageUrl')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t">
                  <div className="space-y-2"><Label className="font-black uppercase text-xs tracking-widest">Titre Hero</Label><Input value={configForm.heroTitle} onChange={e => setConfigForm({...configForm, heroTitle: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" /></div>
                  <div className="space-y-2"><Label className="font-black uppercase text-xs tracking-widest">Sous-titre</Label><Textarea value={configForm.heroSubtitle} onChange={e => setConfigForm({...configForm, heroSubtitle: e.target.value})} className="rounded-2xl bg-slate-50 border-none font-medium min-h-[100px]" /></div>
                </div>

                <Button onClick={() => db && setDoc(doc(db, "settings", "config"), configForm, { merge: true }).then(() => toast({ title: "Design mis à jour !" }))} className="w-full h-20 font-black uppercase rounded-3xl bg-primary text-xl shadow-xl glow-blue hover:scale-[1.02] transition-transform">
                  <Save className="w-6 h-6 mr-3" /> Appliquer les modifications visuelles
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-12">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white">
              <CardHeader className="bg-slate-50 p-10 border-b">
                <CardTitle className="font-headline font-black uppercase text-2xl tracking-tight">{editingTournamentId ? "Modifier" : "Créer"} une Compétition</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label className="font-black uppercase text-xs">Nom</Label><Input value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none" /></div>
                  <div className="space-y-2"><Label className="font-black uppercase text-xs">Stade</Label><Input value={tournamentForm.locationStade} onChange={e => setTournamentForm({...tournamentForm, locationStade: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none" /></div>
                </div>
                <Button onClick={handleSaveTournament} className="w-full h-16 font-black uppercase rounded-2xl bg-primary shadow-lg text-lg">Publier la compétition</Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tournaments?.map((t: any) => (
                <Card key={t.id} className="p-8 flex items-center justify-between rounded-[2.5rem] border-none shadow-xl bg-white hover:scale-[1.01] transition-transform group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors"><Trophy className="w-8 h-8 text-primary group-hover:text-white" /></div>
                    <div><h3 className="font-black uppercase text-xl tracking-tight leading-none">{t.name}</h3><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{t.locationStade}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="w-12 h-12 rounded-xl" onClick={() => { setEditingTournamentId(t.id); setTournamentForm({...t}); }}><Edit2 className="w-5 h-5" /></Button>
                    <Button size="icon" variant="ghost" className="w-12 h-12 rounded-xl hover:text-destructive" onClick={() => handleDelete('tournaments', t.id)}><Trash2 className="w-5 h-5" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-6">
            {registrations?.map((r: any) => (
              <Card key={r.id} className="p-10 rounded-[3rem] border-none shadow-xl bg-white flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2 text-center md:text-left">
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                    <h4 className="font-black uppercase text-3xl tracking-tighter">{r.teamName}</h4>
                    <Badge className="bg-green-500 font-black text-[10px] tracking-widest px-4 py-1">{r.status}</Badge>
                  </div>
                  <p className="font-bold text-sm text-slate-400 uppercase tracking-widest">{r.captainName} • {r.contactPhone}</p>
                  <Badge variant="outline" className="text-[10px] border-primary text-primary font-black uppercase tracking-widest px-6 mt-2">{r.tournamentName}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <Button size="lg" variant="outline" onClick={() => window.open(`https://wa.me/${r.contactPhone.replace(/\D/g, '')}`, '_blank')} className="h-16 px-10 gap-3 rounded-2xl border-green-500 text-green-500 font-black uppercase text-xs tracking-widest hover:bg-green-50">
                    <MessageCircle className="w-6 h-6" /> WhatsApp
                  </Button>
                  <Button size="icon" variant="ghost" className="h-16 w-16 rounded-2xl hover:text-destructive" onClick={() => handleDelete('registrations', r.id)}><Trash2 className="w-6 h-6" /></Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
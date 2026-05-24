"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Trophy, Plus, Trash2, ShieldCheck, Loader2, Upload, Settings, Save, Edit2, MessageCircle, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCollection, useFirestore, useUser, useDoc, useStorage } from "@/firebase";
import { doc, addDoc, deleteDoc, collection, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";

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
  if (!isAdmin) return <div className="p-20 text-center flex flex-col items-center gap-6"><ShieldCheck className="w-16 h-16 text-destructive" /><h2 className="text-3xl font-bold uppercase">Accès Admin Requis</h2><Button variant="destructive" onClick={() => auth && signOut(auth)}>Se déconnecter</Button></div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-6">
        <h1 className="text-2xl md:text-4xl font-headline font-black uppercase tracking-tighter">Console Admin</h1>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary px-3 py-1 font-black">ADMIN</Badge>
          <Button variant="outline" size="sm" onClick={() => auth && signOut(auth)} className="rounded-full font-bold">Quitter</Button>
        </div>
      </header>

      <Tabs defaultValue="tournaments" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl mb-8 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="tournaments" className="flex-1 uppercase font-black text-[10px] py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Tournois</TabsTrigger>
          <TabsTrigger value="registrations" className="flex-1 uppercase font-black text-[10px] py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Inscriptions</TabsTrigger>
          <TabsTrigger value="config" className="flex-1 uppercase font-black text-[10px] py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white gap-2"><Settings className="w-3 h-3" /> Design</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-8">
          <Card className="rounded-3xl overflow-hidden border-none shadow-lg">
            <CardHeader className="bg-primary/5 p-6 border-b">
              <CardTitle className="font-headline font-black uppercase text-lg">Personnalisation du site</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-black uppercase text-[10px] tracking-widest text-primary">Image de Bienvenue (Home)</Label>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-100" onClick={() => heroUploadRef.current?.click()}>
                    {configForm.heroImageUrl ? <img src={configForm.heroImageUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground" /></div>}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Upload className="w-6 h-6 text-white" /></div>
                    {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}
                  </div>
                  <input type="file" ref={heroUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'hero', 'heroImageUrl')} />
                </div>
                <div className="space-y-3">
                  <Label className="font-black uppercase text-[10px] tracking-widest text-primary">Image After Cup</Label>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-100" onClick={() => afterCupUploadRef.current?.click()}>
                    {configForm.afterCupImageUrl ? <img src={configForm.afterCupImageUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground" /></div>}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Upload className="w-6 h-6 text-white" /></div>
                  </div>
                  <input type="file" ref={afterCupUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'aftercup', 'afterCupImageUrl')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="space-y-2"><Label className="font-black uppercase text-[10px]">Titre Principal</Label><Input value={configForm.heroTitle} onChange={e => setConfigForm({...configForm, heroTitle: e.target.value})} className="rounded-lg" /></div>
                <div className="space-y-2"><Label className="font-black uppercase text-[10px]">Sous-titre</Label><Textarea value={configForm.heroSubtitle} onChange={e => setConfigForm({...configForm, heroSubtitle: e.target.value})} className="rounded-lg min-h-[80px]" /></div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="space-y-2"><Label className="font-black uppercase text-[10px]">Écoles</Label><Input value={configForm.statSchools} onChange={e => setConfigForm({...configForm, statSchools: e.target.value})} /></div>
                <div className="space-y-2"><Label className="font-black uppercase text-[10px]">Matchs</Label><Input value={configForm.statMatches} onChange={e => setConfigForm({...configForm, statMatches: e.target.value})} /></div>
                <div className="space-y-2"><Label className="font-black uppercase text-[10px]">Talents</Label><Input value={configForm.statTalents} onChange={e => setConfigForm({...configForm, statTalents: e.target.value})} /></div>
              </div>

              <Button onClick={() => db && setDoc(doc(db, "settings", "config"), configForm, { merge: true }).then(() => toast({ title: "Design sauvegardé !" }))} className="w-full h-12 font-black uppercase rounded-xl bg-primary shadow-md">
                <Save className="w-4 h-4 mr-2" /> Appliquer les modifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-8">
          <Card className="rounded-3xl border-none shadow-lg">
            <CardHeader className="bg-primary/5 p-6 border-b">
              <CardTitle className="font-headline font-black uppercase text-lg">{editingTournamentId ? "Modifier" : "Publier"} un tournoi</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="font-black uppercase text-[10px]">Nom</Label><Input value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} /></div>
                <div className="space-y-1"><Label className="font-black uppercase text-[10px]">Stade</Label><Input value={tournamentForm.locationStade} onChange={e => setTournamentForm({...tournamentForm, locationStade: e.target.value})} /></div>
              </div>
              <Button onClick={handleSaveTournament} className="w-full h-12 font-black uppercase rounded-lg">Enregistrer</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournaments?.map((t: any) => (
              <Card key={t.id} className="p-4 flex items-center justify-between rounded-2xl border-none shadow-sm bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Trophy className="w-5 h-5" /></div>
                  <div><h3 className="font-black uppercase text-xs">{t.name}</h3><p className="text-[9px] font-bold text-muted-foreground">{t.locationStade}</p></div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditingTournamentId(t.id); setTournamentForm({...t}); }}><Edit2 className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" className="hover:text-destructive" onClick={() => handleDelete('tournaments', t.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4">
          {registrations?.map((r: any) => (
            <Card key={r.id} className="p-6 rounded-2xl border-none shadow-sm bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h4 className="font-black uppercase text-lg tracking-tight">{r.teamName}</h4>
                  <Badge className="bg-green-500 font-black text-[9px]">{r.status}</Badge>
                </div>
                <p className="font-bold text-[10px] text-muted-foreground uppercase">{r.captainName} • {r.contactPhone}</p>
                <Badge variant="outline" className="text-[8px] border-primary text-primary font-black uppercase">{r.tournamentName}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => window.open(`https://wa.me/${r.contactPhone.replace(/\D/g, '')}`, '_blank')} className="h-10 px-4 gap-2 rounded-lg border-green-500 text-green-500 font-black uppercase text-[10px]">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </Button>
                <Button size="icon" variant="ghost" className="h-10 w-10 hover:text-destructive" onClick={() => handleDelete('registrations', r.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Trophy, Plus, Trash2, ShieldCheck, Loader2, Upload, Settings, Save, Edit2, MessageCircle, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sponsorLogoRef = useRef<HTMLInputElement>(null);
  const heroUploadRef = useRef<HTMLInputElement>(null);
  const afterCupUploadRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const registrationsRef = useMemo(() => (db ? collection(db, "registrations") : null), [db]);
  const sponsorsRef = useMemo(() => (db ? collection(db, "sponsors") : null), [db]);
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);

  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: registrations } = useCollection(registrationsRef);
  const { data: sponsors } = useCollection(sponsorsRef);
  const { data: siteConfig } = useDoc(configRef);

  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const initialTournamentState = {
    name: "", gameType: "Football", startDate: "", endDate: "", registrationDeadline: "", entryFee: 0, maxTeams: 16, description: "", imageUrl: "", locationStade: "", locationCommune: "", locationAdresse: "", teaserVideoUrl: ""
  };
  const [tournamentForm, setTournamentForm] = useState(initialTournamentState);

  const initialSponsorState = { name: "", logoUrl: "", websiteUrl: "", category: "Partenaire Officiel" };
  const [sponsorForm, setSponsorForm] = useState(initialSponsorState);

  const [isSavingConfig, setIsSavingConfig] = useState(false);
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

  const handleStorageUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `design/${path}_${Date.now()}`);
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

  const handleSaveTournament = () => {
    if (!db || !isAdmin) return;
    if (editingTournamentId) {
      updateDoc(doc(db, "tournaments", editingTournamentId), { ...tournamentForm, updatedAt: serverTimestamp() })
        .then(() => { toast({ title: "Mis à jour !" }); setEditingTournamentId(null); setTournamentForm(initialTournamentState); });
    } else {
      addDoc(collection(db, "tournaments"), { ...tournamentForm, teamsRegistered: 0, createdAt: serverTimestamp() })
        .then(() => { toast({ title: "Publié !" }); setTournamentForm(initialTournamentState); });
    }
  };

  const handleDelete = (coll: string, id: string) => {
    if (confirm("Supprimer ?")) deleteDoc(doc(db, coll, id)).then(() => toast({ title: "Supprimé" }));
  };

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
  if (!isAdmin) return <div className="p-20 text-center flex flex-col items-center gap-6"><ShieldCheck className="w-16 h-16 text-destructive" /><h2 className="text-3xl font-bold uppercase">Accès Admin Requis</h2><Button variant="destructive" onClick={() => auth && signOut(auth)}>Se déconnecter</Button></div>;

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 bg-background min-h-screen">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b pb-8">
        <h1 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tighter">Console Admin</h1>
        <div className="flex items-center gap-4">
          <Badge className="bg-primary px-4 py-2 font-black">PROPRIÉTAIRE</Badge>
          <Button variant="outline" onClick={() => auth && signOut(auth)} className="rounded-full font-bold">Quitter</Button>
        </div>
      </header>

      <Tabs defaultValue="tournaments" className="w-full">
        <TabsList className="bg-muted p-1 rounded-2xl mb-12 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="tournaments" className="flex-1 uppercase font-black text-[10px] md:text-xs py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">Tournois</TabsTrigger>
          <TabsTrigger value="registrations" className="flex-1 uppercase font-black text-[10px] md:text-xs py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">Inscriptions</TabsTrigger>
          <TabsTrigger value="config" className="flex-1 uppercase font-black text-[10px] md:text-xs py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2"><Settings className="w-4 h-4" /> Design</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-10">
          <Card className="rounded-[2rem] overflow-hidden border-none shadow-xl">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="font-headline font-black uppercase">Design Immersif</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="font-black uppercase text-[10px] tracking-widest text-primary">Image Accueil (Hero)</Label>
                  <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-100" onClick={() => heroUploadRef.current?.click()}>
                    {configForm.heroImageUrl ? <img src={configForm.heroImageUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-10 h-10 text-muted-foreground" /></div>}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Upload className="w-8 h-8 text-white" /></div>
                    {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                  </div>
                  <input type="file" ref={heroUploadRef} className="hidden" onChange={(e) => handleStorageUpload(e, 'hero', (url) => setConfigForm({...configForm, heroImageUrl: url}))} />
                </div>
                <div className="space-y-4">
                  <Label className="font-black uppercase text-[10px] tracking-widest text-primary">Image After Cup</Label>
                  <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-100" onClick={() => afterCupUploadRef.current?.click()}>
                    {configForm.afterCupImageUrl ? <img src={configForm.afterCupImageUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-10 h-10 text-muted-foreground" /></div>}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Upload className="w-8 h-8 text-white" /></div>
                  </div>
                  <input type="file" ref={afterCupUploadRef} className="hidden" onChange={(e) => handleStorageUpload(e, 'aftercup', (url) => setConfigForm({...configForm, afterCupImageUrl: url}))} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t">
                <div className="space-y-2"><Label className="font-black uppercase text-[10px]">Titre Principal</Label><Input value={configForm.heroTitle} onChange={e => setConfigForm({...configForm, heroTitle: e.target.value})} className="h-12 rounded-xl" /></div>
                <div className="space-y-2"><Label className="font-black uppercase text-[10px]">Sous-titre</Label><Textarea value={configForm.heroSubtitle} onChange={e => setConfigForm({...configForm, heroSubtitle: e.target.value})} className="rounded-xl" /></div>
              </div>

              <Button onClick={() => db && setDoc(doc(db, "settings", "config"), configForm, { merge: true }).then(() => toast({ title: "Design Sauvegardé !" }))} className="w-full h-16 font-black uppercase text-lg rounded-2xl bg-primary shadow-xl">
                <Save className="w-5 h-5 mr-3" /> Appliquer les changements
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-10">
          <Card className="rounded-[2rem] border-none shadow-xl">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="font-headline font-black uppercase">{editingTournamentId ? "Modifier" : "Publier"} un Tournoi</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2"><Label className="font-black uppercase text-[10px]">Nom</Label><Input value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} className="h-12 rounded-xl" /></div>
                <div className="space-y-2"><Label className="font-black uppercase text-[10px]">Lieu (Stade)</Label><Input value={tournamentForm.locationStade} onChange={e => setTournamentForm({...tournamentForm, locationStade: e.target.value})} className="h-12 rounded-xl" /></div>
                <div className="space-y-2"><Label className="font-black uppercase text-[10px]">Équipes Max</Label><Input type="number" value={tournamentForm.maxTeams} onChange={e => setTournamentForm({...tournamentForm, maxTeams: Number(e.target.value)})} className="h-12 rounded-xl" /></div>
              </div>
              <Button onClick={handleSaveTournament} className="w-full h-14 font-black uppercase rounded-xl">Enregistrer le tournoi</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournaments?.map((t: any) => (
              <Card key={t.id} className="p-6 flex items-center justify-between rounded-3xl border-none shadow-sm bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center"><Trophy className="w-6 h-6" /></div>
                  <div><h3 className="font-black uppercase text-sm">{t.name}</h3><p className="text-[10px] font-bold text-muted-foreground">{t.locationStade}</p></div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => { setEditingTournamentId(t.id); setTournamentForm({...t}); }}><Edit2 className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="hover:text-destructive" onClick={() => handleDelete('tournaments', t.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-6">
          {registrations?.map((r: any) => (
            <Card key={r.id} className="p-8 rounded-[2rem] border-none shadow-sm bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <h4 className="font-black uppercase text-xl tracking-tighter">{r.teamName}</h4>
                  <Badge className="bg-green-500 font-black">{r.status}</Badge>
                </div>
                <p className="font-bold text-xs text-muted-foreground uppercase">{r.captainName} • {r.contactPhone}</p>
                <Badge variant="outline" className="border-primary text-primary font-black uppercase text-[9px]">{r.tournamentName}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => window.open(`https://wa.me/${r.contactPhone.replace(/\D/g, '')}`, '_blank')} className="h-12 px-6 gap-2 rounded-xl border-green-500 text-green-500 font-black uppercase text-xs">
                  <MessageCircle className="w-5 h-5" /> WhatsApp
                </Button>
                <Button size="icon" variant="ghost" className="h-12 w-12 hover:text-destructive" onClick={() => handleDelete('registrations', r.id)}><Trash2 className="w-5 h-5" /></Button>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

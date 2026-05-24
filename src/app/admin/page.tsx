"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Trophy, Plus, Trash2, ShieldCheck, Loader2, Upload, Settings, Save, Edit2, MessageCircle, Users, LayoutDashboard, Image as ImageIcon } from "lucide-react";
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
    name: "", 
    gameType: "Football", 
    startDate: "", 
    endDate: "", 
    registrationDeadline: "", 
    entryFee: 0, 
    maxTeams: 16, 
    description: "", 
    imageUrl: "",
    locationStade: "",
    locationCommune: "",
    locationAdresse: "",
    teaserVideoUrl: ""
  };

  const [tournamentForm, setTournamentForm] = useState(initialTournamentState);

  const initialSponsorState = {
    name: "",
    logoUrl: "",
    websiteUrl: "",
    category: "Partenaire Officiel"
  };

  const [sponsorForm, setSponsorForm] = useState(initialSponsorState);

  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configForm, setConfigForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    heroImageUrl: "",
    afterCupImageUrl: "",
    currentPrizePool: 0,
    targetPrizePool: 0,
    statSchools: "",
    statMatches: "",
    statTalents: ""
  });

  useEffect(() => {
    if (siteConfig) {
      setConfigForm({
        heroTitle: siteConfig.heroTitle || "DEVENEZ UNE LÉGENDE.\nLA GLOIRE VOUS APPELLE.",
        heroSubtitle: siteConfig.heroSubtitle || "ONECUP 2026 : L'événement unique où le talent rencontre l'excellence.",
        heroImageUrl: siteConfig.heroImageUrl || "",
        afterCupImageUrl: siteConfig.afterCupImageUrl || "",
        currentPrizePool: siteConfig.currentPrizePool || 0,
        targetPrizePool: siteConfig.targetPrizePool || 5000000,
        statSchools: siteConfig.statSchools || "32+",
        statMatches: siteConfig.statMatches || "15+",
        statTalents: siteConfig.statTalents || "257+"
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
      toast({ title: "Image téléversée avec succès !" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erreur lors du téléversement" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'tournament' | 'sponsor') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'tournament') {
          setTournamentForm(prev => ({ ...prev, imageUrl: base64 }));
        } else if (type === 'sponsor') {
          setSponsorForm(prev => ({ ...prev, logoUrl: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSiteConfig = (data: any) => {
    if (!db || !isAdmin) return;
    setIsSavingConfig(true);
    setDoc(doc(db, "settings", "config"), data, { merge: true })
      .then(() => toast({ title: "Configuration sauvegardée !" }))
      .catch(e => console.error(e))
      .finally(() => setIsSavingConfig(false));
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      toast({ title: "Déconnexion réussie" });
    }
  };

  const handleSaveTournament = () => {
    if (!db || !isAdmin || !user) return;
    
    if (editingTournamentId) {
      updateDoc(doc(db, "tournaments", editingTournamentId), {
        ...tournamentForm,
        updatedAt: serverTimestamp()
      }).then(() => {
        toast({ title: "Tournoi mis à jour !" });
        setEditingTournamentId(null);
        setTournamentForm(initialTournamentState);
      });
    } else {
      const data = { 
        ...tournamentForm, 
        organizerId: user.uid, 
        teamsRegistered: 0, 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp() 
      };
      addDoc(collection(db, "tournaments"), data).then(() => {
        toast({ title: "Nouveau tournoi publié !" });
        setTournamentForm(initialTournamentState);
      });
    }
  };

  const handleSaveSponsor = () => {
    if (!db || !isAdmin) return;
    if (editingSponsorId) {
      updateDoc(doc(db, "sponsors", editingSponsorId), {
        ...sponsorForm,
        updatedAt: serverTimestamp()
      }).then(() => {
        toast({ title: "Partenaire mis à jour !" });
        setEditingSponsorId(null);
        setSponsorForm(initialSponsorState);
      });
    } else {
      addDoc(collection(db, "sponsors"), {
        ...sponsorForm,
        createdAt: serverTimestamp()
      }).then(() => {
        toast({ title: "Nouveau partenaire ajouté !" });
        setSponsorForm(initialSponsorState);
      });
    }
  };

  const startEditTournament = (t: any) => {
    setEditingTournamentId(t.id);
    setTournamentForm({ ...t });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditSponsor = (s: any) => {
    setEditingSponsorId(s.id);
    setSponsorForm({ ...s });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (coll: string, id: string) => {
    if (!db || !isAdmin) return;
    if (confirm("Voulez-vous vraiment supprimer cet élément ?")) {
      deleteDoc(doc(db, coll, id)).then(() => toast({ title: "Élément supprimé" }));
    }
  };

  const openWhatsApp = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
  
  if (!isAdmin) return (
    <div className="p-10 md:p-20 text-center flex flex-col items-center gap-6">
      <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-destructive" />
      <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter">Accès Administrateur Requis</h2>
      <p className="text-muted-foreground text-sm">Vous n'avez pas les droits pour accéder à cette console.</p>
      {user && <Button variant="destructive" onClick={handleLogout} className="rounded-full px-8 h-12">Changer de compte</Button>}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-12 bg-background min-h-screen">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b pb-8">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-headline font-bold uppercase tracking-tighter">Console Admin</h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">Gestion dynamique du site.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary text-white px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[9px] md:text-xs">Admin</Badge>
          <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full text-[9px] md:text-xs uppercase font-bold h-8">Déconnexion</Button>
        </div>
      </header>

      <Tabs defaultValue="tournaments" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl md:rounded-2xl mb-8 md:mb-12 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="tournaments" className="flex-1 uppercase font-bold text-[9px] md:text-[10px] py-2.5 md:py-3 rounded-lg md:rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Tournois</TabsTrigger>
          <TabsTrigger value="registrations" className="flex-1 uppercase font-bold text-[9px] md:text-[10px] py-2.5 md:py-3 rounded-lg md:rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Inscriptions</TabsTrigger>
          <TabsTrigger value="sponsors" className="flex-1 uppercase font-bold text-[9px] md:text-[10px] py-2.5 md:py-3 rounded-lg md:rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Sponsors</TabsTrigger>
          <TabsTrigger value="config" className="flex-1 uppercase font-bold text-[9px] md:text-[10px] py-2.5 md:py-3 rounded-lg md:rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-1 md:gap-2"><Settings className="w-3 h-3" /> Config</TabsTrigger>
        </TabsList>

        <TabsContent value="tournaments" className="space-y-8 md:space-y-10">
          <Card className="border-primary/20 shadow-xl rounded-2xl md:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
              <CardTitle className="text-xl md:text-2xl uppercase font-headline font-bold">{editingTournamentId ? "Modifier" : "Publier"} un Tournoi</CardTitle>
              <CardDescription className="text-xs md:text-sm">Les modifications sont appliquées instantanément.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Nom</Label><Input value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" placeholder="Ex: OneCup Football" /></div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] md:text-[10px] font-bold uppercase">Type</Label>
                  <Select value={tournamentForm.gameType} onValueChange={(val) => setTournamentForm({...tournamentForm, gameType: val})}>
                    <SelectTrigger className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Football">Football</SelectItem><SelectItem value="PlayStation">PlayStation</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Date</Label><Input type="date" value={tournamentForm.startDate} onChange={e => setTournamentForm({...tournamentForm, startDate: e.target.value})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Stade</Label><Input value={tournamentForm.locationStade} onChange={e => setTournamentForm({...tournamentForm, locationStade: e.target.value})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" placeholder="Ex: Stade des Martyrs" /></div>
                <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Commune</Label><Input value={tournamentForm.locationCommune} onChange={e => setTournamentForm({...tournamentForm, locationCommune: e.target.value})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" placeholder="Ex: Lingwala" /></div>
                <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Équipes Max</Label><Input type="number" value={tournamentForm.maxTeams} onChange={e => setTournamentForm({...tournamentForm, maxTeams: Number(e.target.value)})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" /></div>
              </div>

              <div className="space-y-6 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-3">
                    <Label className="text-[9px] md:text-[10px] font-bold uppercase">Affiche du Tournoi</Label>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'tournament')} accept="image/*" />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full h-16 md:h-24 border-dashed rounded-xl md:rounded-2xl gap-2 md:gap-3 text-[9px] md:text-xs uppercase font-bold">
                      <Upload className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Sélectionner l'image
                    </Button>
                    {tournamentForm.imageUrl && <img src={tournamentForm.imageUrl} className="w-full aspect-video object-cover rounded-xl border shadow-md" alt="Preview" />}
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[9px] md:text-[10px] font-bold uppercase">Lien Vidéo Teaser (YT)</Label>
                    <Input value={tournamentForm.teaserVideoUrl} onChange={e => setTournamentForm({...tournamentForm, teaserVideoUrl: e.target.value})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" placeholder="Lien YouTube" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] md:text-[10px] font-bold uppercase">Description & Règlement</Label>
                  <Textarea value={tournamentForm.description} onChange={e => setTournamentForm({...tournamentForm, description: e.target.value})} className="min-h-[120px] md:min-h-[150px] rounded-xl md:rounded-2xl p-4 text-sm" />
                </div>
              </div>
              <Button onClick={handleSaveTournament} className="w-full h-14 md:h-16 uppercase font-black text-base md:text-lg bg-primary rounded-xl md:rounded-2xl transition-all">
                {editingTournamentId ? "Enregistrer les modifications" : "Publier le Tournoi"}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {tournaments?.map((t: any) => (
              <Card key={t.id} className="p-4 md:p-6 flex items-center justify-between border-white/5 bg-card/50 rounded-2xl md:rounded-3xl group shadow-sm">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs md:text-sm uppercase">{t.name}</h3>
                    <p className="text-[9px] text-muted-foreground uppercase">{t.gameType} • {t.locationStade}</p>
                  </div>
                </div>
                <div className="flex gap-1 md:gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 md:h-10 md:w-10" onClick={() => startEditTournament(t)}><Edit2 className="w-3.5 h-3.5 md:w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 md:h-10 md:w-10 hover:text-destructive" onClick={() => handleDelete('tournaments', t.id)}><Trash2 className="w-3.5 h-3.5 md:w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-8 md:space-y-10">
          <Card className="border-primary/20 shadow-xl rounded-2xl md:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
              <CardTitle className="text-xl md:text-2xl uppercase font-headline font-bold">Design & Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8 md:space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Image Accueil */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Bannière Accueil (Hero)</Label>
                  <div 
                    className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-primary/20 group cursor-pointer bg-muted"
                    onClick={() => heroUploadRef.current?.click()}
                  >
                    {configForm.heroImageUrl ? (
                      <img src={configForm.heroImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Hero" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        <span className="text-[9px] font-bold uppercase text-muted-foreground">Sélectionner</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <input type="file" ref={heroUploadRef} className="hidden" onChange={(e) => handleStorageUpload(e, 'hero', (url) => setConfigForm({...configForm, heroImageUrl: url}))} accept="image/*" />
                </div>

                {/* Image After Cup */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Bannière After Cup</Label>
                  <div 
                    className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-primary/20 group cursor-pointer bg-muted"
                    onClick={() => afterCupUploadRef.current?.click()}
                  >
                    {configForm.afterCupImageUrl ? (
                      <img src={configForm.afterCupImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="After Cup" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        <span className="text-[9px] font-bold uppercase text-muted-foreground">Sélectionner</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input type="file" ref={afterCupUploadRef} className="hidden" onChange={(e) => handleStorageUpload(e, 'aftercup', (url) => setConfigForm({...configForm, afterCupImageUrl: url}))} accept="image/*" />
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Titre Hero</Label><Input value={configForm.heroTitle} onChange={e => setConfigForm({...configForm, heroTitle: e.target.value})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" /></div>
                  <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Sous-titre Hero</Label><Textarea value={configForm.heroSubtitle} onChange={e => setConfigForm({...configForm, heroSubtitle: e.target.value})} className="rounded-lg md:rounded-xl min-h-[48px] text-sm" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 border-t pt-6">
                  <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Cagnotte Actuelle</Label><Input type="number" value={configForm.currentPrizePool} onChange={e => setConfigForm({...configForm, currentPrizePool: Number(e.target.value)})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" /></div>
                  <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Objectif Cagnotte</Label><Input type="number" value={configForm.targetPrizePool} onChange={e => setConfigForm({...configForm, targetPrizePool: Number(e.target.value)})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 border-t pt-6">
                  <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Stat: Écoles</Label><Input value={configForm.statSchools} onChange={e => setConfigForm({...configForm, statSchools: e.target.value})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" /></div>
                  <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Stat: Matchs</Label><Input value={configForm.statMatches} onChange={e => setConfigForm({...configForm, statMatches: e.target.value})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" /></div>
                  <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Stat: Talents</Label><Input value={configForm.statTalents} onChange={e => setConfigForm({...configForm, statTalents: e.target.value})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" /></div>
                </div>
              </div>
              <Button onClick={() => updateSiteConfig(configForm)} className="w-full h-14 md:h-16 uppercase font-black text-base md:text-lg bg-primary rounded-xl md:rounded-2xl" disabled={isSavingConfig}>
                {isSavingConfig ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-5 h-5 mr-3" /> } Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sponsors" className="space-y-8 md:space-y-10">
          <Card className="border-primary/20 shadow-xl rounded-2xl md:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
              <CardTitle className="text-xl md:text-2xl uppercase font-headline font-bold">{editingSponsorId ? "Modifier" : "Ajouter"} un Sponsor</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Nom du Sponsor</Label><Input value={sponsorForm.name} onChange={e => setSponsorForm({...sponsorForm, name: e.target.value})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Catégorie</Label><Input value={sponsorForm.category} onChange={e => setSponsorForm({...sponsorForm, category: e.target.value})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-[9px] md:text-[10px] font-bold uppercase">Site Web</Label><Input value={sponsorForm.websiteUrl} onChange={e => setSponsorForm({...sponsorForm, websiteUrl: e.target.value})} className="h-11 md:h-12 rounded-lg md:rounded-xl text-sm" /></div>
                <div className="space-y-3">
                    <Label className="text-[9px] md:text-[10px] font-bold uppercase">Logo</Label>
                    <input type="file" ref={sponsorLogoRef} className="hidden" onChange={(e) => handleFileUpload(e, 'sponsor')} accept="image/*" />
                    <Button variant="outline" onClick={() => sponsorLogoRef.current?.click()} className="w-full h-11 rounded-lg md:rounded-xl gap-2 text-[9px] md:text-xs uppercase font-bold border-dashed">
                      <Upload className="w-4 h-4" /> Charger
                    </Button>
                    {sponsorForm.logoUrl && <img src={sponsorForm.logoUrl} className="h-16 md:h-20 object-contain mx-auto border rounded-xl p-2 bg-white" alt="Logo" />}
                </div>
              </div>
              <Button onClick={handleSaveSponsor} className="w-full h-12 md:h-14 bg-primary uppercase font-bold rounded-lg md:rounded-xl mt-4">
                {editingSponsorId ? "Mettre à jour" : "Ajouter"}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sponsors?.map((s: any) => (
              <Card key={s.id} className="p-4 border-white/5 bg-card flex flex-col items-center gap-3 rounded-2xl relative group">
                <img src={s.logoUrl} className="h-12 md:h-16 object-contain bg-white rounded-lg p-2" alt={s.name} />
                <div className="text-center">
                  <p className="font-bold text-[10px] uppercase truncate max-w-[120px]">{s.name}</p>
                </div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" onClick={() => startEditSponsor(s)} className="h-7 w-7 rounded-full bg-background/80"><Edit2 className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete('sponsors', s.id)} className="h-7 w-7 rounded-full bg-background/80 hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {registrations?.map((r: any) => (
              <Card key={r.id} className="p-5 md:p-6 border-white/5 bg-card/50 rounded-2xl md:rounded-[2rem] shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                  <div className="space-y-1.5 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <p className="font-black uppercase text-base md:text-lg tracking-tighter">{r.teamName}</p>
                      <Badge className="bg-green-500/10 text-green-500 text-[8px] md:text-[9px] uppercase font-bold">{r.status}</Badge>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{r.captainName} • {r.contactPhone}</p>
                    <p className="text-[10px] md:text-xs text-primary font-black uppercase tracking-tighter">{r.tournamentName}</p>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={() => openWhatsApp(r.contactPhone)} className="flex-1 md:flex-none h-11 px-5 md:px-6 gap-2 text-green-500 border-green-500/30 hover:bg-green-500/10 rounded-xl md:rounded-2xl font-bold uppercase text-[10px] md:text-xs transition-all">
                      <MessageCircle className="w-4 h-4 md:w-5 md:h-5" /> WhatsApp
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete('registrations', r.id)} className="h-11 w-11 rounded-xl md:rounded-2xl hover:text-destructive"><Trash2 className="w-4 h-4 md:w-5 md:h-5" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

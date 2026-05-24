
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Trophy, Plus, Trash2, ShieldCheck, Loader2, Upload, 
  Settings, Save, Edit2, ImageIcon, Palette, 
  Layout, Users, Image as ImageLucide, Clock, RotateCcw,
  CheckCircle2, AlertCircle
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
  setDoc, updateDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "firebase/auth";
import { Separator } from "@/components/ui/separator";

const ADMIN_EMAIL = "onecup2026@gmail.com";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);

  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: siteConfig } = useDoc(configRef);

  const [isUploading, setIsUploading] = useState(false);
  const [configForm, setConfigForm] = useState({
    logoUrl: "",
    primaryColor: "211 100% 32%",
    secondaryColor: "224 71% 4%",
    accentColor: "211 100% 45%",
    borderRadius: "0.5",
    heroTitle: "", 
    carouselImages: ["", "", "", ""],
    afterCupImageUrl: "", 
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
        logoUrl: siteConfig.logoUrl || "",
        primaryColor: siteConfig.primaryColor || "211 100% 32%",
        secondaryColor: siteConfig.secondaryColor || "224 71% 4%",
        accentColor: siteConfig.accentColor || "211 100% 45%",
        borderRadius: siteConfig.borderRadius || "0.5",
        heroTitle: siteConfig.heroTitle || "",
        carouselImages: Array.isArray(siteConfig.carouselImages) ? siteConfig.carouselImages : ["", "", "", ""],
        afterCupImageUrl: siteConfig.afterCupImageUrl || "",
        afterCupDescription: siteConfig.afterCupDescription || "",
        targetDate: siteConfig.targetDate || "2026-07-15T00:00:00"
      });
    }
  }, [siteConfig]);

  const handleStorageUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({ variant: "destructive", title: "Fichier trop volumineux", description: "La taille max est de 5Mo." });
      return;
    }

    setIsUploading(true);
    try {
      const extension = file.name.split('.').pop();
      const fileName = `${path}_${Date.now()}.${extension}`;
      const storageRef = ref(storage, `${path}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      callback(url);
      toast({ title: "Fichier sauvegardé avec succès" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur de téléversement" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!db || !isAdmin) return;
    try {
      await setDoc(doc(db, "settings", "config"), configForm, { merge: true });
      toast({ title: "Paramètres mis à jour", description: "Les changements sont visibles instantanément." });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur lors de la sauvegarde" });
    }
  };

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
  if (!isAdmin) return <div className="p-20 text-center font-black">ACCÈS RÉSERVÉ</div>;

  return (
    <div className="bg-[#f3f3f3] min-h-screen pb-20">
      <header className="bg-primary text-white py-16 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter">Elite Management</h1>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Contrôle dynamique du site en temps réel</p>
          </div>
          <Button variant="outline" onClick={() => auth && signOut(auth)} className="text-white border-white/20 uppercase font-black text-[10px] h-12 px-8">Déconnexion</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 -mt-10">
        <Tabs defaultValue="theme">
          <TabsList className="bg-white p-2 rounded-2xl mb-12 shadow-xl border overflow-x-auto h-auto flex flex-nowrap w-fit">
            <TabsTrigger value="theme" className="px-8 py-3 font-black uppercase text-[10px] gap-2"><Palette className="w-3 h-3" /> Thème & Logo</TabsTrigger>
            <TabsTrigger value="design" className="px-8 py-3 font-black uppercase text-[10px] gap-2"><Layout className="w-3 h-3" /> Accueil & Chrono</TabsTrigger>
            <TabsTrigger value="tournaments" className="px-8 py-3 font-black uppercase text-[10px] gap-2"><Trophy className="w-3 h-3" /> Tournois</TabsTrigger>
          </TabsList>

          <TabsContent value="theme">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Logo & Radius */}
                <div className="space-y-8">
                  <h3 className="text-xl font-headline font-black uppercase tracking-tight">Identité Visuelle</h3>
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Logo Principal (SVG/PNG)</Label>
                    <div className="relative h-32 w-full rounded-2xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-50 flex items-center justify-center" onClick={() => logoUploadRef.current?.click()}>
                      {configForm.logoUrl ? <img src={configForm.logoUrl} className="max-h-20 object-contain" /> : <div className="flex flex-col items-center gap-2"><Upload className="w-6 h-6 text-slate-200" /><span className="text-[8px] uppercase font-black text-slate-300">Choisir un fichier</span></div>}
                      <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <input type="file" ref={logoUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'branding', (url) => setConfigForm({...configForm, logoUrl: url}))} />
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Arrondi des éléments ({configForm.borderRadius}rem)</Label>
                    <Input type="range" min="0" max="3" step="0.1" value={configForm.borderRadius} onChange={e => setConfigForm({...configForm, borderRadius: e.target.value})} className="h-4 accent-primary" />
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-8">
                  <h3 className="text-xl font-headline font-black uppercase tracking-tight">Palette de Couleurs (HSL)</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Couleur Primaire (ex: 211 100% 32%)</Label>
                      <div className="flex gap-4">
                        <Input value={configForm.primaryColor} onChange={e => setConfigForm({...configForm, primaryColor: e.target.value})} className="h-12 rounded-xl" />
                        <div className="w-12 h-12 rounded-xl border" style={{ backgroundColor: `hsl(${configForm.primaryColor})` }} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Couleur Secondaire</Label>
                      <div className="flex gap-4">
                        <Input value={configForm.secondaryColor} onChange={e => setConfigForm({...configForm, secondaryColor: e.target.value})} className="h-12 rounded-xl" />
                        <div className="w-12 h-12 rounded-xl border" style={{ backgroundColor: `hsl(${configForm.secondaryColor})` }} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Couleur d'Accent</Label>
                      <div className="flex gap-4">
                        <Input value={configForm.accentColor} onChange={e => setConfigForm({...configForm, accentColor: e.target.value})} className="h-12 rounded-xl" />
                        <div className="w-12 h-12 rounded-xl border" style={{ backgroundColor: `hsl(${configForm.accentColor})` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col md:flex-row gap-6">
                <Button onClick={handleSaveConfig} className="flex-1 h-16 rounded-2xl font-black uppercase text-sm bg-primary shadow-xl glow-blue gap-2"><Save className="w-4 h-4" /> Enregistrer le thème</Button>
                <Button variant="outline" className="h-16 rounded-2xl font-black uppercase text-xs px-10 gap-2"><RotateCcw className="w-4 h-4" /> Réinitialiser</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="design">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-12">
              <div className="space-y-6">
                <h3 className="text-xl font-headline font-black uppercase tracking-tight">Carousel Hero Principal (4 Photos)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {configForm.carouselImages.map((img, idx) => (
                    <div key={idx} className="space-y-4">
                      <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Diapositive {idx + 1}</Label>
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-50" onClick={() => carouselUploadRefs[idx].current?.click()}>
                        {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageLucide className="w-8 h-8 text-slate-200" /></div>}
                        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <input type="file" ref={carouselUploadRefs[idx]} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'carousel', (url) => {
                        const newImgs = [...configForm.carouselImages];
                        newImgs[idx] = url;
                        setConfigForm({...configForm, carouselImages: newImgs});
                      })} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t pt-10">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="font-black uppercase text-[10px] tracking-widest">Titre Hero Principal</Label>
                    <Input value={configForm.heroTitle} onChange={e => setConfigForm({...configForm, heroTitle: e.target.value})} className="h-14 rounded-xl border-slate-100" />
                  </div>
                  <div className="space-y-4">
                    <Label className="font-black uppercase text-[10px] flex items-center gap-2 tracking-widest"><Clock className="w-3 h-3 text-primary" /> Échéance du Compte à Rebours</Label>
                    <Input 
                      type="datetime-local" 
                      value={configForm.targetDate.slice(0, 16)} 
                      onChange={e => setConfigForm({...configForm, targetDate: e.target.value})} 
                      className="h-14 rounded-xl border-slate-100" 
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <Label className="font-black uppercase text-[10px] tracking-widest">Section After Cup</Label>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed bg-slate-50 cursor-pointer" onClick={() => afterCupUploadRef.current?.click()}>
                    {configForm.afterCupImageUrl ? <img src={configForm.afterCupImageUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-200" /></div>}
                    <div className="absolute inset-0 bg-primary/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
                       <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input type="file" ref={afterCupUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'design', (url) => setConfigForm({...configForm, afterCupImageUrl: url}))} />
                  <Textarea 
                    placeholder="Description courte (2 lignes max)" 
                    value={configForm.afterCupDescription} 
                    onChange={e => setConfigForm({...configForm, afterCupDescription: e.target.value})}
                    className="mt-4 rounded-xl h-24 border-slate-100"
                  />
                </div>
              </div>

              <Button onClick={handleSaveConfig} className="w-full h-20 rounded-3xl font-black uppercase text-xl bg-primary shadow-xl glow-blue">Mettre à jour le design</Button>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-8">
             <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-6">
              <h3 className="text-xl font-headline font-black uppercase tracking-tight">Nouveau Tournoi Elite</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="font-black uppercase text-[10px] tracking-widest">Image de Couverture</Label>
                  <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-50" onClick={() => tournamentUploadRef.current?.click()}>
                    {tournamentForm.imageUrl ? <img src={tournamentForm.imageUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center flex-col gap-2"><ImageIcon className="w-8 h-8 text-slate-200" /><span className="text-[8px] uppercase font-black text-slate-300 tracking-widest">Téléverser</span></div>}
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input type="file" ref={tournamentUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'tournaments', (url) => setTournamentForm(f => ({...f, imageUrl: url})))} />
                </div>
                <div className="space-y-4">
                  <Input placeholder="Nom du tournoi" value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} className="h-12 rounded-xl border-slate-100" />
                  <Input placeholder="Lieu / Stade" value={tournamentForm.locationStade} onChange={e => setTournamentForm({...tournamentForm, locationStade: e.target.value})} className="h-12 rounded-xl border-slate-100" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="date" value={tournamentForm.startDate} onChange={e => setTournamentForm({...tournamentForm, startDate: e.target.value})} className="h-12 rounded-xl border-slate-100" />
                    <Input type="number" placeholder="Max Equipes" value={tournamentForm.maxTeams} onChange={e => setTournamentForm({...tournamentForm, maxTeams: parseInt(e.target.value)})} className="h-12 rounded-xl border-slate-100" />
                  </div>
                  <Textarea placeholder="Description détaillée" value={tournamentForm.description} onChange={e => setTournamentForm({...tournamentForm, description: e.target.value})} className="rounded-xl h-24 border-slate-100" />
                </div>
              </div>
              <Button onClick={() => addDoc(collection(db!, "tournaments"), {...tournamentForm, createdAt: serverTimestamp()}).then(() => {
                toast({ title: "Tournoi publié avec succès" });
                setTournamentForm({name:"", gameType:"Football", startDate:"", locationStade:"", maxTeams:16, entryFee:0, description:"", imageUrl:"", teamsRegistered: 0});
              })} className="w-full h-16 rounded-2xl font-black uppercase bg-primary glow-blue">Lancer le tournoi</Button>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments?.map((t: any) => (
                <Card key={t.id} className="rounded-3xl p-6 bg-white shadow-sm border-none flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100">
                      <img src={t.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black uppercase text-[10px] line-clamp-1">{t.name}</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.locationStade}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-200 hover:text-destructive" onClick={() => deleteDoc(doc(db!, "tournaments", t.id))}><Trash2 className="w-4 h-4" /></Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

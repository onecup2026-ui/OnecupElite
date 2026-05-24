"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Trophy, Plus, Trash2, ShieldCheck, Loader2, Upload, 
  Settings, Save, Edit2, MessageCircle, ImageIcon, 
  Layout, Newspaper, Users, Info, Ticket as TicketIcon,
  Search, Image as ImageLucide, Clock
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
  
  const carouselUploadRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const afterCupUploadRef = useRef<HTMLInputElement>(null);
  const tournamentUploadRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const sponsorsRef = useMemo(() => (db ? collection(db, "sponsors") : null), [db]);
  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);

  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: sponsors } = useCollection(sponsorsRef);
  const { data: siteConfig } = useDoc(configRef);

  const [isUploading, setIsUploading] = useState(false);

  const [configForm, setConfigForm] = useState({
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

  const [sponsorForm, setSponsorForm] = useState({
    name: "", logoUrl: "", websiteUrl: "", category: "Partenaire"
  });

  useEffect(() => {
    if (siteConfig) {
      setConfigForm({ 
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

  const handleSaveConfig = async () => {
    if (!db || !isAdmin) return;
    try {
      await setDoc(doc(db, "settings", "config"), configForm, { merge: true });
      toast({ title: "Paramètres mis à jour" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur lors de la sauvegarde" });
    }
  };

  if (userLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
  if (!isAdmin) return <div className="p-20 text-center font-black">ACCÈS RÉSERVÉ</div>;

  return (
    <div className="bg-[#f3f3f3] min-h-screen pb-20">
      <header className="bg-primary text-white py-20 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter">Console Admin</h1>
          <Button variant="outline" onClick={() => auth && signOut(auth)} className="text-white border-white/20 uppercase font-bold text-[10px]">Déconnexion</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 -mt-10">
        <Tabs defaultValue="design">
          <TabsList className="bg-white p-2 rounded-2xl mb-12 shadow-xl border overflow-x-auto h-auto flex flex-nowrap">
            <TabsTrigger value="design" className="px-8 py-3 font-black uppercase text-[10px]">Design & Chrono</TabsTrigger>
            <TabsTrigger value="tournaments" className="px-8 py-3 font-black uppercase text-[10px]">Tournois</TabsTrigger>
            <TabsTrigger value="sponsors" className="px-8 py-3 font-black uppercase text-[10px]">Sponsors</TabsTrigger>
          </TabsList>

          <TabsContent value="design">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Carousel Hero (4 Photos)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {configForm.carouselImages.map((img, idx) => (
                    <div key={idx} className="space-y-4">
                      <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Photo {idx + 1}</Label>
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-50" onClick={() => carouselUploadRefs[idx].current?.click()}>
                        {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageLucide className="w-8 h-8 text-slate-200" /></div>}
                        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                          <Upload className="w-8 h-8 text-white" />
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
                    <Label className="font-black uppercase text-xs tracking-widest">Titre Hero Principal</Label>
                    <Input value={configForm.heroTitle} onChange={e => setConfigForm({...configForm, heroTitle: e.target.value})} className="h-14 rounded-xl border-slate-100" />
                  </div>
                  <div className="space-y-4">
                    <Label className="font-black uppercase text-xs flex items-center gap-2 tracking-widest"><Clock className="w-4 h-4 text-primary" /> Date du Compte à Rebours (ISO)</Label>
                    <Input 
                      type="datetime-local" 
                      value={configForm.targetDate.slice(0, 16)} 
                      onChange={e => setConfigForm({...configForm, targetDate: e.target.value})} 
                      className="h-14 rounded-xl border-slate-100" 
                    />
                    <p className="text-[10px] text-muted-foreground uppercase font-bold italic tracking-tighter">Le chrono de l'accueil se basera sur cette date.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label className="font-black uppercase text-xs tracking-widest">Bannière After Cup</Label>
                  <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed bg-slate-50 cursor-pointer" onClick={() => afterCupUploadRef.current?.click()}>
                    {configForm.afterCupImageUrl ? <img src={configForm.afterCupImageUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-200" /></div>}
                    <div className="absolute inset-0 bg-primary/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
                       <Upload className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <input type="file" ref={afterCupUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'design', (url) => setConfigForm({...configForm, afterCupImageUrl: url}))} />
                  <Textarea 
                    placeholder="Description courte After Cup (2 lignes)" 
                    value={configForm.afterCupDescription} 
                    onChange={e => setConfigForm({...configForm, afterCupDescription: e.target.value})}
                    className="mt-4 rounded-xl h-24 border-slate-100"
                  />
                </div>
              </div>

              <Button onClick={handleSaveConfig} className="w-full h-20 rounded-3xl font-black uppercase text-xl bg-primary shadow-xl glow-blue">Appliquer les changements</Button>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-8">
             <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-6">
              <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Nouveau Tournoi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="font-black uppercase text-xs tracking-widest">Image Principale</Label>
                  <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed group cursor-pointer bg-slate-50" onClick={() => tournamentUploadRef.current?.click()}>
                    {tournamentForm.imageUrl ? <img src={tournamentForm.imageUrl} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center flex-col gap-2"><ImageIcon className="w-8 h-8 text-slate-200" /></div>}
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <input type="file" ref={tournamentUploadRef} className="hidden" accept="image/*" onChange={(e) => handleStorageUpload(e, 'tournaments', (url) => setTournamentForm(f => ({...f, imageUrl: url})))} />
                </div>
                <div className="space-y-4">
                  <Input placeholder="Nom du tournoi" value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} className="h-14 rounded-xl border-slate-100" />
                  <Input placeholder="Stade" value={tournamentForm.locationStade} onChange={e => setTournamentForm({...tournamentForm, locationStade: e.target.value})} className="h-14 rounded-xl border-slate-100" />
                  <Input type="date" value={tournamentForm.startDate} onChange={e => setTournamentForm({...tournamentForm, startDate: e.target.value})} className="h-14 rounded-xl border-slate-100" />
                  <Textarea placeholder="Description" value={tournamentForm.description} onChange={e => setTournamentForm({...tournamentForm, description: e.target.value})} className="rounded-xl h-24 border-slate-100" />
                </div>
              </div>
              <Button onClick={() => addDoc(collection(db!, "tournaments"), {...tournamentForm, createdAt: serverTimestamp()}).then(() => {
                toast({ title: "Tournoi publié !" });
                setTournamentForm({name:"", gameType:"Football", startDate:"", locationStade:"", maxTeams:16, entryFee:0, description:"", imageUrl:"", teamsRegistered: 0});
              })} className="w-full h-16 rounded-2xl font-black uppercase bg-primary glow-blue">Publier le tournoi</Button>
            </Card>
          </TabsContent>

          <TabsContent value="sponsors" className="space-y-8">
            <Card className="rounded-[3rem] p-10 bg-white border-none shadow-xl space-y-6">
              <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Nouveau Sponsor</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input placeholder="Nom" value={sponsorForm.name} onChange={e => setSponsorForm({...sponsorForm, name: e.target.value})} className="h-14 rounded-xl border-slate-100" />
                <Input placeholder="Logo URL" value={sponsorForm.logoUrl} onChange={e => setSponsorForm({...sponsorForm, logoUrl: e.target.value})} className="h-14 rounded-xl border-slate-100" />
                <Input placeholder="Site Web" value={sponsorForm.websiteUrl} onChange={e => setSponsorForm({...sponsorForm, websiteUrl: e.target.value})} className="h-14 rounded-xl border-slate-100" />
              </div>
              <Button onClick={() => addDoc(collection(db!, "sponsors"), {...sponsorForm, createdAt: serverTimestamp()}).then(() => {
                toast({ title: "Sponsor ajouté !" });
                setSponsorForm({name:"", logoUrl:"", websiteUrl:"", category:"Partenaire"});
              })} className="w-full h-16 rounded-2xl font-black uppercase bg-primary glow-blue">Ajouter le sponsor</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

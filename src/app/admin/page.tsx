"use client";

import { useState, useMemo } from "react";
import { Trophy, Newspaper, Settings, Plus, Save, Trash2, Image as ImageIcon, ListPlus, Ticket as TicketIcon, Upload, Sparkles, Loader2, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDoc, useCollection, useFirestore } from "@/firebase";
import { doc, setDoc, addDoc, deleteDoc, collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { generateTournamentImage } from "@/ai/flows/ai-image-generator";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();

  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const articlesRef = useMemo(() => (db ? collection(db, "articles") : null), [db]);
  const ticketsRef = useMemo(() => (db ? collection(db, "tickets") : null), [db]);

  const { data: siteConfig } = useDoc(configRef);
  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: articles } = useCollection(articlesRef);
  const { data: tickets } = useCollection(ticketsRef);

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Form states
  const [newTournament, setNewTournament] = useState({
    name: "", sport: "Football", date: "", location: "", prize: "", imageUrl: "", status: "Inscriptions Ouvertes", schedule: [] as { label: string; date: string }[]
  });
  const [scheduleItem, setScheduleItem] = useState({ label: "", date: "" });

  const [newArticle, setNewArticle] = useState({
    title: "", excerpt: "", category: "Tournois", date: new Date().toLocaleDateString(), author: "Admin", imageUrl: ""
  });

  const [newTicket, setNewTicket] = useState({
    title: "", tournamentName: "", price: "", externalUrl: "", description: "", imageUrl: ""
  });

  const [siteImages, setSiteImages] = useState({ heroImageUrl: "" });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        toast({ variant: "destructive", title: "Fichier trop lourd", description: "Veuillez choisir une image de moins de 800KB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
        toast({ title: "Image chargée avec succès" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGeneration = async (prompt: string, context: string, setter: (url: string) => void, id: string) => {
    if (!prompt) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez entrer un titre pour guider l'IA." });
      return;
    }
    setIsGenerating(id);
    try {
      const url = await generateTournamentImage({ prompt, context });
      if (url) {
        setter(url);
        toast({ title: "Image générée par IA" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur IA", description: "La génération a échoué." });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleUpdateConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      heroTitle: formData.get("heroTitle"),
      heroSubtitle: formData.get("heroSubtitle"),
      heroImageUrl: siteImages.heroImageUrl || siteConfig?.heroImageUrl || "",
      currentPrizePool: Number(formData.get("currentPrizePool")),
      targetPrizePool: Number(formData.get("targetPrizePool")),
    };
    setIsSaving(true);
    setDoc(doc(db, "settings", "config"), data, { merge: true })
      .then(() => toast({ title: "Configuration mise à jour" }))
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/settings/config',
          operation: 'write',
          requestResourceData: data
        }));
      })
      .finally(() => setIsSaving(false));
  };

  const handleAddTournament = () => {
    if (!db || !newTournament.name) return;
    addDoc(collection(db, "tournaments"), newTournament)
      .then(() => {
        toast({ title: "Tournoi ajouté" });
        setNewTournament({ name: "", sport: "Football", date: "", location: "", prize: "", imageUrl: "", status: "Inscriptions Ouvertes", schedule: [] });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/tournaments',
          operation: 'create',
          requestResourceData: newTournament
        }));
      });
  };

  const handleAddArticle = () => {
    if (!db || !newArticle.title) return;
    addDoc(collection(db, "articles"), newArticle)
      .then(() => {
        toast({ title: "Article publié" });
        setNewArticle({ title: "", excerpt: "", category: "Tournois", date: new Date().toLocaleDateString(), author: "Admin", imageUrl: "" });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/articles',
          operation: 'create',
          requestResourceData: newArticle
        }));
      });
  };

  const handleAddTicket = () => {
    if (!db || !newTicket.title || !newTicket.externalUrl) {
      toast({ variant: "destructive", title: "Erreur", description: "Le titre et le lien sont obligatoires." });
      return;
    }
    addDoc(collection(db, "tickets"), newTicket)
      .then(() => {
        toast({ title: "Billet ajouté" });
        setNewTicket({ title: "", tournamentName: "", price: "", externalUrl: "", description: "", imageUrl: "" });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/tickets',
          operation: 'create',
          requestResourceData: newTicket
        }));
      });
  };

  const handleDelete = (coll: string, id: string) => {
    if (!db) return;
    deleteDoc(doc(db, coll, id))
      .then(() => toast({ title: "Élément supprimé" }))
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `/${coll}/${id}`,
          operation: 'delete'
        }));
      });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold uppercase tracking-tighter">ADMINISTRATION</h1>
          <p className="text-muted-foreground text-sm">Pilotez votre plateforme OneCup Elite en temps réel.</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary px-4 py-1">MODE ÉDITION ACTIF</Badge>
      </div>

      <Tabs defaultValue="site" className="w-full">
        <TabsList className="flex flex-wrap h-auto p-1 bg-muted rounded-xl mb-6 gap-1 overflow-x-auto no-scrollbar">
          <TabsTrigger value="site" className="flex-1 md:flex-none py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Paramètres</span>
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="flex-1 md:flex-none py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
            <Trophy className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Tournois</span>
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex-1 md:flex-none py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
            <Newspaper className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">News</span>
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex-1 md:flex-none py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
            <TicketIcon className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Billets</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="site" className="space-y-6">
          <Card className="shadow-lg border-white/5">
            <CardHeader><CardTitle className="text-xl">Configuration Accueil & Cagnotte</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateConfig} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Titre Héro</p>
                    <Input name="heroTitle" placeholder="Titre principal" defaultValue={siteConfig?.heroTitle} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Cagnotte Actuelle (€)</p>
                    <Input name="currentPrizePool" type="number" defaultValue={siteConfig?.currentPrizePool || 0} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Sous-titre</p>
                    <Textarea name="heroSubtitle" placeholder="Description courte" defaultValue={siteConfig?.heroSubtitle} className="min-h-[100px]" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Objectif Cagnotte (€)</p>
                    <Input name="targetPrizePool" type="number" defaultValue={siteConfig?.targetPrizePool || 100000} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Image de fond (Héro)</p>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-full sm:w-48 aspect-video rounded-xl border overflow-hidden bg-muted shadow-inner shrink-0">
                      <img src={siteImages.heroImageUrl || siteConfig?.heroImageUrl || "https://picsum.photos/seed/placeholder/400/225"} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 w-full grid grid-cols-2 gap-2">
                      <label className="flex-1">
                        <Button type="button" variant="outline" className="w-full gap-2 cursor-pointer h-12" asChild>
                          <span><Upload className="w-4 h-4" /> Téléverser</span>
                        </Button>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setSiteImages({heroImageUrl: url}))} />
                      </label>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="w-full h-12 gap-2"
                        disabled={isGenerating === 'site'}
                        onClick={() => handleAiGeneration("Un stade de football moderne épique", "cinématique", (url) => setSiteImages({heroImageUrl: url}), 'site')}
                      >
                        {isGenerating === 'site' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} IA
                      </Button>
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={isSaving} className="w-full bg-primary glow-blue h-12 font-bold uppercase">Enregistrer les modifications</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader><CardTitle className="text-xl">Ajouter un Tournoi</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Nom</p>
                  <Input placeholder="ex: Champions League Elite" value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Sport</p>
                  <Input placeholder="Football, Valorant..." value={newTournament.sport} onChange={e => setNewTournament({...newTournament, sport: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Date</p>
                  <Input placeholder="YYYY-MM-DD" value={newTournament.date} onChange={e => setNewTournament({...newTournament, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Lieu</p>
                  <Input placeholder="Ville ou en ligne" value={newTournament.location} onChange={e => setNewTournament({...newTournament, location: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Cashprize</p>
                  <Input placeholder="ex: 5000 €" value={newTournament.prize} onChange={e => setNewTournament({...newTournament, prize: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Illustration</p>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full sm:w-32 aspect-square rounded-xl border overflow-hidden bg-muted shrink-0">
                    <img src={newTournament.imageUrl || "https://picsum.photos/seed/placeholder/300/300"} className="w-full h-full object-cover" />
                  </div>
                  <div className="w-full grid grid-cols-2 gap-2">
                    <label className="flex-1">
                      <Button variant="outline" className="w-full gap-2 h-12" asChild>
                        <span><Upload className="w-4 h-4" /> Téléverser</span>
                      </Button>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setNewTournament({...newTournament, imageUrl: url}))} />
                    </label>
                    <Button 
                      variant="secondary" 
                      className="w-full h-12 gap-2"
                      disabled={isGenerating === 'tourn'}
                      onClick={() => handleAiGeneration(newTournament.name, `Sport: ${newTournament.sport}`, (url) => setNewTournament({...newTournament, imageUrl: url}), 'tourn')}
                    >
                      {isGenerating === 'tourn' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} IA
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-6">
                <p className="text-xs font-bold uppercase tracking-wider">Programme du tournoi</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input className="sm:col-span-1" placeholder="Phase (ex: Finale)" value={scheduleItem.label} onChange={e => setScheduleItem({...scheduleItem, label: e.target.value})} />
                  <Input className="sm:col-span-1" placeholder="Date" value={scheduleItem.date} onChange={e => setScheduleItem({...scheduleItem, date: e.target.value})} />
                  <Button variant="secondary" onClick={() => {
                    if (scheduleItem.label && scheduleItem.date) {
                      setNewTournament({ ...newTournament, schedule: [...newTournament.schedule, scheduleItem] });
                      setScheduleItem({ label: "", date: "" });
                    }
                  }} className="w-full">Ajouter</Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {newTournament.schedule.map((s, i) => (
                    <Badge key={i} className="gap-2 py-1.5 px-3 bg-primary/10 text-primary border-primary/20">
                      {s.label} ({s.date}) 
                      <Trash2 className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors" onClick={() => {
                        const updated = [...newTournament.schedule];
                        updated.splice(i, 1);
                        setNewTournament({...newTournament, schedule: updated});
                      }} />
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddTournament} className="w-full bg-primary glow-blue h-14 font-bold uppercase text-lg">Publier le tournoi</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments?.map((t: any) => (
              <Card key={t.id} className="relative group overflow-hidden border-white/5 shadow hover:shadow-lg transition-all">
                <div className="aspect-video relative overflow-hidden">
                  <img src={t.imageUrl || "https://picsum.photos/seed/placeholder/400/225"} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <Button size="icon" variant="destructive" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete('tournaments', t.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-bold uppercase truncate">{t.name}</h4>
                  <p className="text-xs text-muted-foreground">{t.sport} • {t.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="articles" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-xl">Nouvelle Actualité</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Titre de l'article" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
              <Textarea placeholder="Résumé accrocheur..." value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})} className="min-h-[80px]" />
              <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
                <div className="w-full sm:w-24 aspect-square rounded-xl border overflow-hidden shrink-0">
                  <img src={newArticle.imageUrl || "https://picsum.photos/seed/placeholder/100/100"} className="w-full h-full object-cover" />
                </div>
                <div className="w-full grid grid-cols-2 gap-2">
                  <label className="flex-1">
                    <Button variant="outline" className="w-full h-12" asChild>
                      <span><Upload className="w-4 h-4 mr-2" /> Téléverser</span>
                    </Button>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setNewArticle({...newArticle, imageUrl: url}))} />
                  </label>
                  <Button 
                    variant="secondary" 
                    className="w-full h-12"
                    disabled={isGenerating === 'art'}
                    onClick={() => handleAiGeneration(newArticle.title, "Magazine sport", (url) => setNewArticle({...newArticle, imageUrl: url}), 'art')}
                  >
                    {isGenerating === 'art' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} IA
                  </Button>
                </div>
              </div>
              <Button onClick={handleAddArticle} className="w-full bg-primary glow-blue h-12 uppercase font-bold">Publier sur le flux</Button>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles?.map((a: any) => (
              <Card key={a.id} className="flex gap-4 p-4 items-center group relative overflow-hidden border-white/5">
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                  <img src={a.imageUrl || "https://picsum.photos/seed/placeholder/100/100"} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold uppercase truncate">{a.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{a.excerpt}</p>
                </div>
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete('articles', a.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-xl">Nouvelle Billetterie</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Nom du pass" value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} />
                <Input placeholder="Tournoi lié" value={newTicket.tournamentName} onChange={e => setNewTicket({...newTicket, tournamentName: e.target.value})} />
                <Input placeholder="Prix (ex: 15€)" value={newTicket.price} onChange={e => setNewTicket({...newTicket, price: e.target.value})} />
                <Input placeholder="Lien Billetterie Externe" value={newTicket.externalUrl} onChange={e => setNewTicket({...newTicket, externalUrl: e.target.value})} />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Image du billet</p>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full sm:w-32 aspect-video rounded-xl border overflow-hidden shrink-0">
                    <img src={newTicket.imageUrl || "https://picsum.photos/seed/placeholder/300/150"} className="w-full h-full object-cover" />
                  </div>
                  <label className="w-full">
                    <Button variant="outline" className="w-full h-12" asChild>
                      <span><Upload className="w-4 h-4 mr-2" /> Téléverser l'image</span>
                    </Button>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setNewTicket({...newTicket, imageUrl: url}))} />
                  </label>
                </div>
              </div>
              <Textarea placeholder="Détails de l'offre et avantages..." value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} />
              <Button onClick={handleAddTicket} className="w-full bg-primary glow-blue h-12 uppercase font-bold">Ajouter à la billetterie</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets?.map((t: any) => (
              <Card key={t.id} className="p-4 group relative overflow-hidden border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold uppercase">{t.title}</h4>
                    <p className="text-xs text-primary font-bold">{t.price}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{t.tournamentName}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete('tickets', t.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

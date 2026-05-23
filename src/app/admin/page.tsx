
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
      .finally(() => setIsSaving(false));
  };

  const addScheduleItem = () => {
    if (scheduleItem.label && scheduleItem.date) {
      setNewTournament({ ...newTournament, schedule: [...newTournament.schedule, scheduleItem] });
      setScheduleItem({ label: "", date: "" });
    }
  };

  const handleAddTournament = () => {
    if (!db || !newTournament.name) return;
    addDoc(collection(db, "tournaments"), newTournament)
      .then(() => {
        toast({ title: "Tournoi ajouté" });
        setNewTournament({ name: "", sport: "Football", date: "", location: "", prize: "", imageUrl: "", status: "Inscriptions Ouvertes", schedule: [] });
      });
  };

  const handleAddArticle = () => {
    if (!db || !newArticle.title) return;
    addDoc(collection(db, "articles"), newArticle)
      .then(() => {
        toast({ title: "Article publié" });
        setNewArticle({ title: "", excerpt: "", category: "Tournois", date: new Date().toLocaleDateString(), author: "Admin", imageUrl: "" });
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
      });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold uppercase tracking-tighter">ADMINISTRATION</h1>
          <p className="text-muted-foreground">Pilotez votre plateforme OneCup Elite en temps réel.</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary px-4 py-1">MODE ÉDITION ACTIF</Badge>
      </div>

      <Tabs defaultValue="site" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card border h-12">
          <TabsTrigger value="site"><Settings className="w-4 h-4 mr-2" /> Paramètres</TabsTrigger>
          <TabsTrigger value="tournaments"><Trophy className="w-4 h-4 mr-2" /> Tournois</TabsTrigger>
          <TabsTrigger value="articles"><Newspaper className="w-4 h-4 mr-2" /> News</TabsTrigger>
          <TabsTrigger value="tickets"><TicketIcon className="w-4 h-4 mr-2" /> Billets</TabsTrigger>
        </TabsList>

        <TabsContent value="site" className="mt-6">
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle>Configuration Accueil & Cagnotte</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateConfig} className="space-y-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Textarea name="heroSubtitle" placeholder="Description courte" defaultValue={siteConfig?.heroSubtitle} className="h-20" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-muted-foreground">Objectif Cagnotte (€)</p>
                      <Input name="targetPrizePool" type="number" defaultValue={siteConfig?.targetPrizePool || 100000} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Image de fond (Héro)</p>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <label className="flex-1">
                            <Button type="button" variant="secondary" className="w-full gap-2 cursor-pointer" asChild>
                              <span><Upload className="w-4 h-4" /> Téléverser</span>
                            </Button>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setSiteImages({heroImageUrl: url}))} />
                          </label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1 gap-2"
                            disabled={isGenerating === 'site'}
                            onClick={() => handleAiGeneration("Un stade de football moderne épique", "cinématique", (url) => setSiteImages({heroImageUrl: url}), 'site')}
                          >
                            {isGenerating === 'site' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} IA
                          </Button>
                        </div>
                      </div>
                      {(siteImages.heroImageUrl || siteConfig?.heroImageUrl) && (
                        <div className="w-32 aspect-video rounded border overflow-hidden bg-muted">
                          <img src={siteImages.heroImageUrl || siteConfig?.heroImageUrl} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={isSaving} className="w-full bg-primary glow-blue">Mettre à jour la plateforme</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments" className="mt-6 space-y-6">
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle>Nouveau Tournoi</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nom du tournoi" value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} />
                <Input placeholder="Sport" value={newTournament.sport} onChange={e => setNewTournament({...newTournament, sport: e.target.value})} />
                <Input placeholder="Date (ex: 2026-07-15)" value={newTournament.date} onChange={e => setNewTournament({...newTournament, date: e.target.value})} />
                <Input placeholder="Lieu" value={newTournament.location} onChange={e => setNewTournament({...newTournament, location: e.target.value})} />
                <Input placeholder="Cashprize" value={newTournament.prize} onChange={e => setNewTournament({...newTournament, prize: e.target.value})} />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Illustration du tournoi</p>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <Button variant="secondary" className="w-full gap-2" asChild>
                          <span><Upload className="w-4 h-4" /> Téléverser</span>
                        </Button>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setNewTournament({...newTournament, imageUrl: url}))} />
                      </label>
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2"
                        disabled={isGenerating === 'tourn'}
                        onClick={() => handleAiGeneration(newTournament.name, `Sport: ${newTournament.sport}`, (url) => setNewTournament({...newTournament, imageUrl: url}), 'tourn')}
                      >
                        {isGenerating === 'tourn' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Générer IA
                      </Button>
                    </div>
                  </div>
                  {newTournament.imageUrl && (
                    <div className="w-24 h-24 rounded border overflow-hidden">
                      <img src={newTournament.imageUrl} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <p className="text-xs font-bold uppercase">Programme & Phases</p>
                <div className="flex gap-2">
                  <Input placeholder="Phase (ex: Finale)" value={scheduleItem.label} onChange={e => setScheduleItem({...scheduleItem, label: e.target.value})} />
                  <Input placeholder="Date" value={scheduleItem.date} onChange={e => setScheduleItem({...scheduleItem, date: e.target.value})} />
                  <Button variant="secondary" onClick={addScheduleItem}>Ajouter</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newTournament.schedule.map((s, i) => (
                    <Badge key={i} className="gap-2">{s.label} ({s.date}) <Trash2 className="w-3 h-3 cursor-pointer" onClick={() => {
                      const updated = [...newTournament.schedule];
                      updated.splice(i, 1);
                      setNewTournament({...newTournament, schedule: updated});
                    }} /></Badge>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddTournament} className="w-full bg-primary glow-blue h-12 font-bold uppercase">Publier le tournoi</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="mt-6 space-y-6">
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle>Nouvelle Actualité</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Titre de l'article" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
              <Textarea placeholder="Résumé accrocheur" value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})} />
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <Button variant="secondary" className="w-full gap-2" asChild>
                        <span><Upload className="w-4 h-4" /> Téléverser</span>
                      </Button>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setNewArticle({...newArticle, imageUrl: url}))} />
                    </label>
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      disabled={isGenerating === 'art'}
                      onClick={() => handleAiGeneration(newArticle.title, "Magazine sport", (url) => setNewArticle({...newArticle, imageUrl: url}), 'art')}
                    >
                      {isGenerating === 'art' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Illustration IA
                    </Button>
                  </div>
                </div>
                {newArticle.imageUrl && (
                  <div className="w-24 h-24 rounded border overflow-hidden">
                    <img src={newArticle.imageUrl} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <Button onClick={handleAddArticle} className="w-full bg-primary glow-blue uppercase font-bold">Publier sur le flux</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="mt-6 space-y-6">
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle>Nouvelle Billetterie</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nom du pass" value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} />
                <Input placeholder="Tournoi lié" value={newTicket.tournamentName} onChange={e => setNewTicket({...newTicket, tournamentName: e.target.value})} />
                <Input placeholder="Prix" value={newTicket.price} onChange={e => setNewTicket({...newTicket, price: e.target.value})} />
                <Input placeholder="Lien Billetterie Externe" value={newTicket.externalUrl} onChange={e => setNewTicket({...newTicket, externalUrl: e.target.value})} />
                <div className="col-span-2 space-y-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Image du billet</p>
                  <div className="flex gap-4">
                    <label className="flex-1">
                      <Button variant="secondary" className="w-full gap-2" asChild>
                        <span><Upload className="w-4 h-4" /> Téléverser l'image</span>
                      </Button>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setNewTicket({...newTicket, imageUrl: url}))} />
                    </label>
                    {newTicket.imageUrl && (
                      <div className="w-32 h-20 rounded border overflow-hidden">
                        <img src={newTicket.imageUrl} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <Textarea placeholder="Détails de l'offre" className="col-span-2" value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} />
              </div>
              <Button onClick={handleAddTicket} className="w-full bg-primary glow-blue uppercase font-bold">Ajouter à la billetterie</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

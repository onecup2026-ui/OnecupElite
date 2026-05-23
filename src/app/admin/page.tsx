
"use client";

import { useState, useMemo } from "react";
import { Trophy, Newspaper, Settings, Plus, Save, Trash2, Image as ImageIcon, ListPlus, Ticket as TicketIcon, Upload, Sparkles, Loader2, DollarSign, Heart, Video, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDoc, useCollection, useFirestore } from "@/firebase";
import { doc, setDoc, addDoc, deleteDoc, collection, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { generateTournamentImage } from "@/ai/flows/ai-image-generator";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();

  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const tournamentsRef = useMemo(() => (db ? collection(db, "tournaments") : null), [db]);
  const articlesRef = useMemo(() => (db ? collection(db, "articles") : null), [db]);
  const ticketsRef = useMemo(() => (db ? collection(db, "tickets") : null), [db]);
  const sponsorsRef = useMemo(() => (db ? collection(db, "sponsors") : null), [db]);
  const registrationsRef = useMemo(() => (db ? query(collection(db, "registrations"), orderBy("createdAt", "desc")) : null), [db]);

  const { data: siteConfig } = useDoc(configRef);
  const { data: tournaments } = useCollection(tournamentsRef);
  const { data: articles } = useCollection(articlesRef);
  const { data: tickets } = useCollection(ticketsRef);
  const { data: sponsors } = useCollection(sponsorsRef);
  const { data: registrations } = useCollection(registrationsRef);

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Form states
  const [newTournament, setNewTournament] = useState({
    name: "", sport: "Football", date: "", location: "", prize: "", imageUrl: "", status: "Inscriptions Ouvertes", teamsMax: 16, teamsRegistered: 0, description: "", schedule: [] as { label: string; date: string }[]
  });

  const [newArticle, setNewArticle] = useState({
    title: "", excerpt: "", category: "Tournois", date: new Date().toLocaleDateString(), author: "Admin", imageUrl: ""
  });

  const [newTicket, setNewTicket] = useState({
    title: "", tournamentName: "", price: "", externalUrl: "", description: "", imageUrl: ""
  });

  const [newSponsor, setNewSponsor] = useState({
    name: "", logoUrl: "", websiteUrl: ""
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
      heroVideoUrl: formData.get("heroVideoUrl"),
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
        setNewTournament({ name: "", sport: "Football", date: "", location: "", prize: "", imageUrl: "", status: "Inscriptions Ouvertes", teamsMax: 16, teamsRegistered: 0, description: "", schedule: [] });
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
    if (!db || !newTicket.title) return;
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

  const handleAddSponsor = () => {
    if (!db || !newSponsor.name) return;
    addDoc(collection(db, "sponsors"), newSponsor)
      .then(() => {
        toast({ title: "Sponsor ajouté" });
        setNewSponsor({ name: "", logoUrl: "", websiteUrl: "" });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/sponsors',
          operation: 'create',
          requestResourceData: newSponsor
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
          <h1 className="text-2xl md:text-3xl font-headline font-bold uppercase tracking-tighter text-foreground">ADMINISTRATION</h1>
          <p className="text-muted-foreground text-sm">Pilotez votre plateforme OneCup Elite en temps réel.</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary px-4 py-1">MODE ÉDITION ACTIF</Badge>
      </div>

      <Tabs defaultValue="site" className="w-full">
        <TabsList className="flex flex-wrap h-auto p-1 bg-muted rounded-xl mb-6 gap-1 overflow-x-auto no-scrollbar">
          <TabsTrigger value="site" className="py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" /> Paramètres
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
            <Trophy className="w-4 h-4 mr-2" /> Tournois
          </TabsTrigger>
          <TabsTrigger value="registrations" className="py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" /> Inscriptions
          </TabsTrigger>
          <TabsTrigger value="articles" className="py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
            <Newspaper className="w-4 h-4 mr-2" /> News
          </TabsTrigger>
          <TabsTrigger value="tickets" className="py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
            <TicketIcon className="w-4 h-4 mr-2" /> Billets
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="py-3 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
            <Heart className="w-4 h-4 mr-2" /> Sponsors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-6">
           <Card>
            <CardHeader><CardTitle className="text-xl">Suivi des Inscriptions</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="p-3 text-left font-bold uppercase text-[10px]">Date</th>
                      <th className="p-3 text-left font-bold uppercase text-[10px]">Équipe</th>
                      <th className="p-3 text-left font-bold uppercase text-[10px]">Tournoi</th>
                      <th className="p-3 text-left font-bold uppercase text-[10px]">Capitaine</th>
                      <th className="p-3 text-left font-bold uppercase text-[10px]">Contact</th>
                      <th className="p-3 text-right font-bold uppercase text-[10px]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations?.map((reg: any) => (
                      <tr key={reg.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-muted-foreground">
                          {reg.createdAt ? format(reg.createdAt.toDate(), "dd/MM HH:mm", { locale: fr }) : "-"}
                        </td>
                        <td className="p-3 font-bold uppercase text-primary">{reg.teamName}</td>
                        <td className="p-3">{reg.tournamentName}</td>
                        <td className="p-3">{reg.captainName}</td>
                        <td className="p-3">
                          <p className="text-[10px]">{reg.contactEmail}</p>
                          <p className="text-[10px] text-muted-foreground">{reg.contactPhone}</p>
                        </td>
                        <td className="p-3 text-right">
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete('registrations', reg.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!registrations?.length && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground italic">Aucune inscription pour le moment.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site" className="space-y-6">
          <Card className="shadow-lg border-white/5">
            <CardHeader><CardTitle className="text-xl">Configuration Accueil & Teaser</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateConfig} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Titre Héro</p>
                    <Input name="heroTitle" placeholder="Titre principal" defaultValue={siteConfig?.heroTitle} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-muted-foreground">URL Vidéo Teaser (YouTube)</p>
                    <Input name="heroVideoUrl" placeholder="https://youtube.com/watch?v=..." defaultValue={siteConfig?.heroVideoUrl} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Sous-titre</p>
                    <Textarea name="heroSubtitle" placeholder="Description courte" defaultValue={siteConfig?.heroSubtitle} className="min-h-[100px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-muted-foreground">Cagnotte (FC)</p>
                      <Input name="currentPrizePool" type="number" defaultValue={siteConfig?.currentPrizePool || 0} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-muted-foreground">Objectif (FC)</p>
                      <Input name="targetPrizePool" type="number" defaultValue={siteConfig?.targetPrizePool || 0} />
                    </div>
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
                <Button type="submit" disabled={isSaving} className="w-full bg-primary glow-blue h-12 font-bold uppercase text-white">Enregistrer les modifications</Button>
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
                  <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Places Max</p>
                  <Input type="number" value={newTournament.teamsMax} onChange={e => setNewTournament({...newTournament, teamsMax: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Cashprize (FC)</p>
                  <Input placeholder="ex: 5.000.000 FC" value={newTournament.prize} onChange={e => setNewTournament({...newTournament, prize: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Description</p>
                <Textarea placeholder="Détails du tournoi..." value={newTournament.description} onChange={e => setNewTournament({...newTournament, description: e.target.value})} />
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

              <Button onClick={handleAddTournament} className="w-full bg-primary glow-blue h-14 font-bold uppercase text-lg text-white">Publier le tournoi</Button>
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
                  <p className="text-xs text-muted-foreground">{t.sport} • {t.teamsRegistered}/{t.teamsMax} équipes</p>
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
              <Button onClick={handleAddArticle} className="w-full bg-primary glow-blue h-12 uppercase font-bold text-white">Publier sur le flux</Button>
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
                <Input placeholder="Prix (ex: 25.000 FC)" value={newTicket.price} onChange={e => setNewTicket({...newTicket, price: e.target.value})} />
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
              <Button onClick={handleAddTicket} className="w-full bg-primary glow-blue h-12 uppercase font-bold text-white">Ajouter à la billetterie</Button>
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

        <TabsContent value="sponsors" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-xl">Gestion des Sponsors</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Nom du Sponsor</p>
                  <Input placeholder="ex: Nike, Orange..." value={newSponsor.name} onChange={e => setNewSponsor({...newSponsor, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Lien Site Web (Optionnel)</p>
                  <Input placeholder="https://..." value={newSponsor.websiteUrl} onChange={e => setNewSponsor({...newSponsor, websiteUrl: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Logo du Sponsor</p>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full sm:w-32 h-16 rounded-xl border overflow-hidden bg-white flex items-center justify-center p-2 shrink-0">
                    <img src={newSponsor.logoUrl || "https://placehold.co/200x100?text=LOGO"} className="max-w-full max-h-full object-contain" />
                  </div>
                  <label className="w-full">
                    <Button variant="outline" className="w-full h-12" asChild>
                      <span><Upload className="w-4 h-4 mr-2" /> Téléverser le Logo</span>
                    </Button>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setNewSponsor({...newSponsor, logoUrl: url}))} />
                  </label>
                </div>
              </div>
              <Button onClick={handleAddSponsor} className="w-full bg-primary glow-blue h-12 uppercase font-bold text-white">Ajouter le Sponsor</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sponsors?.map((s: any) => (
              <Card key={s.id} className="relative group overflow-hidden border-white/5 p-4 flex flex-col items-center gap-2">
                <div className="h-12 w-full flex items-center justify-center bg-white rounded-lg p-2">
                  <img src={s.logoUrl} alt={s.name} className="max-w-full max-h-full object-contain" />
                </div>
                <p className="text-[10px] font-bold uppercase truncate w-full text-center">{s.name}</p>
                <Button size="icon" variant="destructive" className="absolute -top-1 -right-1 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-75" onClick={() => handleDelete('sponsors', s.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

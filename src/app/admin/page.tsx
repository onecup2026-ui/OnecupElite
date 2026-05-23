
"use client";

import { useState } from "react";
import { Trophy, Newspaper, Settings, Plus, Save, Trash2, Image as ImageIcon, ListPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDoc, useCollection, useFirestore } from "@/firebase";
import { doc, setDoc, addDoc, deleteDoc, collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const { data: siteConfig } = useDoc(db ? doc(db, "settings", "config") : null);
  const { data: tournaments } = useCollection(db ? collection(db, "tournaments") : null);
  const { data: articles } = useCollection(db ? collection(db, "articles") : null);

  const [isSaving, setIsSaving] = useState(false);

  // Form states for new tournament
  const [newTournament, setNewTournament] = useState({
    name: "", 
    sport: "Football", 
    date: "", 
    location: "", 
    prize: "", 
    imageUrl: "", 
    status: "Inscriptions Ouvertes",
    schedule: [] as { label: string; date: string }[]
  });

  const [scheduleItem, setScheduleItem] = useState({ label: "", date: "" });

  const [newArticle, setNewArticle] = useState({
    title: "", excerpt: "", category: "Tournois", date: new Date().toLocaleDateString(), author: "Admin", imageUrl: ""
  });

  const handleUpdateConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      heroTitle: formData.get("heroTitle"),
      heroSubtitle: formData.get("heroSubtitle"),
      heroImageUrl: formData.get("heroImageUrl"),
    };
    setIsSaving(true);
    setDoc(doc(db, "settings", "config"), data, { merge: true })
      .then(() => toast({ title: "Configuration mise à jour" }))
      .finally(() => setIsSaving(false));
  };

  const addScheduleItem = () => {
    if (scheduleItem.label && scheduleItem.date) {
      setNewTournament({
        ...newTournament,
        schedule: [...newTournament.schedule, scheduleItem]
      });
      setScheduleItem({ label: "", date: "" });
    }
  };

  const removeScheduleItem = (index: number) => {
    const updated = [...newTournament.schedule];
    updated.splice(index, 1);
    setNewTournament({ ...newTournament, schedule: updated });
  };

  const handleAddTournament = () => {
    if (!db || !newTournament.name || !newTournament.date) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez remplir au moins le nom et la date du tournoi." });
      return;
    }
    addDoc(collection(db, "tournaments"), newTournament)
      .then(() => {
        toast({ title: "Tournoi ajouté avec succès" });
        setNewTournament({ 
          name: "", sport: "Football", date: "", location: "", prize: "", imageUrl: "", status: "Inscriptions Ouvertes", schedule: [] 
        });
      });
  };

  const handleDeleteTournament = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, "tournaments", id))
      .then(() => toast({ title: "Tournoi supprimé" }));
  };

  const handleAddArticle = () => {
    if (!db) return;
    addDoc(collection(db, "articles"), newArticle)
      .then(() => {
        toast({ title: "Article ajouté" });
        setNewArticle({ title: "", excerpt: "", category: "Tournois", date: new Date().toLocaleDateString(), author: "Admin", imageUrl: "" });
      });
  };

  const handleDeleteArticle = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, "articles", id));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold uppercase tracking-tighter">CENTRE DE CONTRÔLE</h1>
          <p className="text-muted-foreground">Gérez tout le contenu dynamique de OneCup Elite.</p>
        </div>
      </div>

      <Tabs defaultValue="site" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card border">
          <TabsTrigger value="site" className="gap-2"><Settings className="w-4 h-4" /> Site & Design</TabsTrigger>
          <TabsTrigger value="tournaments" className="gap-2"><Trophy className="w-4 h-4" /> Tournois</TabsTrigger>
          <TabsTrigger value="articles" className="gap-2"><Newspaper className="w-4 h-4" /> Actualités</TabsTrigger>
        </TabsList>

        {/* SITE CONFIG */}
        <TabsContent value="site" className="mt-6">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle>Configuration de l'Accueil</CardTitle>
              <CardDescription>Modifiez les textes et l'image héro de la page d'accueil.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateConfig} className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-bold uppercase">Titre Héro</label>
                  <Input name="heroTitle" defaultValue={siteConfig?.heroTitle || "LA VICTOIRE EST UNE PASSION."} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-bold uppercase">Sous-titre Héro</label>
                  <Textarea name="heroSubtitle" defaultValue={siteConfig?.heroSubtitle || "Dominez le terrain avec l'écosystème OneCup."} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-bold uppercase flex items-center gap-2"><ImageIcon className="w-4 h-4" /> URL de l'Image Héro</label>
                  <Input name="heroImageUrl" defaultValue={siteConfig?.heroImageUrl || "https://picsum.photos/seed/onecup-hero/1920/1080"} />
                </div>
                <Button type="submit" disabled={isSaving} className="bg-primary glow-blue gap-2">
                  <Save className="w-4 h-4" /> Enregistrer les modifications
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TOURNAMENTS */}
        <TabsContent value="tournaments" className="mt-6 space-y-6">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle>Nouveau Tournoi</CardTitle>
              <CardDescription>Ajoutez un tournoi et ses phases de compétition (Eliminatoires, Finales, etc.)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Nom du tournoi" value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} />
                <Input placeholder="Sport" value={newTournament.sport} onChange={e => setNewTournament({...newTournament, sport: e.target.value})} />
                <Input placeholder="Date principale (YYYY-MM-DD)" value={newTournament.date} onChange={e => setNewTournament({...newTournament, date: e.target.value})} />
                <Input placeholder="Lieu" value={newTournament.location} onChange={e => setNewTournament({...newTournament, location: e.target.value})} />
                <Input placeholder="Prix / Cashprize" value={newTournament.prize} onChange={e => setNewTournament({...newTournament, prize: e.target.value})} />
                <Input placeholder="URL de l'image" value={newTournament.imageUrl} onChange={e => setNewTournament({...newTournament, imageUrl: e.target.value})} />
              </div>

              <div className="border-t border-white/5 pt-4 space-y-4">
                <h4 className="text-sm font-bold uppercase flex items-center gap-2"><ListPlus className="w-4 h-4" /> Programme du tournoi</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input placeholder="Libellé (ex: Quart de finale)" value={scheduleItem.label} onChange={e => setScheduleItem({...scheduleItem, label: e.target.value})} />
                  <Input placeholder="Date (YYYY-MM-DD)" value={scheduleItem.date} onChange={e => setScheduleItem({...scheduleItem, date: e.target.value})} />
                  <Button variant="secondary" onClick={addScheduleItem}>Ajouter au programme</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newTournament.schedule.map((item, idx) => (
                    <Badge key={idx} variant="outline" className="gap-2 px-3 py-1 bg-primary/5">
                      {item.label} : {item.date}
                      <Trash2 className="w-3 h-3 text-destructive cursor-pointer" onClick={() => removeScheduleItem(idx)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleAddTournament} className="w-full bg-primary glow-blue"><Plus className="w-4 h-4 mr-2" /> Publier le tournoi</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments?.map((t: any) => (
              <Card key={t.id} className="bg-card border-white/5 relative overflow-hidden">
                <div className="h-32 bg-muted relative">
                  {t.imageUrl && <img src={t.imageUrl} className="w-full h-full object-cover opacity-50" />}
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-bold">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">{t.sport} • {t.date}</p>
                  <div className="mt-2 space-y-1">
                     {t.schedule?.map((s: any, i: number) => (
                       <p key={i} className="text-[10px] text-primary/70">• {s.label} ({s.date})</p>
                     ))}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteTournament(t.id)} className="mt-4 w-full gap-2">
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ARTICLES */}
        <TabsContent value="articles" className="mt-6 space-y-6">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle>Nouvel Article</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Titre de l'article" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
              <Textarea placeholder="Résumé" value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})} />
              <Input placeholder="URL de l'image" value={newArticle.imageUrl} onChange={e => setNewArticle({...newArticle, imageUrl: e.target.value})} />
              <Button onClick={handleAddArticle} className="w-full bg-primary glow-blue"><Plus className="w-4 h-4 mr-2" /> Publier l'article</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles?.map((a: any) => (
              <Card key={a.id} className="bg-card border-white/5 flex gap-4 p-4 items-center">
                <img src={a.imageUrl} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{a.title}</h3>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteArticle(a.id)} className="text-destructive p-0 h-auto hover:bg-transparent mt-2">
                    Supprimer
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

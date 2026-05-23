
"use client";

import { useState } from "react";
import { Trophy, Newspaper, Settings, Plus, Save, Trash2, Image as ImageIcon, ListPlus, Ticket as TicketIcon, ExternalLink } from "lucide-react";
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
  const { data: tickets } = useCollection(db ? collection(db, "tickets") : null);

  const [isSaving, setIsSaving] = useState(false);

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
      setNewTournament({ ...newTournament, schedule: [...newTournament.schedule, scheduleItem] });
      setScheduleItem({ label: "", date: "" });
    }
  };

  const removeScheduleItem = (index: number) => {
    const updated = [...newTournament.schedule];
    updated.splice(index, 1);
    setNewTournament({ ...newTournament, schedule: updated });
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

  const handleDelete = (path: string, id: string) => {
    if (!db) return;
    deleteDoc(doc(db, path, id)).then(() => toast({ title: "Élément supprimé" }));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold uppercase tracking-tighter">ADMINISTRATION</h1>
        <p className="text-muted-foreground">Gérez tous les aspects de la plateforme OneCup Elite.</p>
      </div>

      <Tabs defaultValue="site" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card border">
          <TabsTrigger value="site"><Settings className="w-4 h-4 mr-2" /> Site</TabsTrigger>
          <TabsTrigger value="tournaments"><Trophy className="w-4 h-4 mr-2" /> Tournois</TabsTrigger>
          <TabsTrigger value="articles"><Newspaper className="w-4 h-4 mr-2" /> News</TabsTrigger>
          <TabsTrigger value="tickets"><TicketIcon className="w-4 h-4 mr-2" /> Billets</TabsTrigger>
        </TabsList>

        <TabsContent value="site" className="mt-6">
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle>Accueil</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateConfig} className="space-y-4">
                <Input name="heroTitle" placeholder="Titre Héro" defaultValue={siteConfig?.heroTitle} />
                <Textarea name="heroSubtitle" placeholder="Sous-titre" defaultValue={siteConfig?.heroSubtitle} />
                <Input name="heroImageUrl" placeholder="URL Image Héro" defaultValue={siteConfig?.heroImageUrl} />
                <Button type="submit" disabled={isSaving} className="bg-primary glow-blue">Enregistrer</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments" className="mt-6 space-y-6">
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle>Nouveau Tournoi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nom" value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} />
                <Input placeholder="Sport" value={newTournament.sport} onChange={e => setNewTournament({...newTournament, sport: e.target.value})} />
                <Input placeholder="Date (YYYY-MM-DD)" value={newTournament.date} onChange={e => setNewTournament({...newTournament, date: e.target.value})} />
                <Input placeholder="Image URL" value={newTournament.imageUrl} onChange={e => setNewTournament({...newTournament, imageUrl: e.target.value})} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase">Programme</p>
                <div className="flex gap-2">
                  <Input placeholder="Phase" value={scheduleItem.label} onChange={e => setScheduleItem({...scheduleItem, label: e.target.value})} />
                  <Input placeholder="Date" value={scheduleItem.date} onChange={e => setScheduleItem({...scheduleItem, date: e.target.value})} />
                  <Button variant="secondary" onClick={addScheduleItem}>Ajouter</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newTournament.schedule.map((s, i) => (
                    <Badge key={i} className="gap-2">{s.label} <Trash2 className="w-3 h-3 cursor-pointer" onClick={() => removeScheduleItem(i)} /></Badge>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddTournament} className="w-full bg-primary glow-blue">Publier le tournoi</Button>
            </CardContent>
          </Card>
          <div className="grid grid-cols-3 gap-4">
            {tournaments?.map((t: any) => (
              <Card key={t.id} className="bg-card p-4 relative">
                <h4 className="font-bold">{t.name}</h4>
                <Button variant="destructive" size="sm" className="mt-2 w-full" onClick={() => handleDelete("tournaments", t.id)}><Trash2 className="w-4 h-4" /></Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="articles" className="mt-6 space-y-6">
          <Card className="bg-card/50 border-white/5">
            <CardHeader><CardTitle>Nouvelle News</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Titre" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
              <Textarea placeholder="Résumé" value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})} />
              <Input placeholder="Image URL" value={newArticle.imageUrl} onChange={e => setNewArticle({...newArticle, imageUrl: e.target.value})} />
              <Button onClick={handleAddArticle} className="w-full bg-primary glow-blue">Publier l'article</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="mt-6 space-y-6">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle>Nouvelle Billetterie</CardTitle>
              <CardDescription>Ajoutez des liens vers vos plateformes de billetterie externes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nom du billet (ex: Pass VIP)" value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} />
                <Input placeholder="Nom du Tournoi" value={newTicket.tournamentName} onChange={e => setNewTicket({...newTicket, tournamentName: e.target.value})} />
                <Input placeholder="Prix (ex: 15€)" value={newTicket.price} onChange={e => setNewTicket({...newTicket, price: e.target.value})} />
                <Input placeholder="Lien Billetterie Externe" value={newTicket.externalUrl} onChange={e => setNewTicket({...newTicket, externalUrl: e.target.value})} />
                <Input placeholder="URL Image" className="col-span-2" value={newTicket.imageUrl} onChange={e => setNewTicket({...newTicket, imageUrl: e.target.value})} />
                <Textarea placeholder="Description" className="col-span-2" value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} />
              </div>
              <Button onClick={handleAddTicket} className="w-full bg-primary glow-blue">Ajouter à la billetterie</Button>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets?.map((ticket: any) => (
              <Card key={ticket.id} className="bg-card border-white/5 p-4 flex flex-col gap-2">
                <h4 className="font-bold">{ticket.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-1">{ticket.externalUrl}</p>
                <Button variant="destructive" size="sm" onClick={() => handleDelete("tickets", ticket.id)} className="mt-auto"><Trash2 className="w-4 h-4 mr-2" /> Supprimer</Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

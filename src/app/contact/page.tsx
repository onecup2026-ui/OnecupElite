
"use client";

import { Mail, Phone, MapPin, Send, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message envoyé",
      description: "L'équipe ONECUP vous répondra dans les plus brefs délais.",
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header Prestigieux */}
      <header className="bg-secondary text-white py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10 text-center space-y-6">
          <Badge variant="outline" className="border-primary text-primary px-8 py-2 rounded-full font-black uppercase tracking-widest text-[10px]">L'ÉLITE À VOTRE ÉCOUTE</Badge>
          <h1 className="text-6xl md:text-9xl font-headline font-black uppercase tracking-tighter leading-none">CONTACTEZ <br/><span className="text-white/40">L'ÉQUIPE.</span></h1>
        </div>
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/stadium-lights/1920/1080')] opacity-10 bg-cover bg-center grayscale" />
      </header>

      <div className="container mx-auto px-4 py-24 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Formulaire de Contact */}
          <div className="lg:col-span-7">
            <Card className="rounded-[3rem] border-none shadow-2xl p-8 md:p-16 bg-white">
              <div className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tight">ENVOYER UN MESSAGE</h2>
                  <p className="text-slate-500 font-medium">Une question, un partenariat ou une suggestion ? Notre équipe est prête à vous répondre.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nom Complet</label>
                      <Input placeholder="Votre nom" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50" required />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email Officiel</label>
                      <Input type="email" placeholder="votre@email.com" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50" required />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sujet</label>
                    <Input placeholder="Ex: Partenariat Sponsor" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50" required />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Votre Message</label>
                    <Textarea placeholder="Comment pouvons-nous vous aider ?" className="min-h-[200px] rounded-3xl border-slate-100 bg-slate-50/50 p-6" required />
                  </div>
                  <Button type="submit" className="w-full h-20 rounded-[2rem] bg-primary text-white font-black uppercase tracking-widest text-lg shadow-2xl hover:scale-[1.02] transition-transform gap-4">
                    EXPÉDIER LE MESSAGE <Send className="w-6 h-6" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Informations Directes */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="rounded-[3rem] bg-slate-50 border-none p-12 space-y-12">
              <h3 className="text-2xl font-headline font-black uppercase">DIRECT ACCESS</h3>
              
              <div className="space-y-10">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email</p>
                    <p className="text-xl font-bold">onecup2026@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">QG Elite</p>
                    <p className="text-xl font-bold">Kinshasa, RDC</p>
                    <p className="text-sm text-slate-500 font-medium">Bureaux ONECUP Platform</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Social</p>
                    <div className="flex gap-4 mt-2">
                      <Badge variant="outline" className="px-4 py-1 rounded-lg border-slate-200">INSTAGRAM</Badge>
                      <Badge variant="outline" className="px-4 py-1 rounded-lg border-slate-200">TIKTOK</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-[3rem] bg-primary p-12 text-white overflow-hidden relative group">
              <Globe className="absolute -bottom-10 -right-10 w-48 h-48 text-white/10 group-hover:rotate-12 transition-transform duration-1000" />
              <div className="relative z-10 space-y-6">
                <h4 className="text-3xl font-headline font-black uppercase leading-none">REJOINDRE <br/>LE RÉSEAU.</h4>
                <p className="text-white/70 font-medium leading-relaxed">Devenir partenaire officiel de la ONECUP Elite 2026 et bénéficiez d'une visibilité sans précédent.</p>
                <Button className="bg-white text-primary hover:bg-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-8">DOSSIER SPONSOR</Button>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

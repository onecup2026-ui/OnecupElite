
"use client";

import { ShieldCheck, Eye, Lock, Database, Globe, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <header className="bg-secondary text-white py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10 text-center space-y-6">
          <Badge variant="outline" className="border-primary text-primary px-8 py-2 rounded-full font-black uppercase tracking-widest text-[10px]">INTÉGRITÉ & SÉCURITÉ</Badge>
          <h1 className="text-6xl md:text-9xl font-headline font-black uppercase tracking-tighter leading-none">CONFIDENTI- <br/><span className="text-white/40">ALITÉ.</span></h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-20">
          
          <section className="space-y-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tight">ENGAGEMENT ÉLITE</h2>
            </div>
            
            <div className="space-y-8 text-slate-500 font-medium leading-relaxed text-lg">
              <p>Chez ONECUP Elite, nous considérons la protection de vos données comme une discipline de haut niveau. Cette politique détaille comment nous traitons vos informations avec la même rigueur que nous appliquons à l'arbitrage de nos matchs.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-50 rounded-[2rem] space-y-4">
                  <Database className="w-6 h-6 text-primary" />
                  <h3 className="font-black uppercase text-sm tracking-widest text-slate-900">Collecte de Données</h3>
                  <p className="text-sm">Nous collectons uniquement les données nécessaires à votre inscription : nom, email, téléphone et photo de profil via Google Auth.</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2rem] space-y-4">
                  <Lock className="w-6 h-6 text-primary" />
                  <h3 className="font-black uppercase text-sm tracking-widest text-slate-900">Sécurité Firebase</h3>
                  <p className="text-sm">Vos données sont stockées de manière sécurisée sur l'infrastructure Google Firebase, avec des règles de sécurité strictes.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary">
                <Eye className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tight">VOS DROITS</h2>
            </div>

            <div className="space-y-8 text-slate-500 font-medium leading-relaxed text-lg">
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-3 shrink-0" />
                  <p><strong>Droit d'accès :</strong> Vous pouvez demander une copie de toutes les données liées à votre profil ONECUP.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-3 shrink-0" />
                  <p><strong>Droit de suppression :</strong> Vous pouvez demander la suppression définitive de votre compte et de vos données d'inscription.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-3 shrink-0" />
                  <p><strong>Utilisation média :</strong> En participant, vous acceptez que votre image puisse être utilisée à des fins promotionnelles de l'événement.</p>
                </li>
              </ul>
            </div>
          </section>

          <div className="pt-20 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Dernière mise à jour : Juillet 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}

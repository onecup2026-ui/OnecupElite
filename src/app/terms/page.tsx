
"use client";

import { Gavel, AlertCircle, CheckCircle2, FileText, Scale, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      <header className="bg-secondary text-white py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10 text-center space-y-6">
          <Badge variant="outline" className="border-primary text-primary px-8 py-2 rounded-full font-black uppercase tracking-widest text-[10px]">CADRE JURIDIQUE</Badge>
          <h1 className="text-6xl md:text-9xl font-headline font-black uppercase tracking-tighter leading-none">CONDITIONS <br/><span className="text-white/40">D'UTILISATION.</span></h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-20">
          
          <section className="space-y-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary">
                <Gavel className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tight">CONTRAT ÉLITE</h2>
            </div>
            
            <div className="space-y-8 text-slate-500 font-medium leading-relaxed text-lg">
              <p>L'utilisation de la plateforme ONECUP Elite implique l'acceptation pleine et entière des présentes conditions. Nous vous encourageons à les lire avec attention avant toute inscription.</p>
              
              <div className="space-y-12 pt-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-headline font-black uppercase text-slate-900">1. Éligibilité</h3>
                  <p>La participation aux tournois est réservée aux personnes physiques âgées de 16 ans révolus au jour de l'inscription. Une autorisation parentale est requise pour tous les mineurs.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-headline font-black uppercase text-slate-900">2. Inscription et Validation</h3>
                  <p>Toute inscription est soumise à la validation de l'administrateur. Le paiement des frais d'inscription (lorsqu'ils s'appliquent) doit être effectué selon les modalités précisées pour garantir votre place.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-headline font-black uppercase text-slate-900">3. Code de Conduite</h3>
                  <p>Le respect est au cœur de l'Elite. Toute forme de triche, de harcèlement ou de comportement antisportif entraînera une exclusion immédiate de la plateforme et des compétitions futures, sans remboursement possible.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-headline font-black uppercase text-slate-900">4. Propriété Intellectuelle</h3>
                  <p>Tous les contenus présents sur cette plateforme (logos, designs, codes, textes) sont la propriété exclusive d'ONE CUP Platform.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="p-12 bg-primary/5 rounded-[3rem] border border-primary/10 flex flex-col md:flex-row items-center gap-10">
            <Scale className="w-16 h-16 text-primary shrink-0" />
            <div className="space-y-4">
              <h3 className="text-2xl font-headline font-black uppercase leading-none">FORCE MAJEURE</h3>
              <p className="text-slate-500 font-medium">L'organisation se réserve le droit de modifier le calendrier ou le format de la compétition en cas de force majeure, tout en garantissant l'équité sportive pour toutes les équipes engagées.</p>
            </div>
          </div>

          <div className="pt-20 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">ONECUP PLATFORM © 2026 - TOUS DROITS RÉSERVÉS</p>
          </div>
        </div>
      </div>
    </div>
  );
}

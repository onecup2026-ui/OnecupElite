
"use client";

import { Search, MessageCircle, Ticket, Trophy, UserCheck, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    category: "INSCRIPTIONS",
    icon: UserCheck,
    items: [
      {
        q: "Comment inscrire mon équipe au tournoi ?",
        a: "Pour inscrire votre équipe, rendez-vous sur la page 'Tournois', sélectionnez la compétition de votre choix et remplissez le formulaire d'inscription. Un compte utilisateur est requis pour valider l'inscription."
      },
      {
        q: "Quels sont les frais d'inscription ?",
        a: "Les frais varient selon les tournois. Ils sont indiqués clairement sur la page de détail de chaque compétition. Le paiement se fait généralement lors de la validation physique des dossiers."
      },
      {
        q: "Puis-je modifier ma liste de joueurs après l'inscription ?",
        a: "Oui, les modifications sont possibles jusqu'à 48h avant le début de la compétition en contactant l'administration via votre profil."
      }
    ]
  },
  {
    category: "BILLETS & ACCÈS",
    icon: Ticket,
    items: [
      {
        q: "Où acheter mes billets pour la finale ?",
        a: "Les billets officiels sont disponibles exclusivement sur notre plateforme partenaire 'Digital Event' via le lien dans la section 'Billetterie' de notre site."
      },
      {
        q: "Le pass After Cup est-il inclus dans le billet du match ?",
        a: "Nous proposons des billets combinés et des pass séparés pour le festival. Consultez les options lors de votre achat sur la billetterie officielle."
      }
    ]
  },
  {
    category: "COMPÉTITION",
    icon: Trophy,
    items: [
      {
        q: "Quel est le format du tournoi ?",
        a: "La ONECUP Elite se joue en format élimination directe (Bracket) commençant dès les huitièmes de finale pour le tournoi principal."
      },
      {
        q: "Comment sont distribuées les récompenses ?",
        a: "La cagnotte est remise officiellement lors de la cérémonie de l'After Cup le 25 juillet 2026."
      }
    ]
  }
];

export default function HelpPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header Prestigieux */}
      <header className="bg-primary text-white py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10 text-center space-y-6">
          <Badge className="bg-white/20 text-white px-8 py-2 rounded-full font-black uppercase tracking-widest text-[10px] backdrop-blur-md">CENTRE D'ASSISTANCE</Badge>
          <h1 className="text-6xl md:text-9xl font-headline font-black uppercase tracking-tighter leading-none">FAQ <br/><span className="text-white/40">ELITE.</span></h1>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </header>

      <div className="container mx-auto px-4 py-24 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* FAQ Sections */}
          <div className="lg:col-span-8 space-y-16">
            {faqs.map((section, idx) => (
              <div key={idx} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                    <section.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-headline font-black uppercase tracking-widest">{section.category}</h2>
                </div>

                <div className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    {section.items.map((item, i) => (
                      <AccordionItem key={i} value={`item-${idx}-${i}`} className="border-b border-slate-100 last:border-0 mb-4 bg-slate-50/50 rounded-2xl px-6">
                        <AccordionTrigger className="text-left font-bold uppercase text-sm py-6 hover:no-underline hover:text-primary transition-colors">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-500 font-medium pb-6 leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Aide */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-[3rem] border-none shadow-xl p-10 bg-slate-900 text-white space-y-8 sticky top-24">
              <div className="space-y-4">
                <HelpCircle className="w-12 h-12 text-primary" />
                <h3 className="text-2xl font-headline font-black uppercase leading-tight">ENCORE DES QUESTIONS ?</h3>
                <p className="text-white/60 font-medium leading-relaxed">Notre équipe de modérateurs et d'arbitres est disponible 24/7 pour vous assister durant l'événement.</p>
              </div>
              
              <div className="space-y-4 pt-4">
                <Button className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-3">
                  <MessageCircle className="w-4 h-4" /> CHAT EN DIRECT
                </Button>
                <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-transparent text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10">
                  NOUS ÉCRIRE
                </Button>
              </div>

              <div className="pt-8 border-t border-white/5">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.5em] mb-4 text-center">RÉPONSE SOUS 2 HEURES</p>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Menu, X, Plus, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { name: "TOURNOIS ET ÉVÉNEMENTS", href: "/tournaments", hasSub: true },
  { name: "MATCH CENTRE", href: "/results", hasSub: false },
  { name: "L'ACTU", href: "/news", hasSub: false },
  { name: "BILLETS ET HOSPITALITÉ", href: "/tickets", hasSub: false },
  { name: "COMMUNAUTÉ ELITE", href: "/community", hasSub: false },
];

const secondaryItems = [
  { name: "ONE CUP REWARDS", href: "#" },
  { name: "ONE CUP+", href: "https://fifa.com", external: true },
  { name: "ELITE STORE", href: "#", external: true },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const auth = useAuth();

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <nav className="sticky top-0 z-[100] w-full bg-primary text-white border-b border-white/10 shadow-xl">
      <div className="container mx-auto px-4 h-20 md:h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
            <Trophy className="text-primary w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-black text-2xl md:text-3xl tracking-tighter uppercase leading-none">
              ONECUP
            </span>
            <span className="text-white/60 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] leading-none mt-1">
              ELITE 2026
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "px-6 h-12 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 text-white rounded-xl transition-all",
                  pathname === item.href && "bg-white/20"
                )}
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-white/20 shadow-xl cursor-pointer hover:border-white transition-all">
              <AvatarImage src={user.photoURL || ""} />
              <AvatarFallback className="bg-white/10">{user.displayName?.[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <Button onClick={handleLogin} className="hidden md:flex bg-white text-primary hover:bg-white/90 font-black uppercase text-[10px] px-8 h-12 rounded-xl shadow-xl transition-all">
              Connexion
            </Button>
          )}
          <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors" onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Full Screen Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-primary text-white overflow-y-auto animate-in fade-in duration-300">
          <div className="container mx-auto px-6 py-6 flex flex-col min-h-screen">
            {/* Header Overlay */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                <Globe className="w-4 h-4" />
                <span className="font-black text-xs uppercase tracking-widest">Français</span>
                <Plus className="w-3 h-3 rotate-45 ml-2" />
              </div>
              <button 
                className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="space-y-4 mb-20">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-6 border-b border-white/5 group"
                >
                  <span className="text-xl md:text-3xl font-black uppercase tracking-tighter group-hover:text-white/70 transition-colors">
                    {item.name}
                  </span>
                  {item.hasSub && <Plus className="w-6 h-6 text-white/40" />}
                </Link>
              ))}
            </div>

            {/* Secondary Section */}
            <div className="mt-auto space-y-10 pb-12">
              <div className="pt-8 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-10">
                  CONTENU SUPPLÉMENTAIRE ELITE
                </p>
                <div className="space-y-8">
                  {secondaryItems.map((item) => (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      target={item.external ? "_blank" : undefined}
                      className="flex items-center justify-between group"
                    >
                      <span className="text-lg font-black uppercase tracking-widest group-hover:text-white/70">
                        {item.name}
                      </span>
                      {item.external && <ExternalLink className="w-5 h-5 text-white/40" />}
                    </Link>
                  ))}
                </div>
              </div>
              
              {user ? (
                <Button 
                  onClick={() => { auth && signOut(auth); setIsOpen(false); }} 
                  variant="outline" 
                  className="w-full h-16 border-white/20 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10"
                >
                  Déconnexion
                </Button>
              ) : (
                <Button 
                  onClick={() => { handleLogin(); setIsOpen(false); }} 
                  className="w-full h-16 bg-white text-primary font-black uppercase tracking-widest rounded-2xl hover:bg-white/90"
                >
                  Connexion au compte
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

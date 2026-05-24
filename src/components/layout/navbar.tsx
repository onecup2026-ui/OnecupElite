"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Menu, X, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth, useUser } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { name: "Compétitions", href: "/tournaments" },
  { name: "Résultats", href: "/results" },
  { name: "Actualités", href: "/news" },
  { name: "Communauté", href: "/community" },
  { name: "Billets", href: "/tickets" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const auth = useAuth();

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <nav className="sticky top-0 z-[100] w-full bg-primary text-white border-b border-white/10 shadow-2xl">
      <div className="container mx-auto px-4 h-16 md:h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-[1rem] flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95">
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
        <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "px-8 h-12 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 text-white rounded-xl transition-all",
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
            <div className="flex items-center gap-4">
               <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-white/20 shadow-xl cursor-pointer hover:border-white transition-all">
                <AvatarImage src={user.photoURL || ""} />
                <AvatarFallback className="bg-white/10">{user.displayName?.[0]}</AvatarFallback>
              </Avatar>
              <Button onClick={() => auth && signOut(auth)} variant="ghost" className="hidden md:flex font-bold uppercase text-[9px] tracking-widest text-white/60 hover:text-white">Déconnexion</Button>
            </div>
          ) : (
            <Button onClick={handleLogin} className="bg-white text-primary hover:bg-white/90 font-black uppercase text-[10px] px-8 h-12 rounded-xl shadow-xl transition-all hover:scale-105">
              Connexion
            </Button>
          )}
          <button className="lg:hidden p-2 bg-white/10 rounded-xl" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden bg-primary border-t border-white/10 p-6 space-y-3 animate-fifa-in shadow-inner">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className={cn(
                "w-full justify-start text-white font-black uppercase text-xs h-14 px-6 rounded-2xl",
                pathname === item.href ? "bg-white/10" : "hover:bg-white/5"
              )}>
                {item.name}
              </Button>
            </Link>
          ))}
          {user && (
            <Button onClick={() => auth && signOut(auth)} variant="destructive" className="w-full h-14 rounded-2xl font-black uppercase text-xs mt-6">
              Déconnexion
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
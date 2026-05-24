
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useAuth, useUser, useDoc, useFirestore } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { doc } from "firebase/firestore";

const navItems = [
  { name: "TOURNOIS", href: "/tournaments" },
  { name: "RÉCOMPENSES", href: "/rewards" },
  { name: "RÉSULTATS", href: "/results" },
  { name: "NEWS", href: "/news" },
  { name: "BILLETS", href: "/tickets" },
  { name: "COMMUNAUTÉ", href: "/community" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const configRef = useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);
  const { data: siteConfig } = useDoc(configRef);

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
    <nav className="sticky top-0 z-[100] w-full bg-primary text-white transition-all duration-500 border-b border-white/5">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          {siteConfig?.logoUrl ? (
            <img src={siteConfig.logoUrl} alt="ONECUP Logo" className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
          ) : (
            <span className="font-headline font-black text-2xl md:text-4xl tracking-tighter uppercase leading-none">
              ONE CUP
            </span>
          )}
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden xl:flex items-center h-full">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="h-full">
              <Button
                variant="ghost"
                className={cn(
                  "px-6 h-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/5 text-white/70 hover:text-white rounded-none transition-all border-b-4 border-transparent",
                  pathname === item.href && "border-white text-white bg-white/5"
                )}
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10 rounded-full w-10 h-10">
            <Search className="w-5 h-5" />
          </Button>
          
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <Avatar className="w-10 h-10 border-2 border-white/20 cursor-pointer hover:border-white transition-all" onClick={() => auth && signOut(auth)}>
                <AvatarImage src={user.photoURL || ""} />
                <AvatarFallback className="bg-white/10 text-[10px] font-black">{user.displayName?.[0]}</AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleLogin} className="text-white/60 hover:text-white hover:bg-white/10 rounded-full w-10 h-10">
              <User className="w-5 h-5" />
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full w-10 h-10 xl:hidden" onClick={() => setIsOpen(true)}>
            <Menu className="w-7 h-7" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-primary/98 backdrop-blur-3xl text-white overflow-y-auto animate-in fade-in duration-500">
          <div className="container mx-auto px-8 py-8 flex flex-col min-h-screen">
            <div className="flex items-center justify-between mb-16">
              <span className="font-headline font-black text-[11px] uppercase tracking-[0.6em] opacity-40">NAVIGATION ELITE</span>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => setIsOpen(false)}>
                <X className="w-8 h-8" />
              </Button>
            </div>

            <div className="space-y-2 mb-20">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-6 border-b border-white/5 group transition-all"
                >
                  <span className="text-sm font-black uppercase tracking-[0.5em] group-hover:pl-4 transition-all opacity-80 group-hover:opacity-100">
                    {item.name}
                  </span>
                  <Plus className="w-4 h-4 text-white/20 group-hover:text-white" />
                </Link>
              ))}
            </div>

            <div className="mt-auto space-y-10 pb-16">
               <div className="flex justify-center">
                 <Button onClick={() => { handleLogin(); setIsOpen(false); }} variant="outline" className="w-full max-w-xs h-16 border-white/20 bg-transparent text-white font-black uppercase tracking-[0.4em] rounded-[1.5rem] hover:bg-white/10 text-[10px]">
                   {user ? "QUITTER LA SESSION" : "CONNEXION JOUEUR"}
                 </Button>
               </div>
               <p className="text-center text-[9px] uppercase font-black tracking-[0.8em] opacity-20">ONECUP PLATFORM 2026</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}


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
    <nav className="sticky top-0 z-[100] w-full bg-primary text-white transition-colors duration-500">
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {siteConfig?.logoUrl ? (
            <img src={siteConfig.logoUrl} alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
          ) : (
            <span className="font-headline font-black text-2xl md:text-3xl tracking-tighter uppercase leading-none">
              ONE CUP
            </span>
          )}
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden xl:flex items-center gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "px-4 h-16 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 text-white rounded-none transition-all border-b-2 border-transparent",
                  pathname === item.href && "border-white bg-white/5"
                )}
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-1 md:gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full w-9 h-9">
            <Search className="w-4 h-4" />
          </Button>
          
          {user ? (
            <Avatar className="w-8 h-8 border border-white/20 cursor-pointer" onClick={() => auth && signOut(auth)}>
              <AvatarImage src={user.photoURL || ""} />
              <AvatarFallback className="bg-white/10 text-[9px]">{user.displayName?.[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleLogin} className="text-white hover:bg-white/10 rounded-full w-9 h-9">
              <User className="w-4 h-4" />
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full w-9 h-9 xl:hidden" onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-primary/95 backdrop-blur-2xl text-white overflow-y-auto animate-in fade-in duration-500">
          <div className="container mx-auto px-6 py-6 flex flex-col min-h-screen">
            <div className="flex items-center justify-between mb-12">
              <span className="font-headline font-bold text-[10px] uppercase tracking-[0.5em] opacity-60">MENU</span>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => setIsOpen(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="space-y-1 mb-20">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-5 border-b border-white/5 group transition-all"
                >
                  <span className="text-[11px] font-medium uppercase tracking-[0.4em] group-hover:pl-2 transition-all opacity-90">
                    {item.name}
                  </span>
                  <Plus className="w-3 h-3 text-white/20" />
                </Link>
              ))}
            </div>

            <div className="mt-auto space-y-8 pb-12">
               <div className="flex justify-center">
                 <Button onClick={() => { handleLogin(); setIsOpen(false); }} variant="outline" className="w-fit px-12 h-12 border-white/20 bg-transparent text-white font-bold uppercase tracking-[0.3em] rounded-xl hover:bg-white/10 text-[9px]">
                   {user ? "MON PROFIL" : "CONNEXION"}
                 </Button>
               </div>
               <p className="text-center text-[8px] uppercase font-bold tracking-[0.6em] opacity-30">ONE CUP ELITE 2026</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

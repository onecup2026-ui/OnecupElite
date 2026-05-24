
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Menu, X, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { name: "TOURNOIS", href: "/tournaments" },
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
    <nav className="sticky top-0 z-[100] w-full bg-[#0051a3] text-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-headline font-black text-2xl md:text-3xl tracking-tighter uppercase leading-none">
            FIFA
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "px-4 h-16 font-black text-[11px] uppercase tracking-widest hover:bg-white/10 text-white rounded-none transition-all border-b-4 border-transparent",
                  pathname === item.href && "border-white bg-white/5"
                )}
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full w-10 h-10">
            <Search className="w-5 h-5" />
          </Button>
          
          {user ? (
            <Avatar className="w-8 h-8 md:w-10 md:h-10 border border-white/20 cursor-pointer" onClick={() => auth && signOut(auth)}>
              <AvatarImage src={user.photoURL || ""} />
              <AvatarFallback className="bg-white/10 text-[10px]">{user.displayName?.[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleLogin} className="text-white hover:bg-white/10 rounded-full w-10 h-10">
              <User className="w-5 h-5" />
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full w-10 h-10" onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-[#0051a3] text-white overflow-y-auto animate-in fade-in duration-300">
          <div className="container mx-auto px-6 py-6 flex flex-col min-h-screen">
            <div className="flex items-center justify-between mb-12">
              <span className="font-headline font-black text-2xl uppercase">MENU</span>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => setIsOpen(false)}>
                <X className="w-8 h-8" />
              </Button>
            </div>

            <div className="space-y-4 mb-20">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-6 border-b border-white/10 group"
                >
                  <span className="text-3xl font-black uppercase tracking-tighter">
                    {item.name}
                  </span>
                  <Plus className="w-6 h-6 text-white/40" />
                </Link>
              ))}
            </div>

            <div className="mt-auto space-y-6 pb-12">
               <Button onClick={() => { handleLogin(); setIsOpen(false); }} className="w-full h-16 bg-white text-[#0051a3] font-black uppercase tracking-widest rounded-full hover:bg-white/90 shadow-xl">
                 {user ? "MON COMPTE" : "CONNEXION"}
               </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

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
  { name: "Tournois", href: "/tournaments" },
  { name: "Résultats", href: "/results" },
  { name: "Actualités", href: "/news" },
  { name: "Communauté", href: "/community" },
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
    <nav className="sticky top-0 z-50 w-full bg-primary text-white border-b border-white/10 shadow-xl">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Trophy className="text-primary w-6 h-6" />
          </div>
          <span className="font-headline font-black text-2xl tracking-tighter uppercase">
            ONECUP<span className="text-white/60">2026</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "px-6 h-12 font-black text-xs uppercase tracking-widest hover:bg-white/10 text-white rounded-full",
                  pathname === item.href && "bg-white/10"
                )}
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Avatar className="w-10 h-10 border-2 border-white/20">
              <AvatarImage src={user.photoURL || ""} />
              <AvatarFallback className="bg-white/10">{user.displayName?.[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <Button onClick={handleLogin} className="bg-white text-primary hover:bg-white/90 font-black uppercase text-[10px] px-6 h-10 rounded-full">
              Connexion
            </Button>
          )}
          <button className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-primary border-t border-white/10 p-4 space-y-2 animate-fifa-in">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-white font-black uppercase text-xs h-12">
                {item.name}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
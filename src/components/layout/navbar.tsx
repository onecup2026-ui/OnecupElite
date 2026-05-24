
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Menu, X, LogIn, LogOut, Loader2, Search, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth, useUser } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ADMIN_EMAIL = "onecup2026@gmail.com";

const navItems = [
  { name: "Tournois", href: "/tournaments" },
  { name: "Calendrier", href: "/calendar" },
  { name: "Communauté", href: "/community" },
  { name: "Résultats", href: "/results" },
  { name: "Actualités", href: "/news" },
  { name: "After Cup", href: "/after-cup" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const auth = useAuth();
  const { user, loading } = useUser();
  const { toast } = useToast();

  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleLogin = async () => {
    if (!auth || isAuthenticating) return;
    setIsAuthenticating(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Bienvenue !", description: "Vous êtes maintenant connecté." });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: "Déconnexion", description: "À bientôt." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur" });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0051a3] text-white border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded flex items-center justify-center">
            <Trophy className="text-[#0051a3] w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="font-headline font-black text-xl md:text-2xl tracking-tighter uppercase">
            ONECUP<span className="text-white/60">2026</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "px-4 h-10 font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white",
                  pathname === item.href && "bg-white/10 text-white"
                )}
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-white/10 text-white">
            <Search className="w-5 h-5" />
          </Button>

          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-white/60" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="hidden md:flex h-9 border-white/20 text-white bg-white/10 hover:bg-white hover:text-[#0051a3] font-bold uppercase text-[10px]">
                    Admin
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full p-0 overflow-hidden border border-white/20 hover:bg-white/10">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback className="bg-[#003d7a] text-white">{user.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 bg-white text-slate-900">
                  <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase border-b mb-1 tracking-widest">
                    Mon compte Elite
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer font-bold uppercase text-xs">
                    <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button onClick={handleLogin} disabled={isAuthenticating} className="bg-white text-[#0051a3] hover:bg-white/90 h-9 md:h-10 px-6 font-black uppercase text-[10px] tracking-widest rounded-full shadow-lg">
              <UserIcon className="w-4 h-4 mr-2" /> Connexion
            </Button>
          )}

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0051a3] px-4 py-6 space-y-4 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start h-14 text-sm font-black uppercase tracking-widest hover:bg-white/10 text-white",
                    pathname === item.href && "bg-white/10"
                  )}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-white/10">
            {user ? (
              <div className="space-y-3">
                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-12 border-white/20 text-white bg-white/10 font-black uppercase text-xs">Tableau de bord Admin</Button>
                  </Link>
                )}
                <Button onClick={handleLogout} variant="destructive" className="w-full h-12 font-black uppercase text-xs">Déconnexion</Button>
              </div>
            ) : (
              <Button onClick={handleLogin} className="w-full h-14 bg-white text-[#0051a3] font-black uppercase tracking-widest text-xs rounded-xl">Se connecter</Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

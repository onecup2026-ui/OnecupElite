"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Calendar, Users, Newspaper, Ticket, PartyPopper, Menu, X, LogIn, LogOut, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

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
    <nav className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <Trophy className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight uppercase">
            ONECUP<span className="text-primary">2026</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "px-4 h-9 font-semibold text-sm",
                  pathname === item.href && "text-primary bg-primary/5"
                )}
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="h-9 border-primary text-primary hover:bg-primary hover:text-white">
                    Admin
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase border-b mb-1">
                    Mon compte
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button onClick={handleLogin} disabled={isAuthenticating} className="h-9 px-6 font-bold">
              Connexion
            </Button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-muted-foreground" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t bg-white px-4 py-6 space-y-4">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start h-12 text-sm font-semibold",
                    pathname === item.href && "text-primary bg-primary/5"
                  )}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t">
            {user ? (
              <div className="space-y-3">
                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-12">Tableau de bord Admin</Button>
                  </Link>
                )}
                <Button onClick={handleLogout} variant="destructive" className="w-full h-12">Déconnexion</Button>
              </div>
            ) : (
              <Button onClick={handleLogin} className="w-full h-12 font-bold">Se connecter</Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
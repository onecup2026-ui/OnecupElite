
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Calendar, Users, Newspaper, Ticket, PartyPopper, LayoutDashboard, Menu, X, LogIn, LogOut, ShieldCheck, Loader2 } from "lucide-react";
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
  { name: "Tournois", href: "/tournaments", icon: Trophy },
  { name: "Communauté", href: "/community", icon: Users },
  { name: "Calendrier", href: "/calendar", icon: Calendar },
  { name: "Actualités", href: "/news", icon: Newspaper },
  { name: "Billetterie", href: "/tickets", icon: Ticket },
  { name: "After Cup", href: "/after-cup", icon: PartyPopper },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const auth = useAuth();
  const { user, loading } = useUser();
  const { toast } = useToast();

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogin = async () => {
    if (!auth || isAuthenticating) return;
    setIsAuthenticating(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Connexion réussie", description: "Bienvenue sur OneCup Elite !" });
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: "Déconnexion", description: "À bientôt !" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de se déconnecter." });
    }
  };

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full transition-all duration-500",
      scrolled ? "py-2 bg-background/80 backdrop-blur-2xl border-b shadow-lg" : "py-6 bg-transparent"
    )}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center glow-blue transition-all group-hover:scale-110 group-hover:rotate-3">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <span className="font-headline text-2xl font-black tracking-tighter uppercase">
            ONECUP<span className="text-primary">ELITE</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-2 glass-card border-white/5 px-2 py-1.5 rounded-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2 transition-all hover:bg-muted/50 px-4 h-10 rounded-full",
                    isActive && "text-primary bg-primary/10 shadow-inner"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-black text-[10px] uppercase tracking-widest">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {(loading || isAuthenticating) ? (
            <div className="glass-card p-2 rounded-full"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : user ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" className="gap-2 h-10 text-[10px] font-black uppercase border-primary/20 text-primary hover:bg-primary/5 rounded-full px-6">
                    <ShieldCheck className="w-4 h-4" /> Admin
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 overflow-hidden ring-4 ring-primary/10 hover:ring-primary/30 transition-all shadow-xl">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback className="bg-primary/20 text-primary font-black uppercase text-xs">{user.displayName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-3 glass-card rounded-3xl mt-4">
                  <div className="flex flex-col space-y-1 p-3 mb-2 bg-muted/30 rounded-2xl">
                    <p className="text-sm font-black uppercase tracking-tight">{user.displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate font-medium">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/5 my-2" />
                  {isAdmin && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-12">
                      <Link href="/admin" className="flex items-center gap-3">
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        <span className="font-bold text-xs uppercase">Dashboard Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer rounded-xl h-12">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-bold text-xs uppercase">Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button onClick={handleLogin} disabled={isAuthenticating} className="bg-primary hover:bg-primary/90 glow-blue h-12 text-[10px] font-black uppercase px-8 rounded-full transition-all hover:scale-105 active:scale-95">
              {isAuthenticating ? "Chargement..." : "Connexion"}
            </Button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-3 glass-card rounded-xl transition-all active:scale-90" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "lg:hidden absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl transition-all duration-500 ease-out transform origin-top",
        isOpen ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-0 -translate-y-10 pointer-events-none"
      )}>
        <div className="flex flex-col p-6 gap-3">
          {user && (
            <div className="flex items-center gap-4 p-4 glass-card rounded-3xl mb-4">
               <Avatar className="h-14 w-14 ring-4 ring-primary/20">
                <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                <AvatarFallback className="font-black text-lg">{user.displayName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-lg font-black uppercase tracking-tight">{user.displayName}</p>
                <p className="text-xs text-muted-foreground font-medium">{user.email}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={pathname === item.href ? "secondary" : "ghost"} 
                  className={cn(
                    "w-full justify-start gap-5 h-14 rounded-2xl text-xs font-black uppercase tracking-widest",
                    pathname === item.href && "bg-primary/10 text-primary border border-primary/20"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
          
          <div className="h-px bg-white/5 my-4" />
          
          <div className="grid grid-cols-1 gap-3">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" className="w-full justify-start gap-5 h-14 rounded-2xl text-xs font-black uppercase tracking-widest border-primary/20 text-primary">
                      <ShieldCheck className="w-5 h-5" /> Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Button onClick={handleLogout} variant="destructive" className="w-full justify-start gap-5 h-14 rounded-2xl text-xs font-black uppercase tracking-widest">
                  <LogOut className="w-5 h-5" /> Déconnexion
                </Button>
              </>
            ) : (
              <Button onClick={handleLogin} disabled={isAuthenticating} className="w-full bg-primary h-16 text-sm font-black uppercase glow-blue rounded-2xl">
                Se connecter à l'Elite
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

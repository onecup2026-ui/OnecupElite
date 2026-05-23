
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Calendar, Users, Newspaper, Ticket, PartyPopper, LayoutDashboard, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const auth = useAuth();
  const { user, loading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Connexion réussie", description: "Bon retour parmi l'élite !" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "La connexion a échoué." });
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: "Déconnexion", description: "À bientôt sur OneCup Elite." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Déconnexion impossible." });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center glow-blue transition-transform group-hover:scale-105">
            <Trophy className="text-white w-5 h-5" />
          </div>
          <span className="font-headline text-lg md:text-xl font-bold tracking-tighter uppercase">
            ONECUP<span className="text-primary">ELITE</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2 transition-all hover:bg-muted/50 px-3 h-9",
                    isActive && "text-primary bg-primary/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" className="gap-2 h-9 text-xs font-bold uppercase border-white/20">
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Button>
          </Link>

          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border border-primary/20">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90 glow-blue h-9 text-xs font-bold uppercase px-6">
                S'inscrire
              </Button>
            )
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-muted-foreground hover:bg-muted/50 rounded-lg transition-colors" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "lg:hidden absolute top-16 left-0 w-full bg-background border-b shadow-2xl transition-all duration-300 ease-in-out transform origin-top",
        isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
      )}>
        <div className="flex flex-col p-4 gap-2 bg-card/50">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button 
                variant={pathname === item.href ? "secondary" : "ghost"} 
                className="w-full justify-start gap-4 h-12 text-sm font-bold uppercase"
              >
                <item.icon className="w-5 h-5 text-primary" />
                {item.name}
              </Button>
            </Link>
          ))}
          <div className="h-px bg-border my-2" />
          
          {user ? (
            <Button onClick={handleLogout} variant="destructive" className="w-full justify-start gap-4 h-12 text-sm font-bold uppercase">
              <LogOut className="w-5 h-5" /> Déconnexion
            </Button>
          ) : (
            <Button onClick={handleLogin} className="w-full bg-primary h-12 text-sm font-bold uppercase glow-blue mt-2">
              S'inscrire Maintenant
            </Button>
          )}

          <Link href="/admin">
            <Button variant="outline" className="w-full justify-start gap-4 h-12 text-sm font-bold uppercase border-white/10 mt-2">
              <LayoutDashboard className="w-5 h-5" />
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

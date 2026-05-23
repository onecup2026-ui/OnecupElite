
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Calendar, Users, Newspaper, Ticket, PartyPopper, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
          <Button className="bg-primary hover:bg-primary/90 glow-blue h-9 text-xs font-bold uppercase px-6">S'inscrire</Button>
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
          <Link href="/admin">
            <Button variant="outline" className="w-full justify-start gap-4 h-12 text-sm font-bold uppercase border-white/10">
              <LayoutDashboard className="w-5 h-5" />
              Admin Dashboard
            </Button>
          </Link>
          <Button className="w-full bg-primary h-12 text-sm font-bold uppercase glow-blue mt-2">S'inscrire Maintenant</Button>
        </div>
      </div>
    </nav>
  );
}

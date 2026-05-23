
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Calendar, Users, Newspaper, Ticket, PartyPopper, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { name: "Tournaments", href: "/tournaments", icon: Trophy },
  { name: "Community", href: "/community", icon: Users },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Ticketing", href: "/tickets", icon: Ticket },
  { name: "After Cup", href: "/after-cup", icon: PartyPopper },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center glow-blue transition-transform group-hover:scale-110">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tighter">
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
                    "flex items-center gap-2 transition-all hover:bg-muted/50",
                    isActive && "text-primary bg-primary/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <Button className="bg-primary hover:bg-primary/90">Join Tournament</Button>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2 text-muted-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-card border-b animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Button>
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Button>
            </Link>
            <Button className="w-full bg-primary h-12">Join Tournament</Button>
          </div>
        </div>
      )}
    </nav>
  );
}

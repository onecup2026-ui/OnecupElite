
import Link from "next/link";
import { Trophy, Instagram, Twitter, Youtube, Facebook, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t py-12 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Trophy className="text-white w-5 h-5" />
            </div>
            <span className="font-headline text-lg font-bold">ONECUP ELITE</span>
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The premium ecosystem for competitive sports and digital entertainment. Empowering teams, athletes, and organizers globally.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="p-2 bg-muted rounded-full hover:bg-primary transition-colors hover:text-white">
              <Twitter className="w-4 h-4" />
            </Link>
            <Link href="#" className="p-2 bg-muted rounded-full hover:bg-primary transition-colors hover:text-white">
              <Instagram className="w-4 h-4" />
            </Link>
            <Link href="#" className="p-2 bg-muted rounded-full hover:bg-primary transition-colors hover:text-white">
              <Youtube className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-headline font-bold mb-6 text-sm uppercase tracking-widest text-primary">Platform</h4>
          <ul className="space-y-3">
            <li><Link href="/tournaments" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">All Tournaments <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
            <li><Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">Community Hub <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
            <li><Link href="/results" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">Live Results <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
            <li><Link href="/tickets" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">Ticket Store <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline font-bold mb-6 text-sm uppercase tracking-widest text-primary">Company</h4>
          <ul className="space-y-3">
            <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About OneCup</Link></li>
            <li><Link href="/sponsors" className="text-muted-foreground hover:text-foreground transition-colors">Partnership</Link></li>
            <li><Link href="/news" className="text-muted-foreground hover:text-foreground transition-colors">Press & News</Link></li>
            <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline font-bold mb-6 text-sm uppercase tracking-widest text-primary">Support</h4>
          <ul className="space-y-3">
            <li><Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
            <li><Link href="/rules" className="text-muted-foreground hover:text-foreground transition-colors">Tournament Rules</Link></li>
            <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
        © 2026 ONE CUP Platform. All rights reserved. Designed for Elite Performance.
      </div>
    </footer>
  );
}

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block font-headline">
            ClaimFlow
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Dashboard
          </Link>
          <Link
            href="/claims/rejected"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Rejected Claims
          </Link>
          <Link
            href="/appeals/in-progress"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Appeals In Progress
          </Link>
          <Link
            href="/appeals/decided"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Decided Appeals
          </Link>
        </nav>
      </div>
    </header>
  );
}

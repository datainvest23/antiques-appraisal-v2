import Link from "next/link";
import { cn } from "@/lib/utils";

export function MainNav() {
  const routes = [
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#resources", label: "Resources" },
    { href: "/#professionals", label: "For Professionals" },
  ];

  return (
    <div className="flex items-center space-x-6 md:space-x-8">
      <Link href="/" className="flex items-center space-x-2">
        <span className="font-bold text-lg hidden sm:inline-block">ANTIQUES APPRAISAL</span>
        <span className="font-bold text-lg sm:hidden">AA</span>
      </Link>
      <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

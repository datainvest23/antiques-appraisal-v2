import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { LanguageSelector } from "@/components/language-selector";

export function AppHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2 md:space-x-4">
            <LanguageSelector />
            {user ? (
              <>
                <Link
                  href="/valuations"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "hidden md:inline-flex px-4 text-muted-foreground"
                  )}
                >
                  My Valuations
                </Link>
                <UserNav user={user} signOut={signOut} />
                <Link
                  href="/appraise"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-md transition-all whitespace-nowrap"
                  )}
                >
                  Appraise New <span className="ml-1 hidden sm:inline-block">→</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "px-4 text-foreground/80"
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/appraise"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-md transition-all whitespace-nowrap"
                  )}
                >
                  Start Free Appraisal <span className="ml-1 hidden sm:inline-block">→</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 
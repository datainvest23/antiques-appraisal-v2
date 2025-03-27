import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";

export function AppHeader() {
  const { user, signOut } = useAuth();
  
  return (
    <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  href="/appraise"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "px-4"
                  )}
                >
                  Appraise
                </Link>
                <Link
                  href="/valuations"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "px-4"
                  )}
                >
                  My Valuations
                </Link>
                <UserNav user={user} signOut={signOut} />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "px-4"
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "px-4"
                  )}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 
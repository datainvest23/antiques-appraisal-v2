"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Menu, Award, User, LogOut, Loader2, Globe } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSelector } from "@/components/language-selector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface UserData {
  email?: string
  id: string
}

interface NavigationProps {
  user: UserData | null
  userFullName: string | null
  isAdmin: boolean
  pathname?: string
  onClose?: () => void
}

interface UserMenuProps {
  user: UserData
  userFullName: string | null
  isAdmin: boolean
  signOut: () => void
  className?: string
}

function UserMenu({ user, userFullName, isAdmin, signOut, className }: UserMenuProps) {
  const { t } = useLanguage()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("rounded-full", className)}>
          <User className="h-5 w-5" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{userFullName || user.email || 'User'}</p>
            {(!userFullName && user.email) && <p className="text-xs text-muted-foreground">{user.email}</p>}
            {isAdmin && <p className="text-xs text-muted-foreground">Administrator</p>}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">{t('nav_profile')}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/referrals" className="flex items-center">
            <Award className="mr-2 h-4 w-4" /> {t('nav_refer')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 cursor-pointer"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" /> {t('nav_logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DesktopNavigation({ user, userFullName, isAdmin, pathname, signOut }: NavigationProps & { signOut: () => void }) {
  const { t } = useLanguage()

  return (
    <nav className="hidden md:flex items-center gap-8 font-heading tracking-widest uppercase text-[10px]">
      {user && (
        <>
          <Link
            href="/appraise-v2"
            className="px-6 py-2 font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-none border border-primary transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
          >
            {t('nav_appraise')}
          </Link>
          <Link
            href="/my-valuations"
            className={cn(
              "transition-colors hover:text-primary",
              pathname === "/my-valuations" ? "text-primary" : "text-foreground"
            )}
          >
            {t('nav_my_valuations')}
          </Link>
          <Link
            href="/buy-tokens"
            className={cn(
              "transition-colors hover:text-primary",
              pathname === "/buy-tokens" ? "text-primary" : "text-muted-foreground"
            )}
          >
            {t('nav_buy_tokens')}
          </Link>
        </>
      )}
      <Link
        href="/resources"
        className={cn(
          "transition-colors hover:text-primary",
          pathname?.startsWith("/resources") ? "text-primary" : "text-muted-foreground"
        )}
      >
        {t('nav_resources')}
      </Link>
      <Link
        href="/#features"
        className="text-muted-foreground transition-colors hover:text-primary"
      >
        {t('nav_features')}
      </Link>
      <Link
        href="/#how-it-works"
        className="text-muted-foreground transition-colors hover:text-primary"
      >
        {t('nav_how_it_works')}
      </Link>

      <LanguageSelector />

      {user ? (
        <UserMenu user={user} userFullName={userFullName} isAdmin={isAdmin} signOut={signOut} />
      ) : (
        <Link
          href="/login"
          className="border-b-2 border-primary pb-px hover:text-primary transition-colors font-bold"
        >
          {t('nav_login')}
        </Link>
      )}
    </nav>
  )
}


function MobileNavigation({ user, userFullName, isAdmin, onClose }: NavigationProps) {
  const { t } = useLanguage()

  return (
    <nav className="flex flex-col p-6 space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-2">
        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Language</span>
        <LanguageSelector />
      </div>
      {user && (
        <>
          <Button
            asChild
            variant="default"
            className="w-full justify-center bg-yellow-400 hover:bg-yellow-500 text-black font-medium shadow-md hover:shadow-lg py-6"
            onClick={onClose}
          >
            <Link href="/appraise-v2">
              {t('nav_appraise')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-center">
            <Link href="/my-valuations" onClick={onClose}>
              {t('nav_my_valuations')}
            </Link>
          </Button>
          <Link href="/buy-tokens" className="text-lg font-medium" onClick={onClose}>
            {t('nav_buy_tokens')}
          </Link>
        </>
      )}
      <Link href="/resources" className="text-lg font-medium" onClick={onClose}>
        {t('nav_resources')}
      </Link>
      <Link href="/#features" className="text-lg font-medium" onClick={onClose}>
        {t('nav_features')}
      </Link>
      <Link href="/#how-it-works" className="text-lg font-medium" onClick={onClose}>
        {t('nav_how_it_works')}
      </Link>

      {user && (
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">{userFullName || user.email || 'User'}</p>
              {(!userFullName && user.email) && <p className="text-xs text-muted-foreground">{user.email}</p>}
              {isAdmin && <p className="text-xs text-muted-foreground">Administrator</p>}
            </div>
          </div>
          <div className="space-y-3">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start"
              onClick={onClose}
            >
              <Link href="/profile">{t('nav_profile')}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start"
              onClick={onClose}
            >
              <Link href="/referrals" className="flex items-center">
                <Award className="mr-2 h-4 w-4" /> {t('nav_refer')}
              </Link>
            </Button>
          </div>
        </div>
      )}
      {!user && (
        <Button asChild className="w-full" onClick={onClose}>
          <Link href="/login">{t('nav_login')}</Link>
        </Button>
      )}
    </nav>
  )
}

function NavbarContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userFullName, setUserFullName] = useState<string | null>(null)
  const pathname = usePathname()
  const { user, isAdmin, signOut } = useAuth()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    // Fetch user's full name when user is available
    const fetchUserDetails = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .single()

        if (!error && data) {
          if (data.first_name && data.last_name) {
            setUserFullName(`${data.first_name} ${data.last_name}`)
          } else if (data.first_name) {
            setUserFullName(data.first_name)
          }
        }
      }
    }

    fetchUserDetails()
  }, [user, supabase])

  const handleCloseMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/aa_logo_h.png"
              alt="Antiques Appraisal Logo"
              width={120}
              height={120}
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        <DesktopNavigation
          user={user}
          userFullName={userFullName}
          isAdmin={isAdmin}
          pathname={pathname}
          signOut={signOut}
        />

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {isMenuOpen && (
            <div className="fixed inset-0 top-16 z-50 bg-background border-t">
              <MobileNavigation
                user={user}
                userFullName={userFullName}
                isAdmin={isAdmin}
                onClose={handleCloseMenu}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Image
                src="/aa_logo_h.png"
                alt="Antiques Appraisal Logo"
                width={120}
                height={120}
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        </div>
      </header>
    }>
      <NavbarContent />
    </Suspense>
  )
}
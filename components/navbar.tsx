"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Menu, Award, User, LogOut, Loader2 } from "lucide-react"
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
import { LanguageSelector } from "./language-selector"
import type { Locale } from "@/i18n-config"

interface UserData {
  email: string
  id: string
}

interface NavigationProps {
  user: UserData | null
  userFullName: string | null
  isAdmin: boolean
  pathname?: string
  onClose?: () => void
  dictionary: any
  lang: string
}

interface UserMenuProps {
  user: UserData
  userFullName: string | null
  isAdmin: boolean
  signOut: () => void
  className?: string
  dictionary: any
  lang: string
}

function UserMenu({ user, userFullName, isAdmin, signOut, className, dictionary, lang }: UserMenuProps) {
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
            <p className="font-medium">{userFullName || user.email}</p>
            {!userFullName && <p className="text-xs text-muted-foreground">{user.email}</p>}
            {isAdmin && <p className="text-xs text-muted-foreground">{dictionary.admin}</p>}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/profile`}>{dictionary.profile}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/referrals`} className="flex items-center">
            <Award className="mr-2 h-4 w-4" /> {dictionary.referEarn}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600 cursor-pointer" 
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" /> {dictionary.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DesktopNavigation({ user, userFullName, isAdmin, pathname, signOut, dictionary, lang }: NavigationProps & { signOut: () => void }) {
  return (
    <nav className="hidden md:flex items-center gap-6">
      {user && (
        <>
          <Link
            href={`/${lang}/appraise`}
            className="px-6 py-2 font-medium text-black bg-yellow-400 hover:bg-yellow-500 rounded-md shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {dictionary.appraise}
          </Link>
          <Link
            href={`/${lang}/my-valuations`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "px-4"
            )}
          >
            {dictionary.myValuations}
          </Link>
          <Link
            href={`/${lang}/buy-tokens`}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === `/${lang}/buy-tokens` ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {dictionary.buyTokens}
          </Link>
        </>
      )}
      <Link
        href={`/${lang}/resources`}
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname?.startsWith(`/${lang}/resources`) ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {dictionary.resources}
      </Link>
      <Link
        href={`/${lang}/#features`}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        {dictionary.features}
      </Link>
      <Link
        href={`/${lang}/#how-it-works`}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        {dictionary.howItWorks}
      </Link>
      
      {user ? (
        <UserMenu user={user} userFullName={userFullName} isAdmin={isAdmin} signOut={signOut} dictionary={dictionary} lang={lang} />
      ) : (
        <Button asChild size="sm">
          <Link href={`/${lang}/login`}>{dictionary.login}</Link>
        </Button>
      )}
    </nav>
  )
}

function MobileNavigation({ user, userFullName, isAdmin, onClose, dictionary, lang }: NavigationProps) {
  return (
    <nav className="flex flex-col p-6 space-y-4">
      {user && (
        <>
          <Button 
            asChild 
            variant="default" 
            className="w-full justify-center bg-yellow-400 hover:bg-yellow-500 text-black font-medium shadow-md hover:shadow-lg py-6"
            onClick={onClose}
          >
            <Link href={`/${lang}/appraise`}>
              {dictionary.appraise}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-center">
            <Link href={`/${lang}/my-valuations`} onClick={onClose}>
              {dictionary.myValuations}
            </Link>
          </Button>
          <Link href={`/${lang}/buy-tokens`} className="text-lg font-medium" onClick={onClose}>
            {dictionary.buyTokens}
          </Link>
        </>
      )}
      <Link href={`/${lang}/resources`} className="text-lg font-medium" onClick={onClose}>
        {dictionary.resources}
      </Link>
      <Link href={`/${lang}/#features`} className="text-lg font-medium" onClick={onClose}>
        {dictionary.features}
      </Link>
      <Link href={`/${lang}/#how-it-works`} className="text-lg font-medium" onClick={onClose}>
        {dictionary.howItWorks}
      </Link>
      
      {user && (
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">{userFullName || user.email}</p>
              {!userFullName && <p className="text-xs text-muted-foreground">{user.email}</p>}
              {isAdmin && <p className="text-xs text-muted-foreground">{dictionary.admin}</p>}
            </div>
          </div>
          <div className="space-y-3">
            <Button 
              asChild 
              variant="outline" 
              className="w-full justify-start"
              onClick={onClose}
            >
              <Link href={`/${lang}/profile`}>{dictionary.profile}</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="w-full justify-start"
              onClick={onClose}
            >
              <Link href={`/${lang}/referrals`} className="flex items-center">
                <Award className="mr-2 h-4 w-4" /> {dictionary.referEarn}
              </Link>
            </Button>
          </div>
        </div>
      )}
      {!user && (
        <Button asChild className="w-full" onClick={onClose}>
          <Link href={`/${lang}/login`}>{dictionary.login}</Link>
        </Button>
      )}
    </nav>
  )
}

function NavbarContent({ lang, dictionary }: { lang: Locale, dictionary: any }) {
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
          <Link href={`/${lang}`} className="flex items-center space-x-2">
            <Image 
              src="/aa_logo_h.png"
              alt="Antiques Appraisal Logo"
              width={120}
              height={120}
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
             <DesktopNavigation
              user={user}
              userFullName={userFullName}
              isAdmin={isAdmin}
              pathname={pathname}
              signOut={signOut}
              dictionary={dictionary}
              lang={lang}
            />
            <div className="hidden md:block">
              <LanguageSelector currentLang={lang} />
            </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSelector currentLang={lang} />
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
                dictionary={dictionary}
                lang={lang}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default function Navbar({ lang, dictionary }: { lang: Locale, dictionary: any }) {
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
      <NavbarContent lang={lang} dictionary={dictionary} />
    </Suspense>
  )
}

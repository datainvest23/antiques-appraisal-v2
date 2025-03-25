"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Menu, Award, User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

export default function Navbar() {
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Antiques Appraisal</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {user && (
            <>
              <Button asChild variant="default" size="sm" className="px-4 py-2 font-medium">
                <Link href="/appraisal">
                  Appraise
                </Link>
              </Button>
              <Link
                href="/buy-tokens"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/buy-tokens" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Buy Tokens
              </Link>
            </>
          )}
          <Link
            href="/#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            How It Works
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userFullName || user.email}</p>
                    {!userFullName && <p className="text-xs text-muted-foreground">{user.email}</p>}
                    {isAdmin && <p className="text-xs text-muted-foreground">Administrator</p>}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-valuations">My Valuations</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/referrals" className="flex items-center">
                    <Award className="mr-2 h-4 w-4" /> Refer & Earn
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer" 
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {isMenuOpen && (
            <div className="fixed inset-0 top-16 z-50 bg-background border-t">
              <nav className="flex flex-col p-6 space-y-4">
                {user && (
                  <>
                    <Button asChild variant="default" className="w-full justify-center">
                      <Link href="/appraisal" onClick={() => setIsMenuOpen(false)}>
                        Appraise
                      </Link>
                    </Button>
                    <Link href="/buy-tokens" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                      Buy Tokens
                    </Link>
                  </>
                )}
                <Link href="/#features" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Features
                </Link>
                <Link href="/#how-it-works" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  How It Works
                </Link>
                
                {user ? (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center mb-4">
                        <User className="h-5 w-5 mr-2" />
                        <div>
                          <p className="font-medium">{userFullName || user.email}</p>
                          {!userFullName && <p className="text-xs text-muted-foreground">{user.email}</p>}
                          {isAdmin && <p className="text-xs text-muted-foreground">Administrator</p>}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Button 
                          asChild 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Link href="/profile">Profile</Link>
                        </Button>
                        <Button 
                          asChild 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Link href="/my-valuations">My Valuations</Link>
                        </Button>
                        <Button 
                          asChild 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Link href="/referrals" className="flex items-center">
                            <Award className="mr-2 h-4 w-4" /> Refer & Earn
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-start text-red-600" 
                          onClick={() => {
                            signOut();
                            setIsMenuOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" /> Log out
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <Button asChild className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <Link href="/login">Login</Link>
                  </Button>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


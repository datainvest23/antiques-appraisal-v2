"use client"

import { useEffect, useState } from "react"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, User as UserIcon, Coins } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { t } = useLanguage()
  const { user, getTokenBalance } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const { toast } = useToast()
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        const balance = await getTokenBalance()
        setTokenBalance(balance)
        
        const { data, error } = await supabase
          .from("users")
          .select("first_name, last_name")
          .eq("user_id", user.id)
          .single()
          
        if (data) {
          setFirstName(data.first_name || "")
          setLastName(data.last_name || "")
        } else if (error && error.code !== "PGRST116") {
          console.error("Error fetching user profile:", error)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProfileData()
  }, [user, getTokenBalance, supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    try {
      setIsSaving(true)
      
      // Check if user record exists first
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("user_id", user.id)
        .single()
        
      if (existingUser) {
        // Update user
        const { error } = await supabase
          .from("users")
          .update({
            first_name: firstName,
            last_name: lastName,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id)
          
        if (error) throw error
      } else {
        // Insert user
        const { error } = await supabase
          .from("users")
          .insert({
            user_id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName
          })
          
        if (error) throw error
      }
      
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      })
      
      // Force reload to update navbar
      window.location.reload()
      
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-heading uppercase tracking-widest">{t('nav_profile') || 'Profile'}</h1>
            <p className="text-muted-foreground mt-2">Manage your account details and view your token balance.</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading uppercase tracking-widest text-lg flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-primary" />
                      Account Details
                    </CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSave}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={user?.email || ""} 
                          disabled 
                          className="bg-muted/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isSaving} className="w-full font-medium">
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>

              <div className="space-y-6 flex flex-col h-full">
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle className="font-heading uppercase tracking-widest text-lg flex items-center gap-2">
                      <Coins className="h-5 w-5 text-primary" />
                      Token Balance
                    </CardTitle>
                    <CardDescription>Your available appraisal tokens</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full justify-center pb-12 pt-8">
                    <div className="flex flex-col items-center justify-center p-8 bg-primary/5 rounded-lg border border-primary/10">
                      <span className="text-5xl font-serif mb-3 text-primary">{tokenBalance}</span>
                      <span className="text-sm font-heading uppercase tracking-widest text-muted-foreground">{t('nav_buy_tokens') || 'Tokens Available'}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3 mt-auto">
                    <Button asChild variant="default" className="w-full font-heading tracking-widest uppercase py-6 rounded-none">
                      <Link href="/buy-tokens">{t('nav_buy_tokens') || 'Buy More Tokens'}</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full font-heading tracking-widest uppercase py-6 rounded-none border-primary/20 hover:bg-primary/5">
                      <Link href="/my-valuations">{t('nav_my_valuations') || 'View My Valuations'}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}

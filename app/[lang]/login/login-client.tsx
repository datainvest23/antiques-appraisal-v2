"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthError } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

interface FormFieldProps {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

function FormField({ id, label, type = "text", placeholder, value, onChange, required = false }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  )
}

interface FormErrorProps {
  error: string | null
}

function FormError({ error }: FormErrorProps) {
  if (!error) return null
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}

interface FormDividerProps {
  text?: string
}

function FormDivider({ text = "or" }: FormDividerProps) {
  return (
    <div className="relative flex items-center justify-center">
      <span className="absolute inset-x-0 h-px bg-muted"></span>
      <span className="relative bg-background px-2 text-muted-foreground text-sm">{text}</span>
    </div>
  )
}

interface SubmitButtonProps {
  isLoading: boolean
  loadingText: string
  text: string
}

function SubmitButton({ isLoading, loadingText, text }: SubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
          {loadingText}
        </>
      ) : (
        text
      )}
    </Button>
  )
}

interface AuthFormProps {
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  error: string | null
  isLoading: boolean
  isGoogleSignInLoading: boolean
  onGoogleSignIn: () => void
  dictionary: any
  lang: string
}

interface RegisterFormProps extends AuthFormProps {
  firstName: string
  setFirstName: (firstName: string) => void
  lastName: string
  setLastName: (lastName: string) => void
}

function LoginForm({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  error, 
  isLoading,
  isGoogleSignInLoading,
  onGoogleSignIn,
  onSubmit,
  dictionary,
  lang
}: AuthFormProps & { onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit}>
      <CardContent className="space-y-4 pt-4">
        <FormError error={error} />
        <FormField
          id="email"
          label={dictionary.Auth.login.emailLabel}
          type="email"
          placeholder={dictionary.Auth.login.emailPlaceholder}
          value={email}
          onChange={setEmail}
          required
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{dictionary.Auth.login.passwordLabel}</Label>
            <Link href={`/${lang}/forgot-password`} className="text-sm text-primary underline-offset-4 hover:underline">
              {dictionary.Auth.login.forgotPassword}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <SubmitButton
          isLoading={isLoading}
          loadingText={dictionary.Auth.login.loadingButton}
          text={dictionary.Auth.login.submitButton}
        />
        <FormDivider text={dictionary.Auth.login.divider} />
        <Button
          type="button"
          variant="outline"
          onClick={onGoogleSignIn}
          disabled={isLoading || isGoogleSignInLoading}
          className="w-full"
        >
          {isGoogleSignInLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {dictionary.Auth.login.googleLoading}
            </>
          ) : (
            dictionary.Auth.login.googleButton
          )}
        </Button>
      </CardFooter>
    </form>
  )
}

function RegisterForm({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  firstName,
  setFirstName,
  lastName,
  setLastName,
  error, 
  isLoading,
  isGoogleSignInLoading,
  onGoogleSignIn,
  onSubmit,
  dictionary,
  lang
}: RegisterFormProps & { onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit}>
      <CardContent className="space-y-4 pt-4">
        <FormError error={error} />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="firstName"
            label={dictionary.Auth.register.firstNameLabel}
            placeholder={dictionary.Auth.register.firstNamePlaceholder}
            value={firstName}
            onChange={setFirstName}
            required
          />
          <FormField
            id="lastName"
            label={dictionary.Auth.register.lastNameLabel}
            placeholder={dictionary.Auth.register.lastNamePlaceholder}
            value={lastName}
            onChange={setLastName}
            required
          />
        </div>
        <FormField
          id="email"
          label={dictionary.Auth.register.emailLabel}
          type="email"
          placeholder={dictionary.Auth.register.emailPlaceholder}
          value={email}
          onChange={setEmail}
          required
        />
        <FormField
          id="password"
          label={dictionary.Auth.register.passwordLabel}
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
        <div className="text-sm text-muted-foreground">
          {dictionary.Auth.register.terms}
          <br />
          <span className="font-medium text-primary">{dictionary.Auth.register.newUsersBonus}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <SubmitButton
          isLoading={isLoading}
          loadingText={dictionary.Auth.register.loadingButton}
          text={dictionary.Auth.register.submitButton}
        />
        <FormDivider text={dictionary.Auth.register.divider} />
        <Button
          type="button"
          variant="outline"
          onClick={onGoogleSignIn}
          disabled={isLoading || isGoogleSignInLoading}
          className="w-full"
        >
          {isGoogleSignInLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {dictionary.Auth.register.googleLoading}
            </>
          ) : (
            dictionary.Auth.register.googleButton
          )}
        </Button>
      </CardFooter>
    </form>
  )
}

function LoginFormContainer({ dictionary, lang }: { dictionary: any, lang: string }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isGoogleSignInLoading, setIsGoogleSignInLoading] = useState(false)
  const { signIn, signUp, isLoading, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || `/${lang}/appraise`
  const supabase = createClientComponentClient<Database>()
  
  useEffect(() => {
    if (user) {
      router.push(redirectPath)
    }
  }, [user, router, redirectPath])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await signIn(email, password)
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        setError(error.message)
      } else {
        setError(dictionary.Auth.errors.unexpected)
      }
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await signUp(email, password, firstName, lastName)
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        setError(error.message)
      } else {
        setError(dictionary.Auth.errors.createAccountFailed)
      }
    }
  }

  const handleGoogleSignIn = async () => {
    if (isGoogleSignInLoading) return
    
    setError(null)
    try {
      setIsGoogleSignInLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        setError(error.message)
      } else {
        setError(dictionary.Auth.errors.googleSignInFailed)
      }
      setIsGoogleSignInLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{dictionary.Auth.title}</CardTitle>
          <CardDescription>{dictionary.Auth.subtitle}</CardDescription>
        </CardHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{dictionary.Auth.tabs.login}</TabsTrigger>
            <TabsTrigger value="register">{dictionary.Auth.tabs.register}</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              error={error}
              isLoading={isLoading}
              isGoogleSignInLoading={isGoogleSignInLoading}
              onGoogleSignIn={handleGoogleSignIn}
              onSubmit={handleSignIn}
              dictionary={dictionary}
              lang={lang}
            />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              error={error}
              isLoading={isLoading}
              isGoogleSignInLoading={isGoogleSignInLoading}
              onGoogleSignIn={handleGoogleSignIn}
              onSubmit={handleSignUp}
              dictionary={dictionary}
              lang={lang}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

export default function LoginClient({ dictionary, lang }: { dictionary: any, lang: string }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
          <p>{dictionary.Auth.loading}</p>
        </Card>
      </div>
    }>
      <LoginFormContainer dictionary={dictionary} lang={lang} />
    </Suspense>
  )
}

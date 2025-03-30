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
  onGoogleSignIn: () => void
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
  onGoogleSignIn,
  onSubmit 
}: AuthFormProps & { onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit}>
      <CardContent className="space-y-4 pt-4">
        <FormError error={error} />
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={setEmail}
          required
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
              Forgot password?
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
          loadingText="Signing in..."
          text="Sign In"
        />
        <FormDivider />
        <Button
          type="button"
          variant="outline"
          onClick={onGoogleSignIn}
          disabled={isLoading}
          className="w-full"
        >
          Continue with Google
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
  onGoogleSignIn,
  onSubmit 
}: RegisterFormProps & { onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit}>
      <CardContent className="space-y-4 pt-4">
        <FormError error={error} />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="firstName"
            label="First Name"
            placeholder="John"
            value={firstName}
            onChange={setFirstName}
            required
          />
          <FormField
            id="lastName"
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChange={setLastName}
            required
          />
        </div>
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={setEmail}
          required
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
        <div className="text-sm text-muted-foreground">
          By registering, you agree to our Terms of Service and Privacy Policy.
          <br />
          <span className="font-medium text-primary">New users receive 5 free tokens!</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <SubmitButton
          isLoading={isLoading}
          loadingText="Creating account..."
          text="Create Account"
        />
        <FormDivider />
        <Button
          type="button"
          variant="outline"
          onClick={onGoogleSignIn}
          disabled={isLoading}
          className="w-full"
        >
          Continue with Google
        </Button>
      </CardFooter>
    </form>
  )
}

function LoginFormContainer() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { signIn, signUp, isLoading, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/appraise'
  
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
        setError("An unexpected error occurred")
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
        setError("Failed to create account")
      }
    }
  }

  const handleGoogleSignIn = async () => {
    setError("Google sign-in is not implemented yet")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Antiques Appraisal</CardTitle>
          <CardDescription>Sign in or create an account to get started</CardDescription>
        </CardHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              error={error}
              isLoading={isLoading}
              onGoogleSignIn={handleGoogleSignIn}
              onSubmit={handleSignIn}
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
              onGoogleSignIn={handleGoogleSignIn}
              onSubmit={handleSignUp}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
          <p>Loading...</p>
        </Card>
      </div>
    }>
      <LoginFormContainer />
    </Suspense>
  )
}


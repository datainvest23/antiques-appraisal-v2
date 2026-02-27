import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function VerificationSent() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verification Email Sent</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent you an email with a link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4 pt-4">
          <p>
            Please check your inbox and click on the verification link to complete your registration.
          </p>
          <p className="text-center text-muted-foreground">
            If you don&apos;t see it, please check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Return to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
} 
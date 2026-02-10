import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function VerificationSentClient({ dictionary, lang }: { dictionary: any, lang: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">{dictionary.title}</CardTitle>
          <CardDescription className="text-center">
            {dictionary.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4 pt-4">
          <p>
            {dictionary.instructions}
          </p>
          <p className="text-center text-muted-foreground">
            {dictionary.spamCheck}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Link href={`/${lang}/login`} className="w-full">
            <Button variant="outline" className="w-full">
              {dictionary.returnToLogin}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

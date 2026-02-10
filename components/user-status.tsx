import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coins, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UserStatusProps {
  freeValuationsLeft: number
  tokenBalance: number
  dictionary: any
}

export default function UserStatus({ freeValuationsLeft, tokenBalance, dictionary }: UserStatusProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col justify-between p-4 h-full">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center">
            <div className="mr-2 text-sm font-medium">{dictionary.freeValuations}</div>
            <div className="font-bold text-lg">{freeValuationsLeft}</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">Info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{dictionary.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center">
            <Coins className="mr-2 h-5 w-5 text-primary" />
            <div className="mr-2 text-sm font-medium">{dictionary.tokenBalance}</div>
            <div className="font-bold text-lg">{tokenBalance}</div>
          </div>
        </div>
        <div className="mt-4">
          <Link href="/buy-tokens">
            <Button variant="outline" size="sm">
              {dictionary.buyTokens}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

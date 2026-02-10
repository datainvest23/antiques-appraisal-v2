import BuyTokensClient from "./buy-tokens-client"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export default async function BuyTokensPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <BuyTokensClient dictionary={dictionary.BuyTokens} />
}

import ValuationDetailsClient from "./valuation-details-client"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export default async function ValuationPage({ params }: { params: Promise<{ lang: Locale, id: string }> }) {
  const { lang, id } = await params
  const dictionary = await getDictionary(lang)

  return <ValuationDetailsClient id={id} dictionary={dictionary.ValuationDetails} />
}

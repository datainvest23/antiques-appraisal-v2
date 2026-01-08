import VerificationSentClient from "./verification-sent-client"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export default async function VerificationSentPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <VerificationSentClient dictionary={dictionary.VerificationSent} lang={lang} />
}

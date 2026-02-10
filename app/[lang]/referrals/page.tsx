import ReferralsClient from "./referrals-client"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export default async function ReferralsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <ReferralsClient dictionary={dictionary} />
}

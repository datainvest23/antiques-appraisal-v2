import MyValuationsClient from "./my-valuations-client"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export default async function MyValuationsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <MyValuationsClient dictionary={dictionary.MyValuations} />
}

import ResetPasswordClient from "./reset-password-client"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export default async function ResetPasswordPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <ResetPasswordClient dictionary={dictionary.ResetPassword} lang={lang} />
}

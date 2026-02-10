import { getDictionary } from '@/lib/get-dictionary'
import { Locale } from '@/i18n-config'
import ForgotPasswordClient from './forgot-password-client'

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <ForgotPasswordClient dictionary={dictionary} lang={lang} />
}

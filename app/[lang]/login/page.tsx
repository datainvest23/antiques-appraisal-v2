import { getDictionary } from '@/lib/get-dictionary'
import { Locale } from '@/i18n-config'
import LoginClient from './login-client'

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <LoginClient dictionary={dictionary} lang={lang} />
}

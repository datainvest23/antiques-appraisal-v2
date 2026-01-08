import { getDictionary } from '@/lib/get-dictionary'
import { Locale } from '@/i18n-config'
import AppraiseClient from './appraise-client'

export default async function AppraisePage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <AppraiseClient dictionary={dictionary} />
}

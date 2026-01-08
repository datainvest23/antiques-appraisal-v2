import { getDictionary } from '@/lib/get-dictionary'
import { Locale } from '@/i18n-config'
import AppraiseV2Client from './appraise-v2-client'

export default async function AppraiseV2Page({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <AppraiseV2Client dictionary={dictionary} />
}

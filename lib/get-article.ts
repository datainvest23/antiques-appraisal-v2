import 'server-only'
import { Locale } from '@/lib/get-dictionary'

// Type definition for Article structure
export type ArticleContent = {
  title: string
  description: string
  readTime: string
  backToResources: string
  share: string
  content: Array<{
    type: 'p' | 'h2' | 'h3' | 'ul' | 'quote'
    text?: string
    items?: string[]
  }>
  tryAppraisal: string
}

// Helper to get article dictionary
export const getArticleDictionary = async (articleId: string, locale: Locale): Promise<ArticleContent> => {
  try {
    const article = await import(`@/dictionaries/articles/${articleId}/${locale}.json`)
    return article.default
  } catch (error) {
    // Fallback to English if translation missing
    const article = await import(`@/dictionaries/articles/${articleId}/en.json`)
    return article.default
  }
}

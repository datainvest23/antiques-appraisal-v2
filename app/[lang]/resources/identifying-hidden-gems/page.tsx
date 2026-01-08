import Image from "next/image"
import Link from "next/link"
import { Metadata } from "next"
import { Clock, ArrowLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getArticleDictionary } from "@/lib/get-article"
import { Locale } from "@/lib/get-dictionary"

type Props = {
  params: Promise<{ lang: Locale }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const dictionary = await getArticleDictionary('identifying-hidden-gems', lang)

  return {
    title: dictionary.title,
    description: dictionary.description,
    openGraph: {
      title: dictionary.title,
      description: dictionary.description,
      images: [
        {
          url: "/3-Identifying-Hidden-Gems.png",
          width: 1200,
          height: 630,
          alt: dictionary.title
        }
      ]
    }
  }
}

export default async function IdentifyingHiddenGemsPage({ params }: Props) {
  const { lang } = await params
  const dictionary = await getArticleDictionary('identifying-hidden-gems', lang)

  return (
    <article className="container mx-auto py-10 px-4">
      <Link
        href={`/${lang}/resources`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {dictionary.backToResources}
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {dictionary.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>{dictionary.readTime}</span>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              <Share2 className="mr-2 h-4 w-4" />
              {dictionary.share}
            </Button>
          </div>
        </div>

        <div className="relative w-full h-[400px] mb-10 rounded-lg overflow-hidden">
          <Image
            src="/3-Identifying-Hidden-Gems.png"
            alt={dictionary.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="prose prose-lg max-w-none">
          {dictionary.content.map((block, index) => {
            switch (block.type) {
              case 'h2':
                return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{block.text}</h2>
              case 'h3':
                return <h3 key={index} className="text-xl font-semibold mt-6 mb-3">{block.text}</h3>
              case 'p':
                return <p key={index} dangerouslySetInnerHTML={{ __html: block.text || '' }} />
              case 'ul':
                return (
                  <ul key={index}>
                    {block.items?.map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ul>
                )
              case 'quote':
                return (
                  <div key={index} className="bg-muted p-6 rounded-lg my-8">
                    <p className="italic">{block.text}</p>
                  </div>
                )
              default:
                return null
            }
          })}
        </div>

        <div className="mt-12 flex items-center justify-between border-t pt-8">
          <Link
            href={`/${lang}/resources`}
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {dictionary.backToResources}
          </Link>
          <Link
            href={`/${lang}/appraise`}
            className="inline-flex items-center text-sm font-medium bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
          >
            {dictionary.tryAppraisal}
          </Link>
        </div>
      </div>
    </article>
  )
}

import Link from "next/link"

export default function Footer({ dictionary }: { dictionary: any }) {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {dictionary.copyright}
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/terms" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
            {dictionary.terms}
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            {dictionary.privacy}
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            {dictionary.contact}
          </Link>
        </div>
      </div>
    </footer>
  )
}

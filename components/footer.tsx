"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {t("footer.rights")}
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/terms" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
            {t("footer.terms")}
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            {t("footer.privacy")}
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            {t("footer.contact")}
          </Link>
        </div>
      </div>
    </footer>
  )
}

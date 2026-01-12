"use client"

import { Check, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage, useLanguageOptions } from "@/contexts/language-context"

interface LanguageSelectorProps {
  align?: "start" | "end"
  className?: string
}

export default function LanguageSelector({ align = "end", className }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage()
  const options = useLanguageOptions()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          aria-label={t("language.label")}
        >
          <Globe className="mr-2 h-4 w-4" />
          {options[language].shortLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[160px]">
        {Object.entries(options).map(([value, option]) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setLanguage(value as keyof typeof options)}
            className="flex items-center justify-between"
          >
            <span>{option.label}</span>
            {language === value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

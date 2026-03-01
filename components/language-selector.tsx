"use client"

import { useLanguage } from "@/contexts/language-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const;

export function LanguageSelector() {
    const { language, setLanguage } = useLanguage();

    const currentLang = languages.find(l => l.code === language) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 rounded-full border border-slate-200/50 hover:bg-slate-50">
                    <Globe className="h-4 w-4 text-slate-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">{currentLang.code}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl p-2 shadow-xl border-slate-100">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors ${language === lang.code ? "bg-amber-50 text-amber-900" : "hover:bg-slate-50"
                            }`}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-xs font-medium">{lang.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  try {
    return format(new Date(date), "MMMM d, yyyy")
  } catch (error) {
    console.error("Error formatting date:", error)
    return ""
  }
}


/**
 * Utility for processing markdown specifically for the Antique Appraisal UI
 * ensures consistent styling between API responses and client-side rendering.
 */

// Function to process the markdown response for better display
export function processMarkdownResponse(content: string): string {
    if (!content) return '';

    // 1. Remove markdown code blocks if present
    let formattedContent = content.replace(/^```(\w+)?\n|```$/g, '');

    // 2. Process tables EARLY - capture the entire table and wrap it in a scrollable div
    formattedContent = formattedContent.replace(
        /((?:^|\n)\|.*\|(?:\r?\n\|[\s\-\|]+\|)(?:\r?\n\|.*\|)+)/gm,
        (match: string) => {
            const allLines = match.trim().split(/\r?\n/);
            if (allLines.length < 3) return match;

            const headerRow = allLines[0];
            const bodyRows = allLines.slice(2);

            const headers = headerRow.split('|')
                .filter((cell: string, i: number, arr: string[]) => (i > 0 && i < arr.length - 1) || cell.trim())
                .map((cell: string) => `<th class="bg-slate-50 text-left p-3 border border-slate-200 font-bold text-slate-700">${cell.trim()}</th>`)
                .join('');

            const rows = bodyRows.map((row: string) => {
                const cells = row.split('|')
                    .filter((cell: string, i: number, arr: string[]) => (i > 0 && i < arr.length - 1) || cell.trim())
                    .map((cell: string) => `<td class="p-3 border border-slate-200 text-slate-600">${cell.trim()}</td>`)
                    .join('');
                return `<tr class="hover:bg-slate-50/50 transition-colors">${cells}</tr>`;
            }).join('');

            return `
        <div class="my-6 overflow-hidden rounded-xl border border-slate-200 shadow-sm font-sans">
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-sm">
              <thead><tr>${headers}</tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `;
        }
    );

    // 3. Process headers
    formattedContent = formattedContent.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-serif font-bold text-primary mb-6 pt-4">$1</h1>');
    formattedContent = formattedContent.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-serif font-bold mt-8 mb-4 text-slate-800 pb-2 border-b border-slate-200">$1</h2>');
    formattedContent = formattedContent.replace(/^### (.*$)/gm, '<h3 class="text-xl font-heading font-semibold mt-6 mb-3 text-slate-700">$1</h3>');

    // 4. Process bold and italic
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>');

    // 5. Process lists (unordered)
    formattedContent = formattedContent.replace(/^\s*[\*\-]\s+(.*$)/gm, '<li class="ml-4 my-2 text-slate-600 leading-relaxed">$1</li>');

    // 6. Wrap groups of <li> into <ul>
    formattedContent = formattedContent.replace(/(<li.*<\/li>)\n(?![<\s]*li)/g, '<ul class="list-disc pl-5 my-4 space-y-1">$1</ul>');

    // 7. Process paragraphs (lines that don't start with tags)
    formattedContent = formattedContent.replace(/^(?!<[holtu]|<\/[holtu]|<div|<table|$)(.+)$/gm, '<p class="my-4 text-slate-600 leading-relaxed">$1</p>');

    // 8. Clean up extra newlines
    return formattedContent.replace(/\n\n+/g, '\n\n').trim();
}

/**
 * Extracts a specific section from markdown content
 */
export function extractSection(content: string, sectionTitle: string): string | null {
    if (!content) return null;
    // Use regex to find the section starting with ## and some title, up to the next ## header
    const regex = new RegExp(`##\\s*\\d*\\.?\\s*${sectionTitle}[\\s\\S]*?(?=##|$)`, 'i');
    const match = content.match(regex);
    if (match) {
        // Remove the header line
        return match[0].replace(/^##.*$/m, '').trim();
    }
    return null;
}

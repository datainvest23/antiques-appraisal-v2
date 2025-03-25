import ValuationDetail from "@/components/valuation-detail"
import UserStatus from "@/components/user-status"

// Mock data for preview
const mockValuations = {
  "1": {
    id: "1",
    title: "Victorian Mahogany Side Table",
    summary:
      "Mid-19th century Victorian mahogany side table (c.1840-1860) with ornate carvings and original brass hardware. Good condition with expected patina and minor surface wear.",
    full_description:
      "This appears to be a mid-19th century Victorian mahogany side table, likely crafted between 1840-1860. The piece features ornate carved details on the legs and apron, characteristic of the period. The wood has developed a rich patina over time, though there are some signs of wear and minor scratches on the surface. The hardware appears to be original brass pulls with an aged finish. Based on the style, craftsmanship, and condition, this piece would be of interest to collectors of Victorian furniture.",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_detailed: true,
    images: [
      "/placeholder.svg?height=200&width=200",
      "/placeholder.svg?height=200&width=200",
      "/placeholder.svg?height=200&width=200",
      "/placeholder.svg?height=200&width=200",
    ],
    user_comment:
      "The table actually has a maker's mark underneath that says 'Thompson & Sons, London'. Also, I believe it's rosewood, not mahogany, based on the grain pattern.",
    assistant_response:
      "This appears to be a mid-19th century Victorian mahogany side table, likely crafted between 1840-1860. The piece features ornate carved details on the legs and apron, characteristic of the period. The wood has developed a rich patina over time, though there are some signs of wear and minor scratches on the surface. The hardware appears to be original brass pulls with an aged finish. Based on the style, craftsmanship, and condition, this piece would be of interest to collectors of Victorian furniture.",
    assistant_follow_up:
      "This is a mid-19th century Victorian rosewood side table, crafted by Thompson & Sons of London between 1840-1860. The piece features ornate carved details on the legs and apron, characteristic of the period. The rosewood has developed a rich patina over time, though there are some signs of wear and minor scratches on the surface. The hardware appears to be original brass pulls with an aged finish. The presence of the maker's mark adds provenance and potentially increases the value. Thompson & Sons was a well-regarded London furniture maker known for quality craftsmanship. Based on the style, craftsmanship, maker, and condition, this piece would be of significant interest to collectors of Victorian furniture.",
  },
  "2": {
    id: "2",
    title: "Art Deco Silver Jewelry Box",
    summary:
      "1930s Art Deco silver-plated jewelry box with geometric patterns and original velvet lining. Some tarnishing but overall good condition.",
    full_description:
      "This is an Art Deco silver-plated jewelry box dating from approximately 1930-1940. It features the characteristic geometric patterns of the Art Deco period with clean lines and stylized motifs. The box retains its original dark blue velvet lining which shows minimal wear. The silver plating has some tarnishing consistent with age, particularly on the corners and edges where handling would occur most frequently. The hinges are in good working condition and the clasp closes securely. No maker's mark is visible, suggesting this may be from a smaller workshop rather than a major manufacturer.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_detailed: false,
    images: [
      "/placeholder.svg?height=200&width=200",
      "/placeholder.svg?height=200&width=200",
      "/placeholder.svg?height=200&width=200",
      "/placeholder.svg?height=200&width=200",
    ],
    user_comment:
      "I found a small mark on the bottom that looks like 'EPNS' and possibly a number '90'. Does this tell us anything about the piece?",
    assistant_response:
      "This is an Art Deco silver-plated jewelry box dating from approximately 1930-1940. It features the characteristic geometric patterns of the Art Deco period with clean lines and stylized motifs. The box retains its original dark blue velvet lining which shows minimal wear. The silver plating has some tarnishing consistent with age, particularly on the corners and edges where handling would occur most frequently. The hinges are in good working condition and the clasp closes securely. No maker's mark is visible, suggesting this may be from a smaller workshop rather than a major manufacturer.",
    assistant_follow_up:
      "This is an Art Deco silver-plated jewelry box dating from approximately 1930-1940. The marking 'EPNS' stands for 'Electroplated Nickel Silver,' confirming this is silver-plated rather than solid silver. The '90' likely indicates the silver quality grade, suggesting a good quality plate. This was a common marking system in the early 20th century. The box features the characteristic geometric patterns of the Art Deco period with clean lines and stylized motifs. The original dark blue velvet lining shows minimal wear, adding to its value as collectors prefer original interiors. The tarnishing is consistent with age and use, and actually contributes to its authenticity. The working hinges and secure clasp are important functional elements that add to its value.",
  },
  "3": {
    id: "3",
    title: "Tiffany Style Stained Glass Lamp",
    summary:
      "Early 20th century Tiffany-inspired stained glass table lamp with floral pattern. Original wiring has been replaced, minor chips to glass in two sections.",
    full_description:
      "This is a Tiffany-style stained glass table lamp dating from the early 20th century, approximately 1910-1925. The shade features a colorful floral pattern with predominantly green, amber, and red glass pieces in a traditional leaded construction. The base appears to be cast metal with a bronze-like finish and decorative relief work. The lamp has been rewired for modern electrical systems, which is a common and necessary modification for usability. There are minor chips to two glass pieces on the lower edge of the shade, but no missing pieces. While this lamp bears similarities to authentic Tiffany Studios pieces, it lacks the Tiffany signature or stamp that would be present on an original. This suggests it is likely a high-quality contemporary piece from the same era, possibly by one of the many skilled craftsmen working in a similar style.",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    is_detailed: true,
    images: [
      "/placeholder.svg?height=200&width=200",
      "/placeholder.svg?height=200&width=200",
      "/placeholder.svg?height=200&width=200",
      "/placeholder.svg?height=200&width=200",
    ],
    user_comment:
      "I found what looks like a small signature on the inside rim of the shade - it says 'Wilkinson' with some numbers after it. Does this help identify the maker?",
    assistant_response:
      "This is a Tiffany-style stained glass table lamp dating from the early 20th century, approximately 1910-1925. The shade features a colorful floral pattern with predominantly green, amber, and red glass pieces in a traditional leaded construction. The base appears to be cast metal with a bronze-like finish and decorative relief work. The lamp has been rewired for modern electrical systems, which is a common and necessary modification for usability. There are minor chips to two glass pieces on the lower edge of the shade, but no missing pieces. While this lamp bears similarities to authentic Tiffany Studios pieces, it lacks the Tiffany signature or stamp that would be present on an original. This suggests it is likely a high-quality contemporary piece from the same era, possibly by one of the many skilled craftsmen working in a similar style.",
    assistant_follow_up:
      "This is a stained glass table lamp by Wilkinson Studios, dating from the early 20th century (circa 1910-1925). Wilkinson was a notable competitor to Tiffany Studios during this period, producing high-quality leaded glass lamps in similar styles but at more accessible price points. The signature you've found is significant as it confirms the lamp's maker and authenticity. Wilkinson lamps are collectible in their own right, though they typically command lower prices than Tiffany originals. The floral pattern with green, amber, and red glass is characteristic of the Art Nouveau influence common in this period. The rewiring is appropriate and does not detract from the value, as it makes the piece safely usable. The minor chips you mentioned are consistent with age but should be professionally assessed for potential repair to preserve value. Based on the signature and quality, this lamp would be of interest to collectors of early 20th century decorative arts.",
  },
}

export default function ValuationDetailPage({ params }: { params: { id: string } }) {
  // Mock data for preview
  const freeValuationsLeft = 1
  const tokenBalance = 5

  // Get the specific valuation from our mock data
  const valuation = mockValuations[params.id as keyof typeof mockValuations]

  // If valuation doesn't exist in our mock data, use the first one
  const fallbackValuation = mockValuations["1"]

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <UserStatus freeValuationsLeft={freeValuationsLeft} tokenBalance={tokenBalance} />
        <ValuationDetail valuation={valuation || fallbackValuation} />
      </div>
    </main>
  )
}


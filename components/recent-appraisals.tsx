import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function RecentAppraisals() {
  const appraisals = [
    {
      title: "Ming Dynasty Blue & White Vase",
      category: "Ceramics",
      value: "$12,500 - $15,000",
      description: "Identified authentic Jiajing period markings. Condition noted slight rim fritting.",
      image: "🏺"
    },
    {
      title: "Rolex Submariner 5513",
      category: "Watches",
      value: "$11,000 - $13,500",
      description: "Confirmed 'Maxi Dial' MK III variant from 1978. Original faded bezel insert.",
      image: "⌚"
    },
    {
      title: "Mid-Century Eames Lounge Chair",
      category: "Furniture",
      value: "$4,500 - $6,000",
      description: "Verified 2nd generation Herman Miller production with Brazilian rosewood veneers.",
      image: "🪑"
    }
  ];

  return (
    <section className="w-full py-24 bg-slate-50" id="recent-appraisals">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 border border-amber-200/60 text-[10px] font-bold tracking-[0.25em] uppercase text-amber-800">
            RECENT RESULTS
          </div>
          <h2 className="text-4xl font-serif md:text-5xl tracking-tight">
            See What Others Are Discovering
          </h2>
          <p className="max-w-[700px] text-lg text-slate-500">
            Every day, users uncover the true value of their inherited items, flea market finds, and collection pieces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {appraisals.map((item, i) => (
            <div key={i} className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-slate-100 flex items-center justify-center text-6xl">
                {item.image}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">{item.category}</Badge>
                  <span className="font-semibold text-green-700">{item.value}</span>
                </div>
                <h3 className="text-xl font-serif font-medium text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{item.description}</p>
                <div className="mt-auto">
                  <Link href="/sample-report" className="text-amber-600 text-sm font-medium hover:text-amber-700 flex items-center">
                    View Full Report <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

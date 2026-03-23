import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQSection() {
  const faqs = [
    {
      question: "How accurate is the AI appraisal?",
      answer: "Our models are trained on millions of auction records and verified sales, providing highly accurate estimates. However, they are for reference and not a substitute for a certified insurance appraisal."
    },
    {
      question: "Are my photos kept private?",
      answer: "Yes. Your uploads are securely processed and never shared or sold to third parties."
    },
    {
      question: "What items can I appraise?",
      answer: "We support a wide range of items including furniture, art, ceramics, watches, jewelry, and rare collectibles."
    },
    {
      question: "Is there a free tier?",
      answer: "Yes, our Standard plan offers 1 free appraisal per day to help you get started."
    }
  ];

  return (
    <section className="w-full py-24 bg-white" id="faq">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <h2 className="text-3xl font-serif md:text-5xl tracking-tight">
            Common Questions
          </h2>
          <p className="max-w-[700px] text-lg text-slate-500">
            Everything you need to know about our valuation service.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b-0 border border-slate-200 px-6 rounded-lg bg-slate-50 overflow-hidden">
              <AccordionTrigger className="text-left font-serif text-lg py-4 hover:no-underline hover:text-amber-600 transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed text-base pt-2 pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

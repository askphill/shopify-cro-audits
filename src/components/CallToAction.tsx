interface CallToActionProps {
  ctaLink?: string;
}

export function CallToAction({ ctaLink }: CallToActionProps) {
  const bookingUrl = ctaLink || "https://www.askphill.com/contact";

  return (
    <section className="bg-black text-white px-6 py-16 md:px-12">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tighter mb-4">
          Ready to unlock these opportunities?
        </h2>
        <p className="text-white/70 mb-8 max-w-lg mx-auto">
          Let's discuss how Shopify Plus can help you convert more visitors
          into customers with the optimizations outlined in this audit.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-ap-red px-8 py-3 font-semibold text-white hover:bg-ap-redDark transition-colors tracking-tight"
          >
            Book a call with Ask Phill
          </a>
          <a
            href="https://www.shopify.com/plus"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-white/30 px-8 py-3 font-semibold text-white hover:bg-white/10 transition-colors tracking-tight"
          >
            Learn more about Shopify Plus
          </a>
        </div>
      </div>
    </section>
  );
}

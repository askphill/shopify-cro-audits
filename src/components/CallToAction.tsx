interface CallToActionProps {
  ctaLink?: string;
}

export function CallToAction({ ctaLink }: CallToActionProps) {
  const bookingUrl = ctaLink || "https://www.askphill.com/contact";

  return (
    <section
      data-component="CallToAction"
      className="rounded-2xl md:rounded-3xl bg-black text-white p-4 md:p-6"
    >
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold tracking-tighter mb-4">
          Ready to unlock these opportunities?
        </h2>
        <p className="text-white/50 font-medium tracking-tighter mb-8 max-w-lg mx-auto">
          Let's talk about how to turn these findings into real conversion
          gains for your store.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-ap-red px-8 py-3 font-bold text-white hover:bg-ap-redDark transition-colors tracking-tighter"
          >
            Book a call with Ask Phill
          </a>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-8">
        <img
          src="/shopify-platinum-partner.svg"
          alt="Shopify Platinum Partner"
          className="h-16 w-auto shrink-0"
        />
        <div className="text-white/60 text-sm tracking-tighter text-center md:text-right space-y-1">
          <p className="font-bold text-white">Ask Phill</p>
          <p>'s-Gravenhekje 1a, 1011 TG Amsterdam, Netherlands</p>
          <p>
            <a
              href="tel:+31202615080"
              className="hover:text-white transition-colors"
            >
              +31 20 261 5080
            </a>
            {" · "}
            <a
              href="mailto:sales@askphill.com"
              className="hover:text-white transition-colors"
            >
              sales@askphill.com
            </a>
            {" · "}
            <a
              href="https://www.askphill.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              askphill.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

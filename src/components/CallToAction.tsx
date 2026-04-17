interface CallToActionProps {
  ctaLink?: string;
}

export function CallToAction({ ctaLink }: CallToActionProps) {
  const bookingUrl = ctaLink || "https://www.askphill.com/contact";

  return (
    <section data-component="CallToAction" className="rounded-2xl md:rounded-3xl bg-black text-white p-4 md:p-6">
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
    </section>
  );
}

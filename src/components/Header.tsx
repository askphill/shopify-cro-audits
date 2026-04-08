import { Logo } from "./Logo";

interface HeaderProps {
  clientName: string;
  websiteUrl: string;
  auditDate: string;
}

export function Header({ clientName, websiteUrl, auditDate }: HeaderProps) {
  const formattedDate = new Date(auditDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="px-6 pt-8 pb-4 md:px-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-center mb-6">
          <Logo className="h-10" />
        </div>
        <div className="rounded-2xl bg-white p-6 md:p-8 shadow-ap-popup">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tighter">
              CRO Audit: {clientName}
            </h1>
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ap-blue hover:underline text-sm font-medium tracking-tighter"
            >
              {websiteUrl}
            </a>
            <p className="ap-description-text text-sm mt-1">
              {formattedDate} &middot; Prepared by Ask Phill
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

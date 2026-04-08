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
    <header className="border-b border-gray-200 bg-white px-6 py-8 md:px-12">
      <div className="mx-auto max-w-4xl">
        <Logo className="h-12 mb-6" />
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tighter">
            CRO Audit: {clientName}
          </h1>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ap-blue hover:underline text-sm"
          >
            {websiteUrl}
          </a>
          <p className="text-sm text-ap-greyDark mt-1">
            {formattedDate} &middot; Prepared by Ask Phill
          </p>
        </div>
      </div>
    </header>
  );
}

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
    <header className="mb-6">
      <h1 className="text-4xl font-bold tracking-tighter">
        CRO Audit: {clientName}
      </h1>
      <p className="ap-description-text mt-2">
        {formattedDate} &middot; Prepared by Ask Phill
      </p>
      <a
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-ap-blue hover:underline text-sm font-medium tracking-tighter mt-1 inline-block"
      >
        {websiteUrl}
      </a>
    </header>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { CroAudit } from "../types/audit";
import { fetchAudit } from "../lib/api";
import { Header } from "../components/Header";
import { ExecutiveSummary } from "../components/ExecutiveSummary";
import { FindingsList } from "../components/FindingsList";
import { ImpactTable } from "../components/ImpactTable";
import { CallToAction } from "../components/CallToAction";
import { NotFound } from "../components/NotFound";

export function AuditPage() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<CroAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    fetchAudit(id).then((data) => {
      if (data) {
        setAudit(data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ap-greyLight">
        <div className="ap-description-text text-sm">Loading audit...</div>
      </div>
    );
  }

  if (notFound || !audit) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-ap-greyLight">
      <Header
        clientName={audit.client_name}
        websiteUrl={audit.website_url}
        auditDate={audit.audit_date}
      />
      <ExecutiveSummary
        summary={audit.executive_summary}
        lighthouseScores={audit.lighthouse_scores}
        findings={audit.findings}
      />
      <FindingsList findings={audit.findings} />
      <ImpactTable findings={audit.findings} />
      <CallToAction ctaLink={audit.cta_link} />
    </div>
  );
}

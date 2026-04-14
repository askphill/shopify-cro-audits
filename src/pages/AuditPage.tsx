import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import type { CroAudit } from "../types/audit";
import { fetchAudit } from "../lib/api";
import { Logo } from "../components/Logo";
import { Header } from "../components/Header";
import { ExecutiveSummary } from "../components/ExecutiveSummary";
import { FindingsList } from "../components/FindingsList";
import { LighthouseAccordion } from "../components/LighthouseAccordion";
import { CallToAction } from "../components/CallToAction";
import { NotFound } from "../components/NotFound";
import { ExpandCollapseControl } from "../components/ExpandCollapseControl";

export function AuditPage() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<CroAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState<Set<number>>(
    new Set()
  );
  const [lighthouseExpanded, setLighthouseExpanded] = useState(false);

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

  const anyExpanded = expandedFindings.size > 0 || lighthouseExpanded;

  const toggleAllExpanded = useCallback(() => {
    if (anyExpanded) {
      setExpandedFindings(new Set());
      setLighthouseExpanded(false);
    } else if (audit) {
      setExpandedFindings(new Set(audit.findings.map((_, i) => i)));
      setLighthouseExpanded(true);
    }
  }, [anyExpanded, audit]);

  const toggleFinding = useCallback((index: number) => {
    setExpandedFindings((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="py-8 bg-ap-brown w-screen min-h-screen flex items-center justify-center">
        <div className="ap-description-text text-sm">Loading audit...</div>
      </div>
    );
  }

  if (notFound || !audit) {
    return <NotFound />;
  }

  return (
    <div className="py-8 bg-ap-brown w-screen min-h-screen overflow-x-hidden">
      <div className="md:container md:max-w-4xl md:mx-auto px-4">
        <Logo brandLogo className="w-[8.5rem] mx-auto mb-6 md:mb-8" />
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 mb-6 relative">
          <div className="hidden md:block absolute left-6 top-0 bg-ap-brownLight pt-2 pb-1.5 pr-3 pl-1.5 -translate-y-full rounded-t-xl">
            <ExpandCollapseControl
              anyExpanded={anyExpanded}
              onToggle={toggleAllExpanded}
            />
          </div>
          <Header
            clientName={audit.client_name}
            websiteUrl={audit.website_url}
            auditDate={audit.audit_date}
          />
          <ExecutiveSummary
            summary={audit.executive_summary}
            findings={audit.findings}
          />
          <FindingsList
            findings={audit.findings}
            expandedIndices={expandedFindings}
            onToggle={toggleFinding}
          />
          <div className="mt-6 space-y-2">
            <LighthouseAccordion
              lighthouseScores={audit.lighthouse_scores}
              coreWebVitals={audit.core_web_vitals}
              expanded={lighthouseExpanded}
              onToggle={() => setLighthouseExpanded(!lighthouseExpanded)}
            />
          </div>
        </div>
        <CallToAction ctaLink={audit.cta_link} />
      </div>
    </div>
  );
}

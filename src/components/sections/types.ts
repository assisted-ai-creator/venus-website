import type { SiteContent, SiteSection } from "@/lib/site";

export interface SectionProps {
  data: Record<string, unknown>;
  site: SiteContent;
  section: SiteSection;
}

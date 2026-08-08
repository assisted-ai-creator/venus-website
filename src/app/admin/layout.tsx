import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin — Venus World Schools",
  // The panel is behind a password and an optional IP gate; it should also
  // never appear in a search index.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The panel sits outside the (site) group, so it never renders the school's
 * header or footer — but it inherits the same fonts and stylesheet, and
 * admin.css continues the chart into the editing surface.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>;
}

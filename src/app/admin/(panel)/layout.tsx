import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Everything except the sign-in screen is wrapped in the panel shell, which
 * checks the session, provides the navigation, and hosts the toast region the
 * screens announce saves through.
 */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

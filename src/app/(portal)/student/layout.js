import { PortalShell } from "@/components/layout/Shell";

export default function StudentPortalLayout({ children }) {
  return <PortalShell role="student">{children}</PortalShell>;
}

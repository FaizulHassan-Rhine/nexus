import { PortalShell } from "@/components/layout/Shell";

export default function OrganizationPortalLayout({ children }) {
  return <PortalShell role="organization">{children}</PortalShell>;
}

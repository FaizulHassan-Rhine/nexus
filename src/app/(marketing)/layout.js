import { PublicFooter, PublicHeader } from "@/components/layout/Shell";

export default function MarketingLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

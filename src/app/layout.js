import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Nexus — National Digital Matchmaking Hub",
    template: "%s | Nexus",
  },
  description:
    "Prototype of Bangladesh's national opportunity-matching ecosystem connecting students, faculty, universities, organizations, and UGC.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/brand/nexus-mark.svg",
    apple: "/brand/nexus-mark.svg",
  },
  openGraph: {
    title: "Nexus — National Digital Matchmaking Hub",
    description: "Frontend-only prototype. All data is simulated.",
    type: "website",
    images: [{ url: "/brand/nexus-logo.svg", width: 220, height: 40, alt: "Nexus Matchmaking Hub" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

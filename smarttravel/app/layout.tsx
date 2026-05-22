import "./globals.css";
import type { Metadata, Viewport } from "next";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export const metadata: Metadata = {
  title: "SmartTravel AI — Seu radar de milhas",
  description: "Monitore oportunidades em pontos, detecte quedas raras e receba alertas automáticos.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "SmartTravel" },
};

export const viewport: Viewport = {
  themeColor: "#0B1020",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="max-w-md mx-auto min-h-screen px-[18px] pb-28">
          {children}
        </div>
        <MobileBottomNav />
      </body>
    </html>
  );
}

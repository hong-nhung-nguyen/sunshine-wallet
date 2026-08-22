import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/shared/header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Sunshine Wallet", template: "%s | Sunshine Wallet" },
  description: "Verified local energy flexibility, shared fairly.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-AU">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}

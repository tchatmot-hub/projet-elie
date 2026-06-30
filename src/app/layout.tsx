import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portail des cours — Plateforme multi-écoles",
  description:
    "Plateforme de partage de documents académiques multi-écoles, multi-classes et multi-délégués.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

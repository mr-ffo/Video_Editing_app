import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SyntaxOps • Motion Graphics Studio",
  description: "Cloud Engineering & Technical Video Overlay Studio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b0f19] text-white min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

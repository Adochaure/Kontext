import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kontext",
  description:
    "Transform AI conversations into structured, reusable context that can be carried across different AI tools.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import "./globals.css";
import { DocsRootLayout, createMetadata } from "@nuucognition/docs-theme";
import { siteConfig } from "@/site.config";
import { AgentationDev } from "./agentation-dev";

export const metadata = createMetadata(siteConfig);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DocsRootLayout config={siteConfig}>
      {children}
      <AgentationDev />
    </DocsRootLayout>
  );
}

import { source } from "@/lib/source";
import { DocsPageContent } from "@nuucognition/docs-theme";
import { notFound } from "next/navigation";
import { siteConfig } from "@/site.config";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return <DocsPageContent page={page} params={params} />;
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  // The landing page is named after the site. Do not render "NUU Guide | NUU Guide".
  const title =
    page.data.title === siteConfig.name
      ? { absolute: page.data.title }
      : page.data.title;

  return {
    title,
    description: page.data.description,
  };
}

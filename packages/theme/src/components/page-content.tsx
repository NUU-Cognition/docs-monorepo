import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import defaultMdxComponents from "fumadocs-ui/mdx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DocsPageContent({
  page,
  params,
}: {
  page: any;
  params: { slug?: string[] };
}) {
  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: "clerk",
        single: false,
      }}
      breadcrumb={{
        enabled: (params.slug?.length ?? 0) > 1,
        includePage: false,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-8 text-base leading-relaxed">
        {page.data.description}
      </DocsDescription>
      <DocsBody className="prose-lg">
        <MDX components={defaultMdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

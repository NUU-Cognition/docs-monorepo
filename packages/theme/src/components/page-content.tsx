import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { mdxComponents } from "./mdx-components";

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
      <DocsDescription className="mb-6">
        {page.data.description}
      </DocsDescription>
      <DocsBody>
        <MDX components={mdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

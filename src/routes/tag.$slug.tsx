import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Grid } from "@/components/site";
import { tagNames } from "@/lib/catalog";
import { listWorks } from "@/lib/catalog.functions";

export const Route = createFileRoute("/tag/$slug")({
  loader: async ({ params }) => {
    const name = tagNames[params.slug];
    if (!name) throw notFound();
    const items = await listWorks({ data: { tag: params.slug, sort: "views" } });
    return { name, items };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Tag não encontrada" }, { name: "robots", content: "noindex" }] };
    const title = `Tag: ${loaderData.name} — Anime e Mangá Online | AnimeBR`;
    const desc = `Confira todas as obras com a tag ${loaderData.name} no AnimeBR. Atualizações frequentes.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: loaderData.items.length > 0 ? "index, follow" : "noindex, follow" },
      ],
      links: [{ rel: "canonical", href: `/tag/${params.slug}` }],
    };
  },
  errorComponent: ({ error }) => <p className="p-10">Erro: {error.message}</p>,
  component: TagPage,
});

function TagPage() {
  const { slug } = Route.useParams();
  const { name, items } = Route.useLoaderData();
  const related = [...new Set(items.flatMap((w) => w.tags))].filter((t) => t !== slug && tagNames[t]);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-bold uppercase text-primary">Tag</p>
      <h1 className="mb-8 font-display text-5xl">{name}</h1>
      <Grid items={items} />
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-3 font-display text-xl">Tags relacionadas</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((t) => <Link key={t} to="/tag/$slug" params={{ slug: t }} className="tag-chip">{tagNames[t]}</Link>)}
          </div>
        </section>
      )}
    </main>
  );
}

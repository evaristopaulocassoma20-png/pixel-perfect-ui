import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Grid } from "@/components/site";
import { tagNames, worksByTag, relatedTags } from "@/lib/catalog";

export const Route = createFileRoute("/tag/$slug")({
  loader: ({ params }) => {
    const name = tagNames[params.slug];
    if (!name) throw notFound();
    return { name, count: worksByTag(params.slug).length };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Tag não encontrada" }, { name: "robots", content: "noindex" }] };
    const title = `Tag: ${loaderData.name} — Anime e Mangá Online | AnimeBR`;
    const desc = `Confira todas as obras com a tag ${loaderData.name} no AnimeBR. Atualizações frequentes e leitura rápida.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: loaderData.count > 0 ? "index, follow" : "noindex, follow" },
      ],
      links: [{ rel: "canonical", href: `/tag/${params.slug}` }],
    };
  },
  component: TagPage,
});

function TagPage() {
  const { slug } = Route.useParams();
  const { name } = Route.useLoaderData();
  const items = worksByTag(slug);
  const related = relatedTags(slug);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-bold uppercase text-primary">Tag</p>
      <h1 className="mb-8 font-display text-5xl">{name}</h1>
      {items.length ? <Grid items={items} /> : <p className="text-muted-foreground">Ainda não há obras com esta tag.</p>}
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

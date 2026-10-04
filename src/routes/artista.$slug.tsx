import { createFileRoute, notFound } from "@tanstack/react-router";
import { Grid } from "@/components/site";
import { listWorks } from "@/lib/catalog.functions";

export const Route = createFileRoute("/artista/$slug")({
  loader: async ({ params }) => {
    const items = await listWorks({ data: { artist: params.slug } });
    if (!items.length) throw notFound();
    return { name: items[0]!.artist_name, items };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Artista não encontrado" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.name} — Obras do artista | AnimeBR`;
    const desc = `Todas as obras de ${loaderData.name} no AnimeBR.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/artista/${params.slug}` }],
    };
  },
  errorComponent: ({ error }) => <p className="p-10">Erro: {error.message}</p>,
  component: ArtistPage,
});

function ArtistPage() {
  const { name, items } = Route.useLoaderData();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-bold uppercase text-primary">Artista</p>
      <h1 className="mb-8 font-display text-5xl">{name}</h1>
      <Grid items={items} />
    </main>
  );
}

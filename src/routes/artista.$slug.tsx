import { createFileRoute, notFound } from "@tanstack/react-router";
import { Grid } from "@/components/site";
import { artists, worksByArtist } from "@/lib/catalog";

export const Route = createFileRoute("/artista/$slug")({
  loader: ({ params }) => {
    const name = artists[params.slug];
    if (!name) throw notFound();
    return { name };
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
  component: ArtistPage,
});

function ArtistPage() {
  const { slug } = Route.useParams();
  const { name } = Route.useLoaderData();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-bold uppercase text-primary">Artista</p>
      <h1 className="mb-8 font-display text-5xl">{name}</h1>
      <Grid items={worksByArtist(slug)} />
    </main>
  );
}

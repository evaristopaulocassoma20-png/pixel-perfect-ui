import { createFileRoute, Link } from "@tanstack/react-router";
import { Grid, LetterBar } from "@/components/site";
import { listWorks, latestEpisodes } from "@/lib/catalog.functions";
import { coverSrc } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [recent, top, eps] = await Promise.all([
      listWorks({ data: { sort: "recent", limit: 8 } }),
      listWorks({ data: { sort: "views", limit: 8 } }),
      latestEpisodes(),
    ]);
    return { recent, top, eps };
  },
  head: () => ({
    meta: [
      { title: "AnimeBR — Catálogo de Anime e Mangá Online" },
      { name: "description", content: "Mais assistidos, últimos adicionados e novos episódios de anime e mangá. Pesquise por título, tag ou artista." },
      { property: "og:title", content: "AnimeBR — Catálogo de Anime e Mangá" },
      { property: "og:description", content: "Mais assistidos, últimos adicionados e novos episódios." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  errorComponent: ({ error }) => <p className="p-10">Erro: {error.message}</p>,
  component: Index,
});

function Index() {
  const { recent, top, eps } = Route.useLoaderData();
  const hero = top[0];
  return (
    <main className="mx-auto max-w-6xl px-4">
      {hero && (
        <section className="relative my-10 grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
          <div className="halftone pointer-events-none absolute -left-10 -top-6 h-40 w-40 opacity-30" />
          <div className="relative">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">O mais assistido</p>
            <h1 className="font-display text-5xl leading-none md:text-7xl">{hero.title}</h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">{hero.synopsis}</p>
            <Link to="/g/$slug" params={{ slug: hero.slug }} className="mt-7 inline-block bg-primary px-6 py-3 font-bold uppercase text-primary-foreground transition hover:translate-x-1">
              Assistir agora →
            </Link>
          </div>
          <img src={coverSrc(hero.cover)} alt={hero.title} width={768} height={1088} className="panel aspect-[4/5] w-full object-cover" />
        </section>
      )}

      <div className="mb-12"><LetterBar /></div>

      <section className="mb-14">
        <h2 className="mb-6 font-display text-3xl">Novos episódios</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {eps.map((e) =>
            e.works ? (
              <Link key={e.id} to="/g/$slug" params={{ slug: e.works.slug }} className="flex gap-3 border border-border bg-card p-2 transition hover:border-primary">
                <img src={coverSrc(e.works.cover)} alt="" width={48} height={64} loading="lazy" className="h-16 w-12 object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-bold">{e.works.title}</p>
                  <p className="text-sm text-primary">Episódio {e.number}</p>
                </div>
              </Link>
            ) : null,
          )}
        </div>
      </section>

      <section className="mb-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl">Mais assistidos</h2>
          <Link to="/lista" search={{ letra: "", ordem: "views" }} className="text-sm font-bold text-primary">Ver todos →</Link>
        </div>
        <Grid items={top} />
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl">Últimos adicionados</h2>
          <Link to="/lista" search={{ letra: "", ordem: "recent" }} className="text-sm font-bold text-primary">Ver todos →</Link>
        </div>
        <Grid items={recent} />
      </section>
    </main>
  );
}

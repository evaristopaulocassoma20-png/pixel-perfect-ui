import { createFileRoute, Link } from "@tanstack/react-router";
import { Grid } from "@/components/site";
import { works, tagNames } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AnimeBR — Catálogo de Anime e Mangá Online" },
      { name: "description", content: "Descubra animes e mangás por tag e artista. Leitura rápida, atualizações frequentes, para todos os públicos." },
      { property: "og:title", content: "AnimeBR — Catálogo de Anime e Mangá" },
      { property: "og:description", content: "Descubra animes e mangás por tag e artista, com leitor rápido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const hero = works[0]!;
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="relative my-10 grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
        <div className="halftone pointer-events-none absolute -left-10 -top-6 h-40 w-40 opacity-30" />
        <div className="relative">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">Destaque da semana</p>
          <h1 className="font-display text-5xl leading-none md:text-7xl">{hero.title}</h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">{hero.synopsis}</p>
          <Link to="/g/$slug" params={{ slug: hero.slug }} className="mt-7 inline-block bg-primary px-6 py-3 font-bold uppercase text-primary-foreground transition hover:translate-x-1">
            Ler agora →
          </Link>
        </div>
        <img src={hero.cover} alt={hero.title} width={768} height={1088} className="panel aspect-[4/5] w-full object-cover" />
      </section>

      <div className="mb-10 flex flex-wrap gap-2">
        {Object.entries(tagNames).map(([slug, name]) => (
          <Link key={slug} to="/tag/$slug" params={{ slug }} className="tag-chip">{name}</Link>
        ))}
      </div>

      <h2 className="mb-6 font-display text-3xl">Últimas obras</h2>
      <Grid items={works} />
    </main>
  );
}

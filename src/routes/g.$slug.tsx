import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { artists, getWork, tagNames } from "@/lib/catalog";

export const Route = createFileRoute("/g/$slug")({
  loader: ({ params }) => {
    const work = getWork(params.slug);
    if (!work) throw notFound();
    return { slug: work.slug, title: work.title, synopsis: work.synopsis };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Obra não encontrada" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.title} — Ler Online | AnimeBR`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.synopsis },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.synopsis },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/g/${params.slug}` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "CreativeWork", name: loaderData.title, description: loaderData.synopsis }) }],
    };
  },
  component: WorkPage,
});

function WorkPage() {
  const { slug } = Route.useParams();
  const work = getWork(slug)!;
  const [reading, setReading] = useState(false);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-[320px_1fr]">
        <img src={work.cover} alt={work.title} width={768} height={1088} className="panel aspect-[3/4] w-full object-cover" />
        <div>
          <p className="text-sm font-bold uppercase text-primary">{work.type} · {work.year} · {work.chapters} capítulos</p>
          <h1 className="mt-2 font-display text-5xl leading-none">{work.title}</h1>
          <p className="mt-3">por <Link to="/artista/$slug" params={{ slug: work.artist }} className="font-bold underline decoration-primary underline-offset-4">{artists[work.artist]}</Link></p>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{work.synopsis}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {work.tags.map((t) => <Link key={t} to="/tag/$slug" params={{ slug: t }} className="tag-chip">{tagNames[t]}</Link>)}
          </div>
          <button onClick={() => setReading((r) => !r)} className="mt-8 bg-primary px-6 py-3 font-bold uppercase text-primary-foreground transition hover:translate-x-1">
            {reading ? "Fechar leitor" : "Ler capítulo 1"}
          </button>
        </div>
      </div>
      {reading && (
        <section className="mx-auto mt-14 max-w-2xl space-y-3">
          {[1, 2, 3].map((p) => (
            <figure key={p} className="border-2 border-border">
              <img src={work.cover} alt={`${work.title} — página ${p}`} width={768} height={1088} loading="lazy" className="w-full" />
              <figcaption className="py-2 text-center text-xs text-muted-foreground">Página {p}</figcaption>
            </figure>
          ))}
        </section>
      )}
    </main>
  );
}

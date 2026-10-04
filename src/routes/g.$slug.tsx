import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { coverSrc, tagNames } from "@/lib/catalog";
import { getWork } from "@/lib/catalog.functions";
import { supabase } from "@/integrations/supabase/client";
import { Comments } from "@/components/comments";

export const Route = createFileRoute("/g/$slug")({
  loader: async ({ params }) => {
    const res = await getWork({ data: { slug: params.slug } });
    if (!res) throw notFound();
    return res;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Obra não encontrada" }, { name: "robots", content: "noindex" }] };
    const { work } = loaderData;
    const title = `${work.title} — Assistir e Ler Online | AnimeBR`;
    return {
      meta: [
        { title },
        { name: "description", content: work.synopsis },
        { property: "og:title", content: title },
        { property: "og:description", content: work.synopsis },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/g/${params.slug}` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "CreativeWork", name: work.title, description: work.synopsis, author: work.artist_name }) }],
    };
  },
  errorComponent: ({ error }) => <p className="p-10">Erro: {error.message}</p>,
  component: WorkPage,
});

function WorkPage() {
  const { work, episodes } = Route.useLoaderData();
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    supabase.rpc("increment_views", { _slug: work.slug });
  }, [work.slug]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-[320px_1fr]">
        <img src={coverSrc(work.cover)} alt={work.title} width={768} height={1088} className="panel aspect-[3/4] w-full object-cover" />
        <div>
          <p className="text-sm font-bold uppercase text-primary">{work.type} · {work.year} · {work.views.toLocaleString("pt")} visualizações</p>
          <h1 className="mt-2 font-display text-5xl leading-none">{work.title}</h1>
          <p className="mt-3">por <Link to="/artista/$slug" params={{ slug: work.artist_slug }} className="font-bold underline decoration-primary underline-offset-4">{work.artist_name}</Link></p>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{work.synopsis}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {work.tags.map((t) => <Link key={t} to="/tag/$slug" params={{ slug: t }} className="tag-chip">{tagNames[t] ?? t}</Link>)}
          </div>
          <h2 className="mb-3 mt-10 font-display text-2xl">Episódios</h2>
          <div className="flex flex-wrap gap-2">
            {episodes.map((e) => (
              <button key={e.id} onClick={() => setOpen(open === e.number ? null : e.number)} className={`letter px-4 ${open === e.number ? "letter-active" : ""}`}>
                {e.number}
              </button>
            ))}
            {!episodes.length && <p className="text-muted-foreground">Ainda sem episódios.</p>}
          </div>
        </div>
      </div>
      {open !== null && (
        <section className="mx-auto mt-12 max-w-3xl">
          <p className="mb-2 font-bold">Episódio {open}</p>
          <div className="relative overflow-hidden border-2 border-border">
            <img src={coverSrc(work.cover)} alt={`${work.title} — episódio ${open}`} width={768} height={1088} className="aspect-video w-full object-cover opacity-60" />
            <span className="absolute inset-0 flex items-center justify-center font-display text-2xl">Vídeo em breve</span>
          </div>
        </section>
      )}
      <Comments workId={work.id} />
    </main>
  );
}

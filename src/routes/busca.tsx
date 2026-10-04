import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Grid, SearchBox } from "@/components/site";
import { listWorks } from "@/lib/catalog.functions";

export const Route = createFileRoute("/busca")({
  validateSearch: zodValidator(z.object({ q: fallback(z.string(), "").default("") })),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ deps }) => (deps.q.trim() ? listWorks({ data: { q: deps.q.trim(), sort: "views" } }) : Promise.resolve([])),
  head: () => ({
    meta: [
      { title: "Pesquisar | AnimeBR" },
      { name: "description", content: "Pesquise animes e mangás por título, artista ou história." },
      { property: "og:title", content: "Pesquisar | AnimeBR" },
      { property: "og:description", content: "Pesquise animes e mangás no AnimeBR." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  errorComponent: ({ error }) => <p className="p-10">Erro: {error.message}</p>,
  component: SearchPage,
});

function SearchPage() {
  const items = Route.useLoaderData();
  const { q } = Route.useSearch();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 font-display text-5xl">Pesquisar</h1>
      <div className="mb-8 max-w-xl"><SearchBox key={q} initial={q} /></div>
      {q && <p className="mb-6 text-muted-foreground">{items.length} resultado(s) para “{q}”</p>}
      {q && <Grid items={items} />}
    </main>
  );
}

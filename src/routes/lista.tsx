import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Grid, LetterBar } from "@/components/site";
import { listWorks } from "@/lib/catalog.functions";

const schema = z.object({
  letra: fallback(z.string(), "").default(""),
  ordem: fallback(z.string(), "title").default("title"),
});

export const Route = createFileRoute("/lista")({
  validateSearch: zodValidator(schema),
  loaderDeps: ({ search }) => ({ letra: search.letra, ordem: search.ordem }),
  loader: ({ deps }) => {
    const sort = deps.ordem === "views" ? "views" : deps.ordem === "recent" ? "recent" : "title";
    return listWorks({ data: { sort, letter: deps.letra || undefined, limit: 200 } });
  },
  head: () => ({
    meta: [
      { title: "Lista de Animes e Mangás de A a Z | AnimeBR" },
      { name: "description", content: "Todos os animes e mangás do AnimeBR em ordem alfabética, por mais assistidos ou mais recentes." },
      { property: "og:title", content: "Lista A-Z | AnimeBR" },
      { property: "og:description", content: "Todos os títulos do AnimeBR de A a Z." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/lista" }],
  }),
  errorComponent: ({ error }) => <p className="p-10">Erro: {error.message}</p>,
  component: ListPage,
});

const SORTS = [
  { k: "title", l: "A-Z" },
  { k: "views", l: "Mais assistidos" },
  { k: "recent", l: "Últimos adicionados" },
];

function ListPage() {
  const items = Route.useLoaderData();
  const { letra, ordem } = Route.useSearch();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 font-display text-5xl">{letra ? `Letra ${letra}` : "Todos os títulos"}</h1>
      <div className="mb-4"><LetterBar active={letra || undefined} /></div>
      <div className="mb-8 flex gap-2">
        {SORTS.map((s) => (
          <Link key={s.k} to="/lista" search={{ letra, ordem: s.k }} className={`letter px-3 ${ordem === s.k ? "letter-active" : ""}`}>{s.l}</Link>
        ))}
      </div>
      <Grid items={items} />
    </main>
  );
}

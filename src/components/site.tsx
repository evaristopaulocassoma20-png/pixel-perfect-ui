import { Link } from "@tanstack/react-router";
import { artists, tagNames, type Work } from "@/lib/catalog";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-2xl tracking-tight">
          Anime<span className="text-primary">BR</span>
        </Link>
        <nav className="flex gap-5 text-sm font-bold uppercase">
          <Link to="/" className="hover:text-primary">Catálogo</Link>
          <Link to="/tag/$slug" params={{ slug: "acao" }} className="hover:text-primary">Ação</Link>
          <Link to="/tag/$slug" params={{ slug: "fantasia" }} className="hover:text-primary">Fantasia</Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="mb-3 text-xs font-bold uppercase text-muted-foreground">Todas as tags</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(tagNames).map(([slug, name]) => (
            <Link key={slug} to="/tag/$slug" params={{ slug }} className="tag-chip">{name}</Link>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">© 2026 AnimeBR — catálogo de anime e mangá para todos os públicos.</p>
      </div>
    </footer>
  );
}

export function WorkCard({ work, eager }: { work: Work; eager?: boolean }) {
  return (
    <article className="group">
      <Link to="/g/$slug" params={{ slug: work.slug }} className="block overflow-hidden border-2 border-border transition group-hover:border-primary">
        <img src={work.cover} alt={work.title} width={768} height={1088} loading={eager ? "eager" : "lazy"} className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105" />
      </Link>
      <div className="mt-3">
        <span className="text-xs font-bold uppercase text-primary">{work.type} · {work.year}</span>
        <h3 className="font-display text-lg leading-tight">
          <Link to="/g/$slug" params={{ slug: work.slug }}>{work.title}</Link>
        </h3>
        <Link to="/artista/$slug" params={{ slug: work.artist }} className="text-sm text-muted-foreground hover:text-foreground">
          {artists[work.artist]}
        </Link>
      </div>
    </article>
  );
}

export function Grid({ items }: { items: Work[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {items.map((w, i) => <WorkCard key={w.slug} work={w} eager={i < 2} />)}
    </div>
  );
}

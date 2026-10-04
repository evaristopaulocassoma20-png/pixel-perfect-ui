import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { coverSrc, LETTERS, tagNames, type Work } from "@/lib/catalog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function SearchBox({ initial = "" }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const navigate = useNavigate();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/busca", search: { q } });
      }}
      className="flex"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pesquisar anime, mangá ou artista…"
        className="w-full min-w-0 border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button className="bg-primary px-4 text-sm font-bold uppercase text-primary-foreground">Ir</button>
    </form>
  );
}

export function Header() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="font-display text-2xl tracking-tight">
          Anime<span className="text-primary">BR</span>
        </Link>
        <nav className="flex gap-4 text-sm font-bold uppercase">
          <Link to="/lista" search={{ letra: "" }} className="hover:text-primary">Lista A-Z</Link>
          <Link to="/lista" search={{ letra: "", ordem: "views" }} className="hover:text-primary">Mais assistidos</Link>
        </nav>
        <div className="ml-auto w-full max-w-xs"><SearchBox /></div>
        <div className="flex items-center gap-3 text-sm font-bold">
          {isAdmin && <Link to="/admin" className="text-accent hover:underline">Admin</Link>}
          {user ? (
            <>
              <Link to="/conta" className="hover:text-primary">Minha conta</Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate({ to: "/", replace: true });
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Sair
              </button>
            </>
          ) : (
            <Link to="/auth" className="bg-primary px-3 py-1.5 uppercase text-primary-foreground">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function LetterBar({ active }: { active?: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      <Link to="/lista" search={{ letra: "" }} className={`letter ${!active ? "letter-active" : ""}`}>ALL</Link>
      {LETTERS.map((l) => (
        <Link key={l} to="/lista" search={{ letra: l }} className={`letter ${active === l ? "letter-active" : ""}`}>{l}</Link>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <LetterBar />
        <div className="flex flex-wrap gap-2">
          {Object.entries(tagNames).map(([slug, name]) => (
            <Link key={slug} to="/tag/$slug" params={{ slug }} className="tag-chip">{name}</Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">© 2026 AnimeBR — catálogo de anime e mangá para todos os públicos.</p>
      </div>
    </footer>
  );
}

export function WorkCard({ work, eager }: { work: Work; eager?: boolean }) {
  return (
    <article className="group">
      <Link to="/g/$slug" params={{ slug: work.slug }} className="relative block overflow-hidden border-2 border-border transition group-hover:border-primary">
        <img src={coverSrc(work.cover)} alt={work.title} width={768} height={1088} loading={eager ? "eager" : "lazy"} className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute right-2 top-2 bg-background/80 px-2 py-0.5 text-xs font-bold">{work.views.toLocaleString("pt")} views</span>
      </Link>
      <div className="mt-3">
        <span className="text-xs font-bold uppercase text-primary">{work.type} · {work.year}</span>
        <h3 className="font-display text-lg leading-tight">
          <Link to="/g/$slug" params={{ slug: work.slug }}>{work.title}</Link>
        </h3>
        <Link to="/artista/$slug" params={{ slug: work.artist_slug }} className="text-sm text-muted-foreground hover:text-foreground">
          {work.artist_name}
        </Link>
      </div>
    </article>
  );
}

export function Grid({ items }: { items: Work[] }) {
  if (!items.length) return <p className="text-muted-foreground">Nenhuma obra encontrada.</p>;
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {items.map((w, i) => <WorkCard key={w.slug} work={w} eager={i < 2} />)}
    </div>
  );
}

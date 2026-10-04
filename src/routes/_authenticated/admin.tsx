import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { slugify, tagNames, coverSrc } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin | AnimeBR" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type W = { id: string; slug: string; title: string; views: number; cover: string };
type Cm = { id: string; body: string; created_at: string; works: { title: string } | null };
type U = { id: string; username: string; created_at: string; admin: boolean };

const input = "w-full border border-border bg-secondary px-3 py-2 outline-none focus:border-primary";

function AdminPage() {
  const { user } = Route.useRouteContext();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"obras" | "comentarios" | "usuarios">("obras");

  useEffect(() => {
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user.id]);

  if (isAdmin === null) return <p className="p-10">A carregar…</p>;
  if (!isAdmin) return <p className="p-10">Esta área é só para administradores.</p>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 font-display text-5xl">Painel Admin</h1>
      <div className="mb-8 flex gap-2">
        {(["obras", "comentarios", "usuarios"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`letter px-4 capitalize ${tab === t ? "letter-active" : ""}`}>
            {t === "comentarios" ? "Comentários" : t === "usuarios" ? "Usuários" : "Obras"}
          </button>
        ))}
      </div>
      {tab === "obras" && <WorksAdmin />}
      {tab === "comentarios" && <CommentsAdmin />}
      {tab === "usuarios" && <UsersAdmin me={user.id} />}
    </main>
  );
}

function WorksAdmin() {
  const [works, setWorks] = useState<W[]>([]);
  const [f, setF] = useState({ title: "", type: "Anime", artist: "", tags: [] as string[], year: 2026, cover: "", synopsis: "" });
  const [msg, setMsg] = useState("");
  const load = () => supabase.from("works").select("id, slug, title, views, cover").order("created_at", { ascending: false }).then(({ data }) => setWorks(data ?? []));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("works").insert({
      slug: slugify(f.title), title: f.title, type: f.type, artist_name: f.artist, artist_slug: slugify(f.artist),
      tags: f.tags, year: f.year, cover: f.cover, synopsis: f.synopsis,
    });
    setMsg(error ? error.message : "Obra adicionada!");
    if (!error) { setF({ ...f, title: "", artist: "", synopsis: "", cover: "", tags: [] }); load(); }
  };

  const addEpisode = async (w: W) => {
    const { data } = await supabase.from("episodes").select("number").eq("work_id", w.id).order("number", { ascending: false }).limit(1);
    const n = (data?.[0]?.number ?? 0) + 1;
    await supabase.from("episodes").insert({ work_id: w.id, number: n, title: `Episódio ${n}` });
    setMsg(`Episódio ${n} adicionado a ${w.title}`);
  };

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
      <form onSubmit={create} className="space-y-3 border border-border bg-card p-5">
        <h2 className="font-display text-xl">Nova obra</h2>
        <input required placeholder="Título" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={input} />
        <div className="flex gap-2">
          <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className={input}>
            <option>Anime</option><option>Mangá</option>
          </select>
          <input type="number" value={f.year} onChange={(e) => setF({ ...f, year: Number(e.target.value) })} className={input} />
        </div>
        <input required placeholder="Artista / estúdio" value={f.artist} onChange={(e) => setF({ ...f, artist: e.target.value })} className={input} />
        <input placeholder="Link da imagem da capa (https://…)" value={f.cover} onChange={(e) => setF({ ...f, cover: e.target.value })} className={input} />
        <textarea placeholder="Sinopse" rows={3} value={f.synopsis} onChange={(e) => setF({ ...f, synopsis: e.target.value })} className={input} />
        <div className="flex flex-wrap gap-2">
          {Object.entries(tagNames).map(([k, n]) => (
            <button type="button" key={k} onClick={() => setF({ ...f, tags: f.tags.includes(k) ? f.tags.filter((t) => t !== k) : [...f.tags, k] })} className={`tag-chip ${f.tags.includes(k) ? "border-primary text-primary" : ""}`}>{n}</button>
          ))}
        </div>
        <button className="bg-primary px-5 py-2 font-bold uppercase text-primary-foreground">Adicionar</button>
        {msg && <p className="text-sm text-accent">{msg}</p>}
      </form>
      <ul className="space-y-2">
        {works.map((w) => (
          <li key={w.id} className="flex items-center gap-3 border border-border p-2">
            <img src={coverSrc(w.cover)} alt="" className="h-14 w-10 object-cover" />
            <Link to="/g/$slug" params={{ slug: w.slug }} className="flex-1 font-bold hover:text-primary">{w.title}</Link>
            <span className="text-xs text-muted-foreground">{w.views} views</span>
            <button onClick={() => addEpisode(w)} className="text-xs font-bold text-accent">+ Episódio</button>
            <button onClick={async () => { if (confirm(`Apagar ${w.title}?`)) { await supabase.from("works").delete().eq("id", w.id); load(); } }} className="text-xs text-destructive">Apagar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CommentsAdmin() {
  const [list, setList] = useState<Cm[]>([]);
  const load = () => supabase.from("comments").select("id, body, created_at, works(title)").order("created_at", { ascending: false }).limit(100).then(({ data }) => setList((data as Cm[]) ?? []));
  useEffect(() => { load(); }, []);
  if (!list.length) return <p className="text-muted-foreground">Sem comentários.</p>;
  return (
    <ul className="space-y-3">
      {list.map((c) => (
        <li key={c.id} className="flex gap-4 border border-border p-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{c.works?.title} · {new Date(c.created_at).toLocaleString("pt")}</p>
            <p>{c.body}</p>
          </div>
          <button onClick={async () => { await supabase.from("comments").delete().eq("id", c.id); load(); }} className="text-xs text-destructive">Apagar</button>
        </li>
      ))}
    </ul>
  );
}

function UsersAdmin({ me }: { me: string }) {
  const [users, setUsers] = useState<U[]>([]);
  const load = async () => {
    const { data: profs } = await supabase.from("profiles").select("id, username, created_at").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    const admins = new Set((roles ?? []).map((r) => r.user_id));
    setUsers((profs ?? []).map((p) => ({ ...p, admin: admins.has(p.id) })));
  };
  useEffect(() => { load(); }, []);
  const toggle = async (u: U) => {
    if (u.admin) await supabase.from("user_roles").delete().eq("user_id", u.id).eq("role", "admin");
    else await supabase.from("user_roles").insert({ user_id: u.id, role: "admin" });
    load();
  };
  return (
    <ul className="space-y-2">
      {users.map((u) => (
        <li key={u.id} className="flex items-center gap-3 border border-border p-3">
          <span className="flex-1 font-bold">{u.username}</span>
          <span className="text-xs text-muted-foreground">desde {new Date(u.created_at).toLocaleDateString("pt")}</span>
          {u.admin && <span className="bg-accent px-2 text-xs font-bold text-accent-foreground">ADMIN</span>}
          {u.id !== me && (
            <button onClick={() => toggle(u)} className="text-xs font-bold text-primary">{u.admin ? "Remover admin" : "Tornar admin"}</button>
          )}
        </li>
      ))}
    </ul>
  );
}

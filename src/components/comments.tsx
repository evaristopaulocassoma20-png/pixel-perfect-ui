import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type C = { id: string; body: string; created_at: string; user_id: string; username: string };

export function Comments({ workId }: { workId: string }) {
  const { user, isAdmin } = useAuth();
  const [list, setList] = useState<C[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("comments").select("id, body, created_at, user_id").eq("work_id", workId).order("created_at", { ascending: false });
    const rows = data ?? [];
    const ids = [...new Set(rows.map((r) => r.user_id))];
    const { data: profs } = ids.length ? await supabase.from("profiles").select("id, username").in("id", ids) : { data: [] };
    const names = new Map((profs ?? []).map((p) => [p.id, p.username]));
    setList(rows.map((r) => ({ ...r, username: names.get(r.user_id) ?? "Usuário" })));
  };
  useEffect(() => {
    load();
  }, [workId]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !body.trim()) return;
    setBusy(true);
    await supabase.from("comments").insert({ work_id: workId, user_id: user.id, body: body.trim().slice(0, 1000) });
    setBody("");
    setBusy(false);
    load();
  };

  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 font-display text-2xl">Comentários ({list.length})</h2>
      {user ? (
        <form onSubmit={send} className="mb-8 space-y-2">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={1000} rows={3} placeholder="Escreva o que achou…" className="w-full border border-border bg-secondary p-3 outline-none focus:border-primary" />
          <button disabled={busy} className="bg-primary px-5 py-2 text-sm font-bold uppercase text-primary-foreground disabled:opacity-50">Comentar</button>
        </form>
      ) : (
        <p className="mb-8 text-muted-foreground">
          <Link to="/auth" className="font-bold text-primary">Entre</Link> para comentar.
        </p>
      )}
      <ul className="space-y-4">
        {list.map((c) => (
          <li key={c.id} className="border-l-2 border-primary pl-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold">{c.username}</span>
              <span className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt")}</span>
              {(user?.id === c.user_id || isAdmin) && (
                <button onClick={async () => { await supabase.from("comments").delete().eq("id", c.id); load(); }} className="ml-auto text-xs text-destructive">Apagar</button>
              )}
            </div>
            <p className="mt-1 whitespace-pre-wrap">{c.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

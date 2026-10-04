import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({ meta: [{ title: "Minha conta | AnimeBR" }, { name: "robots", content: "noindex" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = Route.useRouteContext();
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.from("profiles").select("username").eq("id", user.id).maybeSingle().then(({ data }) => setUsername(data?.username ?? ""));
  }, [user.id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("profiles").upsert({ id: user.id, username: username.trim().slice(0, 40) });
    setMsg(error ? error.message : "Guardado!");
  };

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 font-display text-4xl">Minha conta</h1>
      <p className="mb-8 text-muted-foreground">{user.email}</p>
      <form onSubmit={save} className="space-y-3">
        <label className="block text-sm font-bold">Nome de usuário</label>
        <input required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-border bg-secondary px-3 py-2 outline-none focus:border-primary" />
        <button className="bg-primary px-5 py-2 font-bold uppercase text-primary-foreground">Guardar</button>
        {msg && <p className="text-sm text-accent">{msg}</p>}
      </form>
    </main>
  );
}

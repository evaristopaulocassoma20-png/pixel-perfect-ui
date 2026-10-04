import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar | AnimeBR" }, { name: "description", content: "Entre ou crie a sua conta no AnimeBR." }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { username } } });
      setMsg(error ? error.message : "Conta criada! Confirme pelo link enviado ao seu email.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else navigate({ to: "/" });
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setMsg(String(r.error.message ?? r.error));
    else if (!r.redirected) navigate({ to: "/" });
  };

  const input = "w-full border border-border bg-secondary px-3 py-2 outline-none focus:border-primary";
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 font-display text-4xl">{mode === "in" ? "Entrar" : "Criar conta"}</h1>
      <button onClick={google} className="mb-6 w-full border-2 border-foreground py-2 font-bold">Continuar com Google</button>
      <form onSubmit={submit} className="space-y-3">
        {mode === "up" && <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nome de usuário" className={input} />}
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={input} />
        <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className={input} />
        <button className="w-full bg-primary py-2 font-bold uppercase text-primary-foreground">{mode === "in" ? "Entrar" : "Criar conta"}</button>
      </form>
      {msg && <p className="mt-4 text-sm text-accent">{msg}</p>}
      <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-6 text-sm text-muted-foreground underline">
        {mode === "in" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
      </button>
    </main>
  );
}

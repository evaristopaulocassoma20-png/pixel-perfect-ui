import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function pub() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const COLS = "id, slug, title, type, artist_slug, artist_name, tags, year, cover, synopsis, views, created_at";

export const listWorks = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z
      .object({
        sort: z.enum(["recent", "views", "title"]).default("recent"),
        tag: z.string().optional(),
        artist: z.string().optional(),
        letter: z.string().optional(),
        q: z.string().optional(),
        limit: z.number().default(48),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    let q = pub().from("works").select(COLS);
    if (data.tag) q = q.contains("tags", [data.tag]);
    if (data.artist) q = q.eq("artist_slug", data.artist);
    if (data.letter) {
      q = data.letter === "#" ? q.not("title", "~*", "^[a-z]") : q.ilike("title", `${data.letter}%`);
    }
    if (data.q) {
      const s = data.q.replace(/[%,()]/g, " ").slice(0, 80);
      q = q.or(`title.ilike.%${s}%,artist_name.ilike.%${s}%,synopsis.ilike.%${s}%`);
    }
    q =
      data.sort === "views"
        ? q.order("views", { ascending: false })
        : data.sort === "title"
          ? q.order("title")
          : q.order("created_at", { ascending: false });
    const { data: rows, error } = await q.limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const latestEpisodes = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await pub()
    .from("episodes")
    .select("id, number, title, created_at, works(slug, title, cover)")
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getWork = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = pub();
    const { data: work, error } = await sb.from("works").select(COLS).eq("slug", data.slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!work) return null;
    const { data: eps } = await sb.from("episodes").select("id, number, title, created_at").eq("work_id", work.id).order("number");
    return { work, episodes: eps ?? [] };
  });

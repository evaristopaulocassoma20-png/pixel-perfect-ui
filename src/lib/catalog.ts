import c1 from "@/assets/cover-1.jpg";
import c2 from "@/assets/cover-2.jpg";
import c3 from "@/assets/cover-3.jpg";
import c4 from "@/assets/cover-4.jpg";

const local: Record<string, string> = { "cover-1": c1, "cover-2": c2, "cover-3": c3, "cover-4": c4 };
export const coverSrc = (cover: string) => local[cover] ?? (cover || c1);

export type Work = {
  id: string;
  slug: string;
  title: string;
  type: string;
  artist_slug: string;
  artist_name: string;
  tags: string[];
  year: number;
  cover: string;
  synopsis: string;
  views: number;
  created_at: string;
};

export const tagNames: Record<string, string> = {
  acao: "Ação",
  fantasia: "Fantasia",
  "slice-of-life": "Slice of Life",
  mecha: "Mecha",
  misterio: "Mistério",
  "ficcao-cientifica": "Ficção Científica",
  comedia: "Comédia",
  romance: "Romance",
  esportes: "Esportes",
};

export const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

import c1 from "@/assets/cover-1.jpg";
import c2 from "@/assets/cover-2.jpg";
import c3 from "@/assets/cover-3.jpg";
import c4 from "@/assets/cover-4.jpg";

export type Work = {
  slug: string;
  title: string;
  type: "Mangá" | "Anime";
  artist: string;
  tags: string[];
  year: number;
  cover: string;
  synopsis: string;
  chapters: number;
};

export const artists: Record<string, string> = {
  "aki-moriyama": "Aki Moriyama",
  "yuna-hoshi": "Yuna Hoshi",
  "studio-kaze": "Studio Kaze",
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

export const works: Work[] = [
  { slug: "lamina-do-crepusculo", title: "Lâmina do Crepúsculo", type: "Mangá", artist: "aki-moriyama", tags: ["acao", "fantasia"], year: 2025, cover: c1, chapters: 42, synopsis: "Uma espadachim solitária patrulha os telhados de Neo-Kyoto para proteger quem não pode lutar." },
  { slug: "padaria-da-raposa", title: "A Padaria da Raposa", type: "Mangá", artist: "yuna-hoshi", tags: ["slice-of-life", "fantasia", "comedia"], year: 2024, cover: c2, chapters: 27, synopsis: "Uma jovem padeira divide o forno com um espírito-raposa que adora pão doce." },
  { slug: "titas-do-oceano", title: "Titãs do Oceano", type: "Anime", artist: "studio-kaze", tags: ["mecha", "ficcao-cientifica", "acao"], year: 2026, cover: c3, chapters: 24, synopsis: "Num mundo engolido pelo mar, um rapaz pilota o último gigante de aço." },
  { slug: "chuva-em-shibuya", title: "Chuva em Shibuya", type: "Mangá", artist: "aki-moriyama", tags: ["misterio", "romance"], year: 2023, cover: c4, chapters: 58, synopsis: "Dois estudantes resolvem casos que a polícia esqueceu, sempre em noites de chuva." },
];

export const getWork = (slug: string) => works.find((w) => w.slug === slug);
export const worksByTag = (tag: string) => works.filter((w) => w.tags.includes(tag));
export const worksByArtist = (a: string) => works.filter((w) => w.artist === a);
export const relatedTags = (tag: string) => {
  const s = new Set<string>();
  worksByTag(tag).forEach((w) => w.tags.forEach((t) => t !== tag && s.add(t)));
  return [...s];
};

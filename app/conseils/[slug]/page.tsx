import { notFound } from "next/navigation";
import { PublicShell } from "@/components/sx";
import { GuideArticle } from "@/components/editorial/guide-article";
import { guides } from "@/lib/guides";
import { pageMeta } from "@/lib/seo";
/* Guide (lot 9) : métadonnées de lib/guides.ts (seoTitle, seoDescription, og:type article avec dates
   réelles), notFound() pour un slug inconnu (vraie 404, voir vps/overlay/next.config.ts). */
export function generateStaticParams() { return guides.map((g) => ({ slug: g.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const g = guides.find((x) => x.slug === slug);
  return g ? pageMeta(g.seoTitle, g.seoDescription, `/conseils/${g.slug}`, { type: "article", publishedTime: g.datePublished, modifiedTime: g.dateModified }) : {};
}
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const g = guides.find((x) => x.slug === slug);
  if (!g) notFound();
  return <PublicShell><GuideArticle guide={g} /></PublicShell>;
}

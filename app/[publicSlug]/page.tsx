import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicSeoPageView } from "@/components/marketing/public-seo-page";
import {
  getPublicPageMetadata,
  publicSeoPages,
  type PublicSeoPageKey,
} from "@/config/public-site";

type PublicSlugPageProps = {
  params: Promise<{ publicSlug: string }>;
};

const dynamicPublicKeys = Object.keys(publicSeoPages).filter(
  (key) => key !== "contact",
) as PublicSeoPageKey[];

export const dynamicParams = false;

export function generateStaticParams() {
  return dynamicPublicKeys.map((publicSlug) => ({ publicSlug }));
}

function getPageKey(publicSlug: string): PublicSeoPageKey | null {
  return dynamicPublicKeys.includes(publicSlug as PublicSeoPageKey)
    ? (publicSlug as PublicSeoPageKey)
    : null;
}

export async function generateMetadata({
  params,
}: PublicSlugPageProps): Promise<Metadata> {
  const { publicSlug } = await params;
  const pageKey = getPageKey(publicSlug);

  if (!pageKey) {
    return {};
  }

  return getPublicPageMetadata(pageKey);
}

export default async function PublicSlugPage({ params }: PublicSlugPageProps) {
  const { publicSlug } = await params;
  const pageKey = getPageKey(publicSlug);

  if (!pageKey) {
    notFound();
  }

  return <PublicSeoPageView page={publicSeoPages[pageKey]} />;
}

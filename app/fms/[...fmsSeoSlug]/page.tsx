import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FmsSeoLandingPage } from "@/components/fms/fms-acquisition-page";
import {
  fmsAcquisitionKeywords,
  getFmsSeoPageBySlug,
  fmsSeoPages,
} from "@/config/fms-acquisition";

type FmsSeoPageRouteProps = {
  params: Promise<{
    fmsSeoSlug: string[];
  }>;
};

export function generateStaticParams() {
  return fmsSeoPages.map((page) => ({
    fmsSeoSlug: page.canonicalPath.replace("/fms/", "").split("/"),
  }));
}

export async function generateMetadata({
  params,
}: FmsSeoPageRouteProps): Promise<Metadata> {
  const { fmsSeoSlug } = await params;
  const page = getFmsSeoPageBySlug(fmsSeoSlug);

  if (!page) {
    return {};
  }

  return {
    alternates: {
      canonical: page.canonicalPath,
    },
    description: page.description,
    openGraph: {
      description: page.description,
      locale: "zh_CN",
      title: page.title,
      type: "website",
      url: page.canonicalPath,
    },
    keywords: [...fmsAcquisitionKeywords],
    title: page.title,
    twitter: {
      card: "summary",
      description: page.description,
      title: page.title,
    },
  };
}

export default async function FmsSeoPage({ params }: FmsSeoPageRouteProps) {
  const { fmsSeoSlug } = await params;
  const page = getFmsSeoPageBySlug(fmsSeoSlug);

  if (!page) {
    notFound();
  }

  return <FmsSeoLandingPage page={page} />;
}

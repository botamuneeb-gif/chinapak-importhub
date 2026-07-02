import type { Metadata } from "next";
import { PortalPlaceholder } from "@/components/layout/portal-placeholder";

export const metadata: Metadata = {
  title: "Factory Portal | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function FactoryPage() {
  return (
    <PortalPlaceholder
      audience="Future Chinese-first factory portal. This route stays unlinked and inactive until factory access is intentionally activated."
      lang="zh-CN"
      notes={[
        "工厂数据库目前必须保持内部和私密。",
        "Future factory users must not see importer private contact details.",
        "Activate only after admin approval, auth, and data boundaries are ready.",
      ]}
      portalName="Factory Portal"
      status="Factory portal hidden until future activation"
    />
  );
}

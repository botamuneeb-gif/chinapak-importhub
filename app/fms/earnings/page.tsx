import type { Metadata } from "next";
import { EarningsSummary } from "@/components/fms/earnings-summary";
import { FmsShell } from "@/components/fms/fms-shell";

export const metadata: Metadata = {
  title: "FMS Earnings | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function FmsEarningsPage() {
  return (
    <FmsShell
      description="Track placeholder balances, tier ranges, and admin-approved payout status. 收入以管理员审核里程碑为准。"
      title="Earnings"
    >
      <EarningsSummary />

      <div className="mt-6 rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
        FMS earnings are credited after admin verifies completed milestones and
        project quality. Payout happens on the agreed payout schedule.
      </div>
    </FmsShell>
  );
}

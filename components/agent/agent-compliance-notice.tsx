type AgentComplianceNoticeProps = {
  rules: readonly string[];
  title?: string;
};

export function AgentComplianceNotice({
  rules,
  title = "Compliance reminder",
}: AgentComplianceNoticeProps) {
  return (
    <aside className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
      <h2 className="text-xl font-bold">{title}</h2>
      <ul className="mt-4 grid gap-3 text-sm leading-7">
        {rules.map((rule) => (
          <li className="border-s-4 border-brand-gold ps-3" key={rule}>
            {rule}
          </li>
        ))}
      </ul>
    </aside>
  );
}

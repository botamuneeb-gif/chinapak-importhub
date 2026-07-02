type TrustCardProps = {
  body: string;
  title: string;
};

export function TrustCard({ body, title }: TrustCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-brand-muted">{body}</p>
    </article>
  );
}

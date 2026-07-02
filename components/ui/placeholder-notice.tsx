type PlaceholderNoticeProps = {
  body: string;
  title: string;
};

export function PlaceholderNotice({ body, title }: PlaceholderNoticeProps) {
  return (
    <aside className="rounded-lg border border-dashed border-brand-gold bg-white p-4 text-start shadow-sm">
      <p className="font-semibold text-brand-navy">{title}</p>
      <p className="mt-2 text-sm leading-7 text-brand-muted">{body}</p>
    </aside>
  );
}

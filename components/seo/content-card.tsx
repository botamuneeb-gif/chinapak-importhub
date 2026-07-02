import Link from "next/link";

type ContentCardProps = {
  body: string;
  href: string;
  title: string;
};

export function ContentCard({ body, href, title }: ContentCardProps) {
  return (
    <Link
      className="group block rounded-lg border border-slate-200 bg-white p-5 no-underline shadow-sm transition hover:border-brand-emerald hover:shadow-md"
      href={href}
    >
      <h3 className="text-xl font-bold leading-8 text-brand-navy group-hover:text-brand-emerald">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-brand-muted">{body}</p>
      <p className="mt-4 text-sm font-bold text-brand-emerald">Read guide</p>
    </Link>
  );
}

type LanguageSupportNoteProps = {
  children: string;
  title?: string;
};

export function LanguageSupportNote({
  children,
  title = "Language note",
}: LanguageSupportNoteProps) {
  return (
    <div className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-brand-navy">
      <p className="font-bold">{title}</p>
      <p className="mt-2 text-sm leading-7">{children}</p>
    </div>
  );
}

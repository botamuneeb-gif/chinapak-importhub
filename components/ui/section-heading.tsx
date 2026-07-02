import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  align?: "start" | "center";
  eyebrow?: string;
  intro?: string;
  title: string;
};

export function SectionHeading({
  align = "start",
  eyebrow,
  intro,
  title,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold text-brand-emerald">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-bold leading-tight text-brand-navy sm:text-3xl">
        {title}
      </h2>
      {intro ? (
        <p className="mt-4 text-base leading-8 text-brand-muted sm:text-lg">
          {intro}
        </p>
      ) : null}
    </div>
  );
}

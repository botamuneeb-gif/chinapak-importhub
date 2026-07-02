import type { ReactNode } from "react";

type WizardStepProps = {
  children: ReactNode;
  copy?: string;
  heading: string;
  stepLabel: string;
};

export function WizardStep({
  children,
  copy,
  heading,
  stepLabel,
}: WizardStepProps) {
  return (
    <section
      aria-labelledby="wizard-step-heading"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <p className="text-sm font-semibold text-brand-emerald">{stepLabel}</p>
      <h1
        className="mt-3 text-2xl font-bold leading-tight text-brand-navy sm:text-3xl"
        id="wizard-step-heading"
      >
        {heading}
      </h1>
      {copy ? (
        <p className="mt-3 text-base leading-8 text-brand-muted">{copy}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

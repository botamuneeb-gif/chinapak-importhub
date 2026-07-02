import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/page-hero";
import { PlaceholderNotice } from "@/components/ui/placeholder-notice";

type AuthPlaceholderProps = {
  mode: "login" | "signup";
};

export function AuthPlaceholder({ mode }: AuthPlaceholderProps) {
  const isSignup = mode === "signup";

  return (
    <main>
      <PageHero
        eyebrow="Account access"
        intro="Supabase auth is not connected yet. This screen reserves the route and form structure for future role-aware access."
        title={isSignup ? "اکاؤنٹ بنانے کا صفحہ" : "لاگ اِن کا صفحہ"}
      />

      <section className="bg-brand-background">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[0.9fr_1.1fr]">
          <PlaceholderNotice
            title="Auth placeholder only"
            body="No credentials are submitted, stored, or verified from this screen. Future auth must protect importer, FMS, agent, admin, and super admin routes separately."
          />

          <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-label={isSignup ? "Sign up placeholder form" : "Login placeholder form"}>
            <div className="grid gap-4">
              {isSignup ? (
                <div>
                  <label className="block text-sm font-semibold text-brand-navy" htmlFor="name">
                    نام
                  </label>
                  <input
                    className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-brand-muted"
                    disabled
                    id="name"
                    placeholder="Full name"
                    type="text"
                  />
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-semibold text-brand-navy" htmlFor="email">
                  ای میل
                </label>
                <input
                  className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-brand-muted"
                  disabled
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-navy" htmlFor="password">
                  پاس ورڈ
                </label>
                <input
                  className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-brand-muted"
                  disabled
                  id="password"
                  placeholder="Password"
                  type="password"
                />
              </div>

              <Button disabled type="submit">
                {isSignup ? "Create account later" : "Login later"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

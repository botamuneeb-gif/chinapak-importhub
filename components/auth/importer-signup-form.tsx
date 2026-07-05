"use client";

import { useState, useTransition } from "react";
import { signupImporterAction } from "@/app/auth/actions";
import { AuthActionButton } from "@/components/auth/auth-action-button";
import { AuthErrorMessage } from "@/components/auth/auth-error-message";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthModeNotice } from "@/components/auth/auth-mode-notice";
import { businessTypes } from "@/config/auth-roles";

export function ImporterSignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneWhatsapp, setPhoneWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    startTransition(async () => {
      const result = await signupImporterAction({
        businessType,
        city,
        email,
        fullName,
        password,
        phoneWhatsapp,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setSuccessMessage(result.message);
      setPassword("");
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSignup}>
      <AuthModeNotice title="Importer signup only">
        <p>
          This public form creates importer accounts only. FMS, Agent, Admin,
          Super Admin, and Factory accounts require invitation or internal setup.
        </p>
      </AuthModeNotice>
      <AuthInput
        autoComplete="name"
        id="signup-full-name"
        label="Full name"
        onChange={(event) => setFullName(event.target.value)}
        placeholder="Your full name"
        required
        value={fullName}
      />
      <AuthInput
        autoComplete="email"
        id="signup-email"
        label="Email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
        type="email"
        value={email}
      />
      <AuthInput
        autoComplete="new-password"
        id="signup-password"
        label="Password"
        minLength={8}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="At least 8 characters"
        required
        type="password"
        value={password}
      />
      <AuthInput
        autoComplete="tel"
        id="signup-phone"
        label="Phone/WhatsApp"
        onChange={(event) => setPhoneWhatsapp(event.target.value)}
        placeholder="+92 300 0000000"
        type="tel"
        value={phoneWhatsapp}
      />
      <AuthInput
        autoComplete="address-level2"
        id="signup-city"
        label="City"
        onChange={(event) => setCity(event.target.value)}
        placeholder="Lahore, Karachi, Faisalabad..."
        required
        value={city}
      />
      <div>
        <label
          className="block text-sm font-semibold text-brand-navy"
          htmlFor="business-type"
        >
          Business type
        </label>
        <select
          className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text focus:border-brand-emerald focus:outline-none focus:ring-2 focus:ring-brand-emerald/20"
          id="business-type"
          onChange={(event) => setBusinessType(event.target.value)}
          required
          value={businessType}
        >
          <option value="">Select business type</option>
          {businessTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <AuthErrorMessage message={error} />
      {successMessage ? (
        <div className="rounded-lg border border-brand-emerald bg-emerald-50 p-4 text-sm leading-7 text-brand-navy">
          {successMessage} After verification, you can log in and start your
          Import Project.
        </div>
      ) : null}
      <AuthActionButton disabled={isPending} type="submit">
        {isPending ? "Creating account..." : "Create account and verify email"}
      </AuthActionButton>
    </form>
  );
}

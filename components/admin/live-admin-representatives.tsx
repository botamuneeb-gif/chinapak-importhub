"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createRepresentativeAction,
  listAdminRepresentativesAction,
  regenerateRepresentativeCodeAction,
  setRepresentativeStatusAction,
  updateRepresentativeAction,
  type AdminRepresentativeItem,
  type RepresentativeFormInput,
} from "@/app/admin/representatives/actions";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type RepresentativeStatus =
  Database["public"]["Enums"]["representative_status"];

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please login as admin again.");
  }

  return session.access_token;
}

function formInputFromForm(form: HTMLFormElement): RepresentativeFormInput {
  const formData = new FormData(form);

  return {
    city: String(formData.get("city") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    internalNotes: String(formData.get("internalNotes") ?? ""),
    province: String(formData.get("province") ?? ""),
    publicNotes: String(formData.get("publicNotes") ?? ""),
    representativeStatus: String(
      formData.get("representativeStatus") ?? "active",
    ) as RepresentativeStatus,
    roleTitle: String(formData.get("roleTitle") ?? ""),
    serviceArea: String(formData.get("serviceArea") ?? ""),
  };
}

function AdminRepresentativeNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-brand-gold/40 bg-brand-gold/10 p-4 text-sm font-semibold leading-6 text-brand-navy">
      {children}
    </div>
  );
}

function Field({
  defaultValue,
  label,
  name,
  required = false,
}: {
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-brand-navy">
      {label}
      <input
        className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-brand-text"
        defaultValue={defaultValue}
        name={name}
        required={required}
      />
    </label>
  );
}

function TextareaField({
  defaultValue,
  label,
  name,
}: {
  defaultValue?: string;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-brand-navy">
      {label}
      <textarea
        className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal leading-6 text-brand-text"
        defaultValue={defaultValue}
        name={name}
      />
    </label>
  );
}

export function LiveAdminRepresentatives() {
  const [items, setItems] = useState<AdminRepresentativeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [mutatingId, setMutatingId] = useState("");

  const loadRepresentatives = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await listAdminRepresentativesAction(accessToken);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setItems(result.data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Representative directory could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRepresentatives();
  }, [loadRepresentatives]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) =>
      [
        item.fullName,
        item.displayName,
        item.verificationCode,
        item.city,
        item.province,
        item.serviceArea,
        item.representativeStatusLabel,
        item.codeStatusLabel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, search]);

  async function createRepresentative(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await createRepresentativeAction(
        accessToken,
        formInputFromForm(event.currentTarget),
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      event.currentTarget.reset();
      setItems(result.data);
      setMessage("Representative created with a unique verification code.");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Representative could not be created.",
      );
    }
  }

  async function updateRepresentative(
    event: FormEvent<HTMLFormElement>,
    representativeId: string,
  ) {
    event.preventDefault();
    setMutatingId(representativeId);
    setError("");
    setMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await updateRepresentativeAction(
        accessToken,
        representativeId,
        formInputFromForm(event.currentTarget),
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setItems(result.data);
      setMessage("Representative details updated.");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Representative could not be updated.",
      );
    } finally {
      setMutatingId("");
    }
  }

  async function setStatus(
    representativeId: string,
    nextStatus: RepresentativeStatus,
  ) {
    setMutatingId(representativeId);
    setError("");
    setMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await setRepresentativeStatusAction(
        accessToken,
        representativeId,
        nextStatus,
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setItems(result.data);
      setMessage(`Representative marked ${nextStatus}.`);
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Representative status could not be updated.",
      );
    } finally {
      setMutatingId("");
    }
  }

  async function regenerateCode(representativeId: string) {
    setMutatingId(representativeId);
    setError("");
    setMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await regenerateRepresentativeCodeAction(
        accessToken,
        representativeId,
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setItems(result.data);
      setMessage("Representative verification code regenerated.");
    } catch (regenerateError) {
      setError(
        regenerateError instanceof Error
          ? regenerateError.message
          : "Representative code could not be regenerated.",
      );
    } finally {
      setMutatingId("");
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Verification code copied.");
    } catch {
      setMessage(`Verification code: ${code}`);
    }
  }

  if (isLoading) {
    return (
      <AdminRepresentativeNotice>
        Loading representative records...
      </AdminRepresentativeNotice>
    );
  }

  return (
    <div className="grid gap-6">
      <AdminRepresentativeNotice>
        Representatives are added manually by admin. Public verification returns
        only display name, area, role, active status, public notes, and a safety
        warning. Private phone, email, CNIC, address, bank details, and internal
        notes are never returned publicly.
      </AdminRepresentativeNotice>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          {message}
        </p>
      ) : null}

      <form
        className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={createRepresentative}
      >
        <div>
          <h2 className="text-xl font-bold text-brand-navy">
            Add Representative
          </h2>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            No login account is required. The system generates the verification
            code after save.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Full name" name="fullName" required />
          <Field label="Public display name" name="displayName" />
          <Field
            defaultValue="ChinaPak ImportHub Representative"
            label="Role title"
            name="roleTitle"
          />
          <Field label="Province" name="province" />
          <Field label="City" name="city" />
          <Field label="Service area" name="serviceArea" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextareaField label="Public notes" name="publicNotes" />
          <TextareaField label="Internal notes" name="internalNotes" />
        </div>
        <label className="grid gap-1 text-sm font-semibold text-brand-navy md:max-w-xs">
          Initial status
          <select
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-brand-text"
            defaultValue="active"
            name="representativeStatus"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <div>
          <button
            className="min-h-11 rounded-lg bg-brand-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-emerald"
            type="submit"
          >
            Create Representative
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="grid gap-2 text-sm font-semibold text-brand-navy">
          Search representatives
          <input
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-brand-text"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, code, city, province, status"
            value={search}
          />
        </label>
      </div>

      {filteredItems.length === 0 ? (
        <AdminRepresentativeNotice>
          No representative records match the current search.
        </AdminRepresentativeNotice>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={item.id}
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-emerald">
                    {item.verificationCode}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-brand-navy">
                    {item.displayName}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    Internal name: {item.fullName} | {item.roleTitle}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-brand-muted">
                    {item.city}, {item.province} | Service area:{" "}
                    {item.serviceArea}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminStatusBadge
                    status={`Representative ${item.representativeStatusLabel}`}
                  />
                  <AdminStatusBadge status={`Code ${item.codeStatusLabel}`} />
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-brand-background p-3">
                  <p className="font-bold text-brand-navy">Created</p>
                  <p className="mt-1 text-brand-muted">{item.createdAt}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-brand-background p-3">
                  <p className="font-bold text-brand-navy">Activated</p>
                  <p className="mt-1 text-brand-muted">{item.activatedAt}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-brand-background p-3">
                  <p className="font-bold text-brand-navy">Suspended</p>
                  <p className="mt-1 text-brand-muted">{item.suspendedAt}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="min-h-10 rounded-lg border border-brand-navy bg-white px-3 py-2 text-xs font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald"
                  onClick={() => copyCode(item.verificationCode)}
                  type="button"
                >
                  Copy Code
                </button>
                <button
                  className="min-h-10 rounded-lg bg-brand-emerald px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:bg-slate-400"
                  disabled={mutatingId === item.id}
                  onClick={() => setStatus(item.id, "active")}
                  type="button"
                >
                  Reactivate
                </button>
                <button
                  className="min-h-10 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  disabled={mutatingId === item.id}
                  onClick={() => setStatus(item.id, "suspended")}
                  type="button"
                >
                  Suspend
                </button>
                <button
                  className="min-h-10 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  disabled={mutatingId === item.id}
                  onClick={() => setStatus(item.id, "archived")}
                  type="button"
                >
                  Archive
                </button>
                <button
                  className="min-h-10 rounded-lg border border-brand-gold bg-brand-gold/10 px-3 py-2 text-xs font-bold text-brand-navy transition hover:bg-brand-gold/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                  disabled={mutatingId === item.id}
                  onClick={() => regenerateCode(item.id)}
                  type="button"
                >
                  Regenerate Code
                </button>
              </div>

              <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <summary className="cursor-pointer text-sm font-bold text-brand-navy">
                  Edit safe fields and view attempts
                </summary>
                <form
                  className="mt-4 grid gap-4"
                  onSubmit={(event) => updateRepresentative(event, item.id)}
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Field
                      defaultValue={item.fullName}
                      label="Full name"
                      name="fullName"
                      required
                    />
                    <Field
                      defaultValue={item.displayName}
                      label="Public display name"
                      name="displayName"
                    />
                    <Field
                      defaultValue={item.roleTitle}
                      label="Role title"
                      name="roleTitle"
                    />
                    <Field
                      defaultValue={item.province === "Not set" ? "" : item.province}
                      label="Province"
                      name="province"
                    />
                    <Field
                      defaultValue={item.city === "Not set" ? "" : item.city}
                      label="City"
                      name="city"
                    />
                    <Field
                      defaultValue={
                        item.serviceArea === "Not set" ? "" : item.serviceArea
                      }
                      label="Service area"
                      name="serviceArea"
                    />
                  </div>
                  <input
                    name="representativeStatus"
                    type="hidden"
                    value={item.representativeStatus}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextareaField
                      defaultValue={item.publicNotes}
                      label="Public notes"
                      name="publicNotes"
                    />
                    <TextareaField
                      defaultValue={item.internalNotes}
                      label="Internal notes"
                      name="internalNotes"
                    />
                  </div>
                  <div>
                    <button
                      className="min-h-10 rounded-lg bg-brand-navy px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-emerald disabled:cursor-not-allowed disabled:bg-slate-400"
                      disabled={mutatingId === item.id}
                      type="submit"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>

                <div className="mt-5">
                  <p className="text-sm font-bold text-brand-navy">
                    Recent verification attempts
                  </p>
                  {item.recentAttempts.length === 0 ? (
                    <p className="mt-2 text-sm text-brand-muted">
                      No verification attempts recorded yet.
                    </p>
                  ) : (
                    <ul className="mt-2 grid gap-2 text-sm text-brand-muted">
                      {item.recentAttempts.map((attempt) => (
                        <li
                          className="rounded-lg border border-slate-200 bg-white p-3"
                          key={`${item.id}-${attempt.createdAt}-${attempt.codeEntered}`}
                        >
                          {attempt.createdAt}: {attempt.result} for{" "}
                          {attempt.codeEntered}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

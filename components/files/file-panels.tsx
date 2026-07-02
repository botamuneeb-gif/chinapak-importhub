"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  createFileSignedUrlAction,
  listEvidenceForAdminAction,
  listFmsAssignmentFilesAction,
  listImporterProjectFilesAction,
  reviewEvidenceFileAction,
  uploadFmsEvidenceFileAction,
  uploadImporterProjectFileAction,
  type ManagedFileAsset,
  type ReviewEvidenceInput,
} from "@/app/files/actions";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type SubmissionOption = {
  factoryDisplayName: string;
  submissionCode: string;
};

const evidenceTypes = [
  "Product photos",
  "Factory photos",
  "Factory videos",
  "Quotation documents",
  "Certificates",
  "Catalog images",
  "Packaging photos",
] as const;

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please login again before managing files.");
  }

  return session.access_token;
}

function FileRows({
  emptyMessage,
  files,
  onPreview,
}: {
  emptyMessage: string;
  files: ManagedFileAsset[];
  onPreview: (fileId: string) => void;
}) {
  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm font-semibold text-brand-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {files.map((file) => (
        <article
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          key={file.id}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-bold text-brand-navy">{file.fileName}</h3>
              <p className="mt-1 text-sm leading-6 text-brand-muted">
                {file.fileSize} · {file.mimeType} · {file.sourceRole}
              </p>
              <p className="mt-1 text-xs font-semibold text-brand-muted">
                {file.projectCode} · {file.assignmentCode} · {file.createdAt}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatusBadge status={file.reviewStatus} />
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-brand-muted">
                {file.visibilityScope}
              </span>
            </div>
          </div>
          <button
            className="mt-4 min-h-10 rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald"
            onClick={() => onPreview(file.id)}
            type="button"
          >
            Preview / download
          </button>
        </article>
      ))}
    </div>
  );
}

export function ImporterProjectFilesPanel({
  projectCode,
}: {
  projectCode: string;
}) {
  const [files, setFiles] = useState<ManagedFileAsset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [purpose, setPurpose] = useState("product_reference");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadFiles = useCallback(async () => {
    const accessToken = await getAccessToken();
    const result = await listImporterProjectFilesAction(accessToken, projectCode);

    if (!result.ok) {
      throw new Error(result.message);
    }

    setFiles(result.data);
  }, [projectCode]);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setIsLoading(true);
      setError("");

      try {
        await loadFiles();
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Project files could not be loaded.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      isMounted = false;
    };
  }, [loadFiles]);

  function updateFile(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsMutating(true);
    setMessage("");
    setError("");

    try {
      if (!file) {
        setError("Please choose a product reference file first.");
        return;
      }

      const accessToken = await getAccessToken();
      const formData = new FormData();
      formData.set("file", file);
      formData.set("purpose", purpose);
      const result = await uploadImporterProjectFileAction(
        accessToken,
        projectCode,
        formData,
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setFiles(result.data);
      setFile(null);
      setMessage("File uploaded. Admin will review it before wider visibility.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "File upload failed.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function previewFile(fileId: string) {
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await createFileSignedUrlAction(accessToken, fileId);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      window.open(result.data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "File preview could not be opened.",
      );
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">
            Product reference files
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-muted">
            Product photo, specification PDF, packaging sample, ya catalog
            screenshot upload karein. Files private hain aur admin review ke
            baad hi wider visibility milti hai.
          </p>
        </div>
        <span className="w-fit rounded-lg border border-brand-gold bg-amber-50 px-3 py-1 text-xs font-bold text-brand-navy">
          Private by default
        </span>
      </div>

      <form className="mt-5 grid gap-4 md:grid-cols-[1fr_220px_auto]" onSubmit={submitUpload}>
        <label className="block">
          <span className="text-sm font-semibold text-brand-navy">File</span>
          <input
            accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4,.webm,image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm"
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-brand-text"
            onChange={updateFile}
            type="file"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-brand-navy">Purpose</span>
          <select
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-brand-text"
            onChange={(event) => setPurpose(event.target.value)}
            value={purpose}
          >
            <option value="product_reference">Product reference</option>
            <option value="sample_image">Sample image</option>
            <option value="specification_document">Specification document</option>
            <option value="packaging_sample">Packaging sample</option>
            <option value="catalog_screenshot">Catalog screenshot</option>
          </select>
        </label>
        <button
          className="min-h-12 self-end rounded-lg bg-brand-emerald px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
          disabled={isMutating}
          type="submit"
        >
          Upload
        </button>
      </form>

      {(message || error) && (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm font-semibold ${
            error
              ? "border-brand-error bg-red-50 text-brand-error"
              : "border-brand-emerald bg-emerald-50 text-brand-emerald"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="mt-5">
        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-brand-muted">
            Loading project files...
          </div>
        ) : (
          <FileRows
            emptyMessage="No project files uploaded yet."
            files={files}
            onPreview={(fileId) => void previewFile(fileId)}
          />
        )}
      </div>
    </section>
  );
}

export function FmsEvidenceUploadPanel({
  assignmentCode,
  submissions,
}: {
  assignmentCode: string;
  submissions: SubmissionOption[];
}) {
  const [files, setFiles] = useState<ManagedFileAsset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState("Product photos");
  const [submissionCode, setSubmissionCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadFiles = useCallback(async () => {
    const accessToken = await getAccessToken();
    const result = await listFmsAssignmentFilesAction(accessToken, assignmentCode);

    if (!result.ok) {
      throw new Error(result.message);
    }

    setFiles(result.data);
  }, [assignmentCode]);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setIsLoading(true);
      setError("");

      try {
        await loadFiles();
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Evidence files could not be loaded.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      isMounted = false;
    };
  }, [loadFiles]);

  async function submitEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsMutating(true);
    setMessage("");
    setError("");

    try {
      if (!file) {
        setError("Choose an evidence file first.");
        return;
      }

      const accessToken = await getAccessToken();
      const formData = new FormData();
      formData.set("file", file);
      formData.set("evidenceType", evidenceType);
      formData.set("submissionCode", submissionCode);
      const result = await uploadFmsEvidenceFileAction(
        accessToken,
        assignmentCode,
        formData,
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setFiles(result.data);
      setFile(null);
      setMessage("Evidence uploaded to admin review. It is not visible to importer.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Evidence upload failed.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function previewFile(fileId: string) {
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await createFileSignedUrlAction(accessToken, fileId);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      window.open(result.data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Evidence preview could not be opened.",
      );
    }
  }

  return (
    <div>
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
        Evidence goes to ChinaPak ImportHub admin review only. Importers cannot
        see raw FMS files unless admin explicitly releases selected safe files.
        所有证据文件先由管理员审核。
      </div>

      <form className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]" onSubmit={submitEvidence}>
        <label className="block">
          <span className="text-sm font-semibold text-brand-navy">
            Evidence file
          </span>
          <input
            accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4,.webm,image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm"
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-brand-text"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-brand-navy">Type</span>
          <select
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-brand-text"
            onChange={(event) => setEvidenceType(event.target.value)}
            value={evidenceType}
          >
            {evidenceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-brand-navy">
            Factory option
          </span>
          <select
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-brand-text"
            onChange={(event) => setSubmissionCode(event.target.value)}
            value={submissionCode}
          >
            <option value="">Assignment-level evidence</option>
            {submissions.map((submission) => (
              <option
                key={submission.submissionCode}
                value={submission.submissionCode}
              >
                {submission.submissionCode} - {submission.factoryDisplayName}
              </option>
            ))}
          </select>
        </label>
        <button
          className="min-h-12 self-end rounded-lg bg-brand-emerald px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
          disabled={isMutating}
          type="submit"
        >
          Upload
        </button>
      </form>

      {(message || error) && (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm font-semibold ${
            error
              ? "border-brand-error bg-red-50 text-brand-error"
              : "border-brand-emerald bg-emerald-50 text-brand-emerald"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="mt-5">
        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-brand-muted">
            Loading evidence files...
          </div>
        ) : (
          <FileRows
            emptyMessage="No evidence files uploaded yet."
            files={files}
            onPreview={(fileId) => void previewFile(fileId)}
          />
        )}
      </div>
    </div>
  );
}

export function AdminEvidenceReviewPanel() {
  const [files, setFiles] = useState<ManagedFileAsset[]>([]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadFiles = useCallback(async () => {
    const accessToken = await getAccessToken();
    const result = await listEvidenceForAdminAction(accessToken);

    if (!result.ok) {
      throw new Error(result.message);
    }

    setFiles(result.data);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setIsLoading(true);
      setError("");

      try {
        await loadFiles();
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Evidence review could not be loaded.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      isMounted = false;
    };
  }, [loadFiles]);

  async function previewFile(fileId: string) {
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await createFileSignedUrlAction(accessToken, fileId);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      window.open(result.data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Evidence preview could not be opened.",
      );
    }
  }

  async function reviewFile(
    fileId: string,
    decision: ReviewEvidenceInput["decision"],
  ) {
    setIsMutating(true);
    setMessage("");
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await reviewEvidenceFileAction(accessToken, fileId, {
        decision,
        notes,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setFiles(result.data);
      setMessage("Evidence review updated.");
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Evidence review could not be saved.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
        Evidence files are private by default. Release only selected files that
        are safe for the importer and contain no contact details, bank/payment
        instructions, private FMS notes, or sensitive factory records.
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-semibold text-brand-navy" htmlFor="evidence-notes">
          Admin review notes
        </label>
        <textarea
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-brand-text"
          id="evidence-notes"
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional internal note for evidence review or importer-safe release."
          rows={3}
          value={notes}
        />
      </section>

      {(message || error) && (
        <div
          className={`rounded-lg border p-4 text-sm font-semibold ${
            error
              ? "border-brand-error bg-red-50 text-brand-error"
              : "border-brand-emerald bg-emerald-50 text-brand-emerald"
          }`}
        >
          {error || message}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
          Loading evidence review queue...
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm font-semibold text-brand-muted">
          No evidence files have been uploaded yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={file.id}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-brand-navy">
                    {file.fileName}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-brand-muted">
                    {file.projectCode} · {file.assignmentCode} · {file.sourceRole}
                  </p>
                  <p className="text-sm leading-7 text-brand-muted">
                    {file.fileSize} · {file.mimeType} · {file.createdAt}
                  </p>
                  <p className="mt-1 break-all text-xs font-semibold text-brand-muted">
                    {file.bucket}/{file.storagePath}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminStatusBadge status={file.reviewStatus} />
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-brand-muted">
                    {file.visibilityScope}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="min-h-11 rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald"
                  onClick={() => void previewFile(file.id)}
                  type="button"
                >
                  Preview / download
                </button>
                <button
                  className="min-h-11 rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={isMutating}
                  onClick={() => void reviewFile(file.id, "approve_internal")}
                  type="button"
                >
                  Approve internal
                </button>
                <button
                  className="min-h-11 rounded-lg border border-brand-gold bg-amber-50 px-4 py-2 text-sm font-bold text-brand-navy transition hover:border-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={isMutating}
                  onClick={() => void reviewFile(file.id, "mark_admin_only")}
                  type="button"
                >
                  Mark admin-only
                </button>
                <button
                  className="min-h-11 rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={!file.canReleaseToImporter || isMutating}
                  onClick={() => void reviewFile(file.id, "release_to_importer")}
                  type="button"
                >
                  Release to importer
                </button>
                <button
                  className="min-h-11 rounded-lg border border-brand-error bg-red-50 px-4 py-2 text-sm font-bold text-brand-error transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={isMutating}
                  onClick={() => void reviewFile(file.id, "reject")}
                  type="button"
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

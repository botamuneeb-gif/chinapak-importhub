"use client";

import { useEffect, useState } from "react";
import { generateQrSvg } from "@/lib/qr/generate-qr";

type QrCodeProps = {
  label: string;
  size?: number;
  value: string;
};

export function QrCode({ label, size = 148, value }: QrCodeProps) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function renderQr() {
      setError("");

      try {
        const result = await generateQrSvg(value, {
          altLabel: label,
          size,
        });

        if (isMounted) {
          setSvg(result.svg);
        }
      } catch {
        if (isMounted) {
          setSvg("");
          setError("QR unavailable");
        }
      }
    }

    void renderQr();

    return () => {
      isMounted = false;
    };
  }, [label, size, value]);

  return (
    <div
      aria-label={label}
      className="flex aspect-square items-center justify-center rounded-lg border border-slate-200 bg-white p-2"
      role="img"
      style={{ height: size, width: size }}
    >
      {svg ? (
        <div
          className="[&_svg]:h-full [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <span className="text-center text-xs font-bold uppercase tracking-wide text-brand-muted">
          {error || "Generating QR"}
        </span>
      )}
    </div>
  );
}

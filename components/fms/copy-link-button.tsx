"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CopyLinkButtonProps = {
  label?: string;
  value?: string;
};

export function CopyLinkButton({
  label = "复制页面链接",
  value,
}: CopyLinkButtonProps) {
  const [message, setMessage] = useState("");

  async function handleCopy() {
    const text =
      value ?? (typeof window !== "undefined" ? window.location.href : "");

    if (!text) {
      setMessage("链接暂时不可复制");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setMessage("链接已复制，可分享到微信");
    } catch {
      setMessage("请复制浏览器地址栏中的链接");
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleCopy} type="button" variant="outline">
        {label}
      </Button>
      {message ? (
        <p aria-live="polite" className="text-sm font-semibold text-brand-emerald">
          {message}
        </p>
      ) : null}
    </div>
  );
}

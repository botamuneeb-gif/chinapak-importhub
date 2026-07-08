import type { Metadata } from "next";

function readVerificationValue(primaryEnvName: string, legacyEnvName: string) {
  const value =
    process.env[primaryEnvName]?.trim() ||
    process.env[legacyEnvName]?.trim() ||
    "";

  if (
    !value ||
    value.includes("<") ||
    value.includes(">") ||
    value.toLowerCase().includes("placeholder") ||
    value.toLowerCase().includes("replace_me")
  ) {
    return "";
  }

  return value;
}

export const webmasterVerification = {
  baidu: readVerificationValue(
    "BAIDU_SITE_VERIFICATION",
    "NEXT_PUBLIC_BAIDU_SITE_VERIFICATION",
  ),
  bing: readVerificationValue(
    "BING_SITE_VERIFICATION",
    "NEXT_PUBLIC_BING_SITE_VERIFICATION",
  ),
  google: readVerificationValue(
    "GOOGLE_SITE_VERIFICATION",
    "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION",
  ),
} as const;

export function getWebmasterVerificationMetadata(): Metadata["verification"] {
  const other: Record<string, string> = {};

  if (webmasterVerification.baidu) {
    other["baidu-site-verification"] = webmasterVerification.baidu;
  }

  if (webmasterVerification.bing) {
    other["msvalidate.01"] = webmasterVerification.bing;
  }

  return {
    ...(webmasterVerification.google
      ? { google: webmasterVerification.google }
      : {}),
    ...(Object.keys(other).length > 0 ? { other } : {}),
  };
}

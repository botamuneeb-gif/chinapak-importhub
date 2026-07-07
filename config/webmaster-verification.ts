export const webmasterVerification = {
  baidu: process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION?.trim() ?? "",
  bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() ?? "",
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ?? "",
} as const;

export function getWebmasterVerificationMetadata() {
  const other: Record<string, string[]> = {};

  if (webmasterVerification.baidu) {
    other["baidu-site-verification"] = [webmasterVerification.baidu];
  }

  if (webmasterVerification.bing) {
    other["msvalidate.01"] = [webmasterVerification.bing];
  }

  return {
    ...(webmasterVerification.google
      ? { google: webmasterVerification.google }
      : {}),
    ...(Object.keys(other).length > 0 ? { other } : {}),
  };
}

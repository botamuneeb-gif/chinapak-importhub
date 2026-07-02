const REPRESENTATIVE_CODE_PREFIX = "CPIH-REP";

export function normalizeRepresentativeCode(input: string) {
  const alphanumeric = input.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (!alphanumeric) {
    return "";
  }

  if (alphanumeric.startsWith("CPIHREP")) {
    const suffix = alphanumeric.slice("CPIHREP".length);
    return suffix ? `${REPRESENTATIVE_CODE_PREFIX}-${suffix}` : "";
  }

  if (alphanumeric.length === 5) {
    return `${REPRESENTATIVE_CODE_PREFIX}-${alphanumeric}`;
  }

  return alphanumeric;
}

export function isRepresentativeCodeFormat(value: string) {
  return /^CPIH-REP-[A-Z0-9]{5}$/.test(value);
}

export function formatRepresentativeStatus(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

import QRCode from "qrcode";

export type GenerateQrOptions = {
  altLabel?: string;
  darkColor?: string;
  lightColor?: string;
  margin?: number;
  size?: number;
};

export type GeneratedQrSvg = {
  altLabel: string;
  svg: string;
};

export async function generateQrSvg(
  input: string,
  options: GenerateQrOptions = {},
): Promise<GeneratedQrSvg> {
  const value = input.trim();

  if (!value) {
    throw new Error("QR code value is required.");
  }

  const svg = await QRCode.toString(value, {
    color: {
      dark: options.darkColor ?? "#0B1F3A",
      light: options.lightColor ?? "#FFFFFF",
    },
    errorCorrectionLevel: "M",
    margin: options.margin ?? 1,
    type: "svg",
    width: options.size ?? 160,
  });

  return {
    altLabel: options.altLabel ?? "Verification QR code",
    svg,
  };
}
